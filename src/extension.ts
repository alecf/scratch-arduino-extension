const ext: any = {};

// XXX temp
let command;

var PIN_MODE = 0xF4,
    REPORT_DIGITAL = 0xD0,
    REPORT_ANALOG = 0xC0,
    DIGITAL_MESSAGE = 0x90,
    START_SYSEX = 0xF0,
    END_SYSEX = 0xF7,
    QUERY_FIRMWARE = 0x79,
    REPORT_VERSION = 0xF9,
    ANALOG_MESSAGE = 0xE0,
    ANALOG_MAPPING_QUERY = 0x69,
    ANALOG_MAPPING_RESPONSE = 0x6A,
    CAPABILITY_QUERY = 0x6B,
    CAPABILITY_RESPONSE = 0x6C;

var INPUT = 0x00,
    OUTPUT = 0x01,
    ANALOG = 0x02,
    PWM = 0x03,
    SERVO = 0x04,
    SHIFT = 0x05,
    I2C = 0x06,
    ONEWIRE = 0x07,
    STEPPER = 0x08,
    ENCODER = 0x09,
    IGNORE = 0x7F;

var LOW = 0,
    HIGH = 1;

var MAX_DATA_BYTES = 4096;
var MAX_PINS = 128;

var parsingSysex = false,
    waitForData = 0,
    executeMultiByteCommand = 0,
    multiByteChannel = 0,
    sysexBytesRead = 0,
    storedInputData = new Uint8Array(MAX_DATA_BYTES);

var digitalOutputData = new Uint8Array(16),
    digitalInputData = new Uint8Array(16),
    analogInputData = new Uint16Array(16);

var analogChannel = new Uint8Array(MAX_PINS);
var pinModes: number[][] = [];
for (var i = 0; i < 11; i++) pinModes[i] = [];

interface DeviceEntry {
    name: string;
    pin: number;
    val: number;
}

type openParams = ({ stopBits: number, bitRate: number, ctsFlowControl: number });
interface Device {
    id: string;
    send: (s: ArrayBuffer) => void;
    open: (params: openParams,
        callback: () => void) => void;
    set_receive_handler: (callback: (data) => void) => void;
    close: () => void;
}

var majorVersion = 0,
    minorVersion = 0;

var connected = false;
var notifyConnection = false;
var device: Device = null;
var inputData = null;

// TEMPORARY WORKAROUND
// Since _deviceRemoved is not used with Serial devices
// ping device regularly to check connection
var pinging = false;
var pingCount = 0;
var pinger: number = null;



class HWList {
    devices: DeviceEntry[];

    constructor() {
        this.devices = [];
    }


    add(dev: string, pin: number) {
        var newDevice = this.search(dev);
        if (!newDevice) {
            newDevice = { name: dev, pin: pin, val: 0 };
            this.devices.push(newDevice);
        } else {
            newDevice.pin = pin;
            newDevice.val = 0;
        }
    };

    search(dev: string) {
        for (var i = 0; i < this.devices.length; i++) {
            if (this.devices[i].name === dev)
                return this.devices[i];
        }
        return null;
    };
}

var hwList = new HWList();

function init() {

    for (var i = 0; i < 16; i++) {
        var output = new Uint8Array([REPORT_DIGITAL | i, 0x01]);
        device.send(output.buffer);
    }

    queryCapabilities();

    // TEMPORARY WORKAROUND
    // Since _deviceRemoved is not used with Serial devices
    // ping device regularly to check connection
    pinger = setInterval(function () {
        if (pinging) {
            if (++pingCount > 6) {
                clearInterval(pinger);
                pinger = null;
                connected = false;
                if (device) device.close();
                delete devicesSeen[device.id];
                console.log('disconnecting: ', pingCount, 'pings')
                device = null;
                return;
            }
        } else {
            if (!device) {
                clearInterval(pinger);
                pinger = null;
                return;
            }
            queryFirmware();
            pinging = true;
        }
    }, 100);
}

function hasCapability(pin: number, mode: number) {
    if (pinModes[mode].indexOf(pin) > -1)
        return true;
    else
        return false;
}

