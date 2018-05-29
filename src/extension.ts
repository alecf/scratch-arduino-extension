const ext: any = {};

// XXX temp
let command;

const PIN_MODE = 0xF4,
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

const INPUT = 0x00,
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

const LOW = 0,
    HIGH = 1;

const MAX_DATA_BYTES = 4096;
const MAX_PINS = 128;


interface DeviceEntry {
    name: string;
    pin: number;
    val: number;
}

type OpenParams = ({ stopBits: number, bitRate: number, ctsFlowControl: number });
interface Device {
    id: string;
    send: (s: ArrayBuffer) => void;
    open: (params: OpenParams,
        callback?: () => void) => void;
    set_receive_handler: (callback: (data) => void) => void;
    close: () => void;
}

var majorVersion = 0,
    minorVersion = 0;

var notifyConnection = false;
var currentDeviceState: DeviceState = null;
var inputData = null;

// TEMPORARY WORKAROUND
// Since _deviceRemoved is not used with Serial devices
// ping device regularly to check connection

class HWList {
    devices: DeviceEntry[];
    devicesByKey: { [id: string]: DeviceEntry };

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

function hasCapability(pin: number, mode: number) {
    if (currentDeviceState.pinModes[mode].indexOf(pin) > -1)
        return true;
    else
        return false;
}

function setDigitalInputs(portNum: number, portData: number) {
    currentDeviceState.digitalInputData[portNum] = portData;
}

function setAnalogInput(pin: number, val: number) {
    currentDeviceState.analogInputData[pin] = val;
}

function setVersion(major: number, minor: number) {
    majorVersion = major;
    minorVersion = minor;
}

function pinMode(device: Device, pin: number, mode: number) {
    var msg = new Uint8Array([PIN_MODE, pin, mode]);
    device.send(msg.buffer);
}

function analogRead(pin: number) {
    if (pin >= 0 && pin < currentDeviceState.pinModes[ANALOG].length) {
        return Math.round((this.analogInputData[pin] * 100) / 1023);
    } else {
        var valid = [];
        for (var i = 0; i < currentDeviceState.pinModes[ANALOG].length; i++)
            valid.push(i);
        console.log('ERROR: valid analog pins are ' + valid.join(', '));
        return;
    }
}

function digitalRead(deviceState: DeviceState, pin: number) {
    if (!hasCapability(pin, INPUT)) {
        console.log('ERROR: valid input pins are ' + currentDeviceState.pinModes[INPUT].join(', '));
        return;
    }
    pinMode(deviceState.device, pin, INPUT);
    return (currentDeviceState.digitalInputData[pin >> 3] >> (pin & 0x07)) & 0x01;
}

function analogWrite(deviceState: DeviceState, pin: number, val: number) {
    const device = deviceState.device;
    if (!hasCapability(pin, PWM)) {
        console.log('ERROR: valid PWM pins are ' + currentDeviceState.pinModes[PWM].join(', '));
        return;
    }
    if (val < 0) val = 0;
    else if (val > 100) val = 100;
    val = Math.round((val / 100) * 255);
    pinMode(device, pin, PWM);
    var msg = new Uint8Array([
        ANALOG_MESSAGE | (pin & 0x0F),
        val & 0x7F,
        val >> 7]);
    device.send(msg.buffer);
}

function digitalWrite(deviceState: DeviceState, pin: number, val: number) {
    const device = deviceState.device;
    if (!hasCapability(pin, OUTPUT)) {
        console.log('ERROR: valid output pins are ' + currentDeviceState.pinModes[OUTPUT].join(', '));
        return;
    }
    var portNum = (pin >> 3) & 0x0F;
    if (val == LOW)
        currentDeviceState.digitalOutputData[portNum] &= ~(1 << (pin & 0x07));
    else
        currentDeviceState.digitalOutputData[portNum] |= (1 << (pin & 0x07));
    pinMode(device, pin, OUTPUT);
    var msg = new Uint8Array([
        DIGITAL_MESSAGE | portNum,
        currentDeviceState.digitalOutputData[portNum] & 0x7F,
        currentDeviceState.digitalOutputData[portNum] >> 0x07]);
    device.send(msg.buffer);
}

function rotateServo(deviceState: DeviceState, pin, deg) {
    if (!hasCapability(pin, SERVO)) {
        console.log('ERROR: valid servo pins are ' + currentDeviceState.pinModes[SERVO].join(', '));
        return;
    }
    pinMode(deviceState.device, pin, SERVO);
    var msg = new Uint8Array([
        ANALOG_MESSAGE | (pin & 0x0F),
        deg & 0x7F,
        deg >> 0x07]);
    deviceState.device.send(msg.buffer);
}

// block callback
ext.whenConnected = function () {
    if (notifyConnection) return true;
    return false;
};

// block callback
ext.analogWrite = function (pin, val) {
    analogWrite(currentDeviceState, pin, val);
};

// block callback
ext.digitalWrite = function (pin, val) {
    if (val == 'on')
        digitalWrite(currentDeviceState, pin, HIGH);
    else if (val == 'off')
        digitalWrite(currentDeviceState, pin, LOW);
};

// block callback
ext.analogRead = function (pin) {
    return analogRead(pin);
};

// block callback
ext.digitalRead = function (pin) {
    return digitalRead(currentDeviceState, pin);
};

// block callback
ext.whenAnalogRead = function (pin, op, val) {
    if (pin >= 0 && pin < currentDeviceState.pinModes[ANALOG].length) {
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

// block callback
ext.whenDigitalRead = function (pin, val) {
    if (hasCapability(pin, INPUT)) {
        if (val == 'on')
            return digitalRead(currentDeviceState, pin);
        else if (val == 'off')
            return !digitalRead(currentDeviceState, pin);
    }
};

// block callback
ext.connectHW = function (hw, pin) {
    hwList.add(hw, pin);
};

// block callback
ext.rotateServo = function (servo, deg) {
    var hw = hwList.search(servo);
    if (!hw) return;
    if (deg < 0) deg = 0;
    else if (deg > 180) deg = 180;
    rotateServo(currentDeviceState, hw.pin, deg);
    hw.val = deg;
};

// block callback
ext.changeServo = function (servo, change) {
    var hw = hwList.search(servo);
    if (!hw) return;
    var deg = hw.val + change;
    if (deg < 0) deg = 0;
    else if (deg > 180) deg = 180;
    rotateServo(currentDeviceState, hw.pin, deg);
    hw.val = deg;
};

// block callback
ext.setLED = function (led, val) {
    var hw = hwList.search(led);
    if (!hw) return;
    analogWrite(currentDeviceState, hw.pin, val);
    hw.val = val;
};

// block callback
ext.changeLED = function (led, val) {
    var hw = hwList.search(led);
    if (!hw) return;
    var b = hw.val + val;
    if (b < 0) b = 0;
    else if (b > 100) b = 100;
    analogWrite(currentDeviceState, hw.pin, b);
    hw.val = b;
};

// block callback
ext.digitalLED = function (led, val) {
    var hw = hwList.search(led);
    if (!hw) return;
    if (val == 'on') {
        digitalWrite(currentDeviceState, hw.pin, HIGH);
        hw.val = 255;
    } else if (val == 'off') {
        digitalWrite(currentDeviceState, hw.pin, LOW);
        hw.val = 0;
    }
};

// block callback
ext.readInput = function (name) {
    var hw = hwList.search(name);
    if (!hw) return;
    return analogRead(hw.pin);
};

// block callback
ext.whenButton = function (btn, state) {
    var hw = hwList.search(btn);
    if (!hw) return;
    if (state === 'pressed')
        return digitalRead(currentDeviceState, hw.pin);
    else if (state === 'released')
        return !digitalRead(currentDeviceState, hw.pin);
};

// block callback
ext.isButtonPressed = function (btn) {
    var hw = hwList.search(btn);
    if (!hw) return;
    return digitalRead(currentDeviceState, hw.pin);
};

// block callback
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

// block callback
ext.mapValues = function (val, aMin, aMax, bMin, bMax) {
    var output = (((bMax - bMin) * (val - aMin)) / (aMax - aMin)) + bMin;
    return Math.round(output);
};

ext._getStatus = function () {
    if (!currentDeviceState || !currentDeviceState.connected)
        return { status: 1, msg: 'Disconnected' };
    else
        return { status: 2, msg: 'Connected' };
};

ext._deviceRemoved = function (dev) {
    console.log('Device removed');
    // Not currently implemented with serial devices
};

class DeviceState {
    readonly device: Device;
    opened = false;
    connected = false;
    watchdog: number;
    poller: number;

    parsingSysex = false;
    waitForData = 0;
    executeMultiByteCommand = 0;
    multiByteChannel = 0;
    sysexBytesRead = 0;
    readonly storedInputData = new Uint8Array(MAX_DATA_BYTES);

    readonly digitalOutputData = new Uint8Array(16);
    readonly digitalInputData = new Uint8Array(16);
    readonly analogInputData = new Uint16Array(16);
    readonly analogChannel = new Uint8Array(MAX_PINS);
    pinModes: number[][] = [];
    // TEMPORARY WORKAROUND
    // Since _deviceRemoved is not used with Serial devices
    // ping device regularly to check connection
    pinging = false;
    pingCount = 0;
    pinger = null;


    constructor(device: Device) {
        this.device = device;
        for (var i = 0; i < 11; i++) this.pinModes[i] = [];

    }

    connect() {
        this.device.open({ stopBits: 0, bitRate: 57600, ctsFlowControl: 0 },
        /*    () => {
                console.log('connected! ' + this.device.id, ' with arg ', arguments);
                //clearTimeout(watchdog);
                //watchdog = null;

                //this.queryFirmware()
            }*/);
            this.device.set_receive_handler(data => {
                console.log("Input Data:");
                console.log(inputData);
                var inputData = new Uint8Array(data);
                this.processInput(inputData);
            });
            this.poller = setInterval(() => {
                this.queryFirmware();
            }, 2000);

            this.watchdog = setTimeout(() => {
            console.log('timeout waiting for ', this.device.id)
            this.close();
            delete devicesSeen[this.device.id];
            tryNextDevice();
        }, 10000);

    }

    init() {
        console.log('init with ', this);
        const device = this.device;
        for (var i = 0; i < 16; i++) {
            var output = new Uint8Array([REPORT_DIGITAL | i, 0x01]);
            this.device.send(output.buffer);
        }

        this.queryCapabilities();

        // TEMPORARY WORKAROUND
        // Since _deviceRemoved is not used with Serial devices
        // ping device regularly to check connection
        this.pinger = setInterval(function () {
            if (this.pinging) {
                if (++this.pingCount > 6) {
                    clearInterval(this.pinger);
                    this.pinger = null;
                    this.connected = false;
                    if (this) {
                        this.close();
                    }
                    delete devicesSeen[this.device.id];
                    console.log('disconnecting: ', this.pingCount, 'pings')
                    currentDeviceState = null;
                    return;
                }
            } else {
                if (!this) {
                    clearInterval(this.pinger);
                    this.pinger = null;
                    return;
                }
                this.queryFirmware();
                this.pinging = true;
            }
        }, 100);
    }

    close() {
        this.connected = false;

        clearInterval(this.poller);
        this.poller = null;

        if (this.pinging) {
            clearInterval(this.pinger);
        }

        if (this.watchdog) {
            clearTimeout(this.watchdog);
            this.watchdog = null;
        }
        this.device.set_receive_handler(null);
        this.device.close();

        if (this === currentDeviceState) {
            console.log('clearing default DS')
            currentDeviceState = null;
        }
    }

    processInput(inputData: Uint8Array) {
        console.log('processInputData(', inputData, ')');
        for (var i = 0; i < inputData.length; i++) {

            if (this.parsingSysex) {
                if (inputData[i] == END_SYSEX) {
                    this.parsingSysex = false;
                    this.processSysexMessage();
                } else {
                    this.storedInputData[this.sysexBytesRead++] = inputData[i];
                }
            } else if (this.waitForData > 0 && inputData[i] < 0x80) {
                this.storedInputData[--this.waitForData] = inputData[i];
                if (this.executeMultiByteCommand !== 0 && this.waitForData === 0) {
                    switch (this.executeMultiByteCommand) {
                        case DIGITAL_MESSAGE:
                            setDigitalInputs(this.multiByteChannel, (this.storedInputData[0] << 7) + this.storedInputData[1]);
                            break;
                        case ANALOG_MESSAGE:
                            setAnalogInput(this.multiByteChannel, (this.storedInputData[0] << 7) + this.storedInputData[1]);
                            break;
                        case REPORT_VERSION:
                            setVersion(this.storedInputData[1], this.storedInputData[0]);
                            break;
                    }
                }
            } else {
                if (inputData[i] < 0xF0) {
                    command = inputData[i] & 0xF0;
                    this.multiByteChannel = inputData[i] & 0x0F;
                } else {
                    command = inputData[i];
                }
                switch (command) {
                    case DIGITAL_MESSAGE:
                    case ANALOG_MESSAGE:
                    case REPORT_VERSION:
                        this.waitForData = 2;
                        this.executeMultiByteCommand = command;
                        break;
                    case START_SYSEX:
                        this.parsingSysex = true;
                        this.sysexBytesRead = 0;
                        break;
                }
            }
        }

    }

    processSysexMessage() {
        console.log("Sysex Message:");
        console.log(this.storedInputData);
        switch (this.storedInputData[0]) {
            case CAPABILITY_RESPONSE:
                for (var i = 1, pin = 0; pin < MAX_PINS; pin++) {
                    while (this.storedInputData[i++] != 0x7F) {
                        this.pinModes[this.storedInputData[i - 1]].push(pin);
                        i++; //Skip mode resolution
                    }
                    if (i == this.sysexBytesRead) break;
                }
                this.queryAnalogMapping();
                break;
            case ANALOG_MAPPING_RESPONSE:
                for (var pin = 0; pin < this.analogChannel.length; pin++)
                    this.analogChannel[pin] = 127;
                for (var i = 1; i < this.sysexBytesRead; i++)
                    this.analogChannel[i - 1] = this.storedInputData[i];
                for (var pin = 0; pin < this.analogChannel.length; pin++) {
                    if (this.analogChannel[pin] != 127) {
                        var out = new Uint8Array([
                            REPORT_ANALOG | this.analogChannel[pin], 0x01]);
                        this.device.send(out.buffer);
                    }
                }
                notifyConnection = true;
                setTimeout(function () {
                    notifyConnection = false;
                }, 100);
                break;
            case QUERY_FIRMWARE:
                console.log('got firmware...')
                if (!this.connected) {
                    console.log('... but not connected, so clearing watchdog')
                    clearInterval(this.poller);
                    this.poller = null;
                    clearTimeout(this.watchdog);
                    this.watchdog = null;
                    this.connected = true;
                    setTimeout(() => this.init(), 200);
                }
                this.pinging = false;
                this.pingCount = 0;
                break;
        }
    }
    queryFirmware() {
        console.log('querying firmware on ', this.device.id);
        var output = new Uint8Array([START_SYSEX, QUERY_FIRMWARE, END_SYSEX]);
        this.device.send(output.buffer);
    }

    queryCapabilities() {
        console.log('Querying ' + this.device.id + ' capabilities');

        var msg = new Uint8Array([
            START_SYSEX, CAPABILITY_QUERY, END_SYSEX]);
        this.device.send(msg.buffer);
    }

    queryAnalogMapping() {
        console.log('Querying ' + this.device.id + ' analog mapping');
        var msg = new Uint8Array([
            START_SYSEX, ANALOG_MAPPING_QUERY, END_SYSEX]);
        this.device.send(msg.buffer);
    }
}

// kept in sync
const potentialDevices: DeviceState[] = [];
const devicesSeen: { [id: string]: DeviceState } = {};

ext._deviceConnected = function (dev: Device) {
    if (dev.id in devicesSeen) {
        // console.log('I have already seen', dev);
        return;
    }
    console.log('_deviceConnected: ', dev, ' in ', devicesSeen)
    // console.trace();
    const deviceState = new DeviceState(dev);
    potentialDevices.push(deviceState);
    devicesSeen[dev.id] = deviceState;
    if (!currentDeviceState)
        tryNextDevice();
};

function tryNextDevice() {
    console.log('trying next device (1/', potentialDevices.length, ')');
    const deviceState = potentialDevices.shift();
    if (!deviceState) {
        // no more devices to try
        return;
    }
    currentDeviceState = deviceState;
    deviceState.connect();
}

ext._shutdown = function () {
    // TODO: Bring all pins down 
    console.trace('Shutting down..', currentDeviceState.device.id)
    if (currentDeviceState) currentDeviceState.close();
    //if (poller) clearInterval(poller);
    delete devicesSeen[currentDeviceState.device.id];
    currentDeviceState = null;
};

export { ext as extension };