function queryFirmware() {
    console.log('queryFirmware on ', device.id);
    var output = new Uint8Array([START_SYSEX, QUERY_FIRMWARE, END_SYSEX]);
    device.send(output.buffer);
}

function queryCapabilities() {
    console.log('Querying ' + device.id + ' capabilities');
    var msg = new Uint8Array([
        START_SYSEX, CAPABILITY_QUERY, END_SYSEX]);
    device.send(msg.buffer);
}

function queryAnalogMapping() {
    console.log('Querying ' + device.id + ' analog mapping');
    var msg = new Uint8Array([
        START_SYSEX, ANALOG_MAPPING_QUERY, END_SYSEX]);
    device.send(msg.buffer);
}

function setDigitalInputs(portNum: number, portData: number) {
    digitalInputData[portNum] = portData;
}

function setAnalogInput(pin: number, val: number) {
    analogInputData[pin] = val;
}

function setVersion(major: number, minor: number) {
    majorVersion = major;
    minorVersion = minor;
}

function processSysexMessage() {
    console.log("Sysex Message:");
    console.log(storedInputData);
    switch (storedInputData[0]) {
        case CAPABILITY_RESPONSE:
            for (var i = 1, pin = 0; pin < MAX_PINS; pin++) {
                while (storedInputData[i++] != 0x7F) {
                    pinModes[storedInputData[i - 1]].push(pin);
                    i++; //Skip mode resolution
                }
                if (i == sysexBytesRead) break;
            }
            queryAnalogMapping();
            break;
        case ANALOG_MAPPING_RESPONSE:
            for (var pin = 0; pin < analogChannel.length; pin++)
                analogChannel[pin] = 127;
            for (var i = 1; i < sysexBytesRead; i++)
                analogChannel[i - 1] = storedInputData[i];
            for (var pin = 0; pin < analogChannel.length; pin++) {
                if (analogChannel[pin] != 127) {
                    var out = new Uint8Array([
                        REPORT_ANALOG | analogChannel[pin], 0x01]);
                    device.send(out.buffer);
                }
            }
            notifyConnection = true;
            setTimeout(function () {
                notifyConnection = false;
            }, 100);
            break;
        case QUERY_FIRMWARE:
            console.log('got firmware...')
            if (!connected) {
                console.log('... but not connected, so clearing watchdog')
                clearInterval(poller);
                poller = null;
                clearTimeout(watchdog);
                watchdog = null;
                connected = true;
                setTimeout(init, 200);
            }
            pinging = false;
            pingCount = 0;
            break;
    }
}

function processInput(inputData: Uint8Array) {
    console.log('processInputData(', inputData, ')');
    for (var i = 0; i < inputData.length; i++) {

        if (parsingSysex) {
            if (inputData[i] == END_SYSEX) {
                parsingSysex = false;
                processSysexMessage();
            } else {
                storedInputData[sysexBytesRead++] = inputData[i];
            }
        } else if (waitForData > 0 && inputData[i] < 0x80) {
            storedInputData[--waitForData] = inputData[i];
            if (executeMultiByteCommand !== 0 && waitForData === 0) {
                switch (executeMultiByteCommand) {
                    case DIGITAL_MESSAGE:
                        setDigitalInputs(multiByteChannel, (storedInputData[0] << 7) + storedInputData[1]);
                        break;
                    case ANALOG_MESSAGE:
                        setAnalogInput(multiByteChannel, (storedInputData[0] << 7) + storedInputData[1]);
                        break;
                    case REPORT_VERSION:
                        setVersion(storedInputData[1], storedInputData[0]);
                        break;
                }
            }
        } else {
            if (inputData[i] < 0xF0) {
                command = inputData[i] & 0xF0;
                multiByteChannel = inputData[i] & 0x0F;
            } else {
                command = inputData[i];
            }
            switch (command) {
                case DIGITAL_MESSAGE:
                case ANALOG_MESSAGE:
                case REPORT_VERSION:
                    waitForData = 2;
                    executeMultiByteCommand = command;
                    break;
                case START_SYSEX:
                    parsingSysex = true;
                    sysexBytesRead = 0;
                    break;
            }
        }
    }
}

function pinMode(pin: number, mode: number) {
    var msg = new Uint8Array([PIN_MODE, pin, mode]);
    device.send(msg.buffer);
}

function analogRead(pin: number) {
    if (pin >= 0 && pin < pinModes[ANALOG].length) {
        return Math.round((analogInputData[pin] * 100) / 1023);
    } else {
        var valid = [];
        for (var i = 0; i < pinModes[ANALOG].length; i++)
            valid.push(i);
        console.log('ERROR: valid analog pins are ' + valid.join(', '));
        return;
    }
}

function digitalRead(pin: number) {
    if (!hasCapability(pin, INPUT)) {
        console.log('ERROR: valid input pins are ' + pinModes[INPUT].join(', '));
        return;
    }
    pinMode(pin, INPUT);
    return (digitalInputData[pin >> 3] >> (pin & 0x07)) & 0x01;
}

function analogWrite(pin: number, val: number) {
    if (!hasCapability(pin, PWM)) {
        console.log('ERROR: valid PWM pins are ' + pinModes[PWM].join(', '));
        return;
    }
    if (val < 0) val = 0;
    else if (val > 100) val = 100;
    val = Math.round((val / 100) * 255);
    pinMode(pin, PWM);
    var msg = new Uint8Array([
        ANALOG_MESSAGE | (pin & 0x0F),
        val & 0x7F,
        val >> 7]);
    device.send(msg.buffer);
}

function digitalWrite(pin: number, val: number) {
    if (!hasCapability(pin, OUTPUT)) {
        console.log('ERROR: valid output pins are ' + pinModes[OUTPUT].join(', '));
        return;
    }
    var portNum = (pin >> 3) & 0x0F;
    if (val == LOW)
        digitalOutputData[portNum] &= ~(1 << (pin & 0x07));
    else
        digitalOutputData[portNum] |= (1 << (pin & 0x07));
    pinMode(pin, OUTPUT);
    var msg = new Uint8Array([
        DIGITAL_MESSAGE | portNum,
        digitalOutputData[portNum] & 0x7F,
        digitalOutputData[portNum] >> 0x07]);
    device.send(msg.buffer);
}

function rotateServo(pin, deg) {
    if (!hasCapability(pin, SERVO)) {
        console.log('ERROR: valid servo pins are ' + pinModes[SERVO].join(', '));
        return;
    }
    pinMode(pin, SERVO);
    var msg = new Uint8Array([
        ANALOG_MESSAGE | (pin & 0x0F),
        deg & 0x7F,
        deg >> 0x07]);
    device.send(msg.buffer);
}

ext.whenConnected = function () {
    if (notifyConnection) return true;
    return false;
};

ext.analogWrite = function (pin, val) {
    analogWrite(pin, val);
};

ext.digitalWrite = function (pin, val) {
    if (val == 'on')
        digitalWrite(pin, HIGH);
    else if (val == 'off')
        digitalWrite(pin, LOW);
};

ext.analogRead = function (pin) {
    return analogRead(pin);
};

ext.digitalRead = function (pin) {
    return digitalRead(pin);
};

ext.whenAnalogRead = function (pin, op, val) {
    if (pin >= 0 && pin < pinModes[ANALOG].length) {
        if (op == '>')
            return analogRead(pin) > val;
        else if (op == '<')
            return analogRead(pin) < val;
        else if (op == '=')
            return analogRead(pin) == val;
        else
            return false;
    }
};

ext.whenDigitalRead = function (pin, val) {
    if (hasCapability(pin, INPUT)) {
        if (val == 'on')
            return digitalRead(pin);
        else if (val == 'off')
            return !digitalRead(pin);
    }
};

ext.connectHW = function (hw, pin) {
    hwList.add(hw, pin);
};

ext.rotateServo = function (servo, deg) {
    var hw = hwList.search(servo);
    if (!hw) return;
    if (deg < 0) deg = 0;
    else if (deg > 180) deg = 180;
    rotateServo(hw.pin, deg);
    hw.val = deg;
};

ext.changeServo = function (servo, change) {
    var hw = hwList.search(servo);
    if (!hw) return;
    var deg = hw.val + change;
    if (deg < 0) deg = 0;
    else if (deg > 180) deg = 180;
    rotateServo(hw.pin, deg);
    hw.val = deg;
};

ext.setLED = function (led, val) {
    var hw = hwList.search(led);
    if (!hw) return;
    analogWrite(hw.pin, val);
    hw.val = val;
};

ext.changeLED = function (led, val) {
    var hw = hwList.search(led);
    if (!hw) return;
    var b = hw.val + val;
    if (b < 0) b = 0;
    else if (b > 100) b = 100;
    analogWrite(hw.pin, b);
    hw.val = b;
};

ext.digitalLED = function (led, val) {
    var hw = hwList.search(led);
    if (!hw) return;
    if (val == 'on') {
        digitalWrite(hw.pin, HIGH);
        hw.val = 255;
    } else if (val == 'off') {
        digitalWrite(hw.pin, LOW);
        hw.val = 0;
    }
};

ext.readInput = function (name) {
    var hw = hwList.search(name);
    if (!hw) return;
    return analogRead(hw.pin);
};

ext.whenButton = function (btn, state) {
    var hw = hwList.search(btn);
    if (!hw) return;
    if (state === 'pressed')
        return digitalRead(hw.pin);
    else if (state === 'released')
        return !digitalRead(hw.pin);
};

ext.isButtonPressed = function (btn) {
    var hw = hwList.search(btn);
    if (!hw) return;
    return digitalRead(hw.pin);
};

ext.whenInput = function (name, op, val) {
    var hw = hwList.search(name);
    if (!hw) return;
    if (op == '>')
        return analogRead(hw.pin) > val;
    else if (op == '<')
        return analogRead(hw.pin) < val;
    else if (op == '=')
        return analogRead(hw.pin) == val;
    else
        return false;
};

ext.mapValues = function (val, aMin, aMax, bMin, bMax) {
    var output = (((bMax - bMin) * (val - aMin)) / (aMax - aMin)) + bMin;
    return Math.round(output);
};

ext._getStatus = function () {
    if (!connected)
        return { status: 1, msg: 'Disconnected' };
    else
        return { status: 2, msg: 'Connected' };
};

ext._deviceRemoved = function (dev) {
    console.log('Device removed');
    // Not currently implemented with serial devices
};

var potentialDevices: Device[] = [];
var devicesSeen: { [id: string]: Device } = {};
ext._deviceConnected = function (dev: Device) {
    if (dev.id in devicesSeen) {
        console.log('I have already seen', dev);
        return;
    }
    console.log('_deviceConnected: ', dev)
    // console.trace();
    potentialDevices.push(dev);
    devicesSeen[dev.id] = dev;
    if (!device)
        tryNextDevice();
};

let poller: number = null;
let watchdog: number = null;
function tryNextDevice() {
    console.log('trying next device (1/', potentialDevices.length, ')');
    device = potentialDevices.shift();
    if (!device) return;

    device.open({ stopBits: 0, bitRate: 57600, ctsFlowControl: 0 },
        function () {
            console.log('opened... Attempting connection with ' + device.id);
            device.set_receive_handler(function (data) {
                console.log("Input Data:");
                console.log(inputData);
                var inputData = new Uint8Array(data);
                processInput(inputData);
            });
            console.log('...clearing watchdog')
            clearTimeout(watchdog);
            watchdog = null;

            queryFirmware()
            poller = setInterval(function () {
                queryFirmware();
            }, 1000);
        });
    watchdog = setTimeout(function () {
        console.log('timeout waiting for ', device.id)
        clearInterval(poller);
        poller = null;
        device.set_receive_handler(null);
        device.close();
        console.log('timeout accessing ', device.id);
        delete devicesSeen[device.id];
        device = null;
        tryNextDevice();
    }, 5000);
}

ext._shutdown = function () {
    // TODO: Bring all pins down 
    console.trace('Shutting down..', device.id)
    if (device) device.close();
    if (poller) clearInterval(poller);
    delete devicesSeen[device.id];
    device = null;
};

export { ext as extension };
