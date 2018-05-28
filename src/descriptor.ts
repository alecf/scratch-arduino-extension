type Block = { [lang: string]: (number|string)[][]};

var blocks: Block  = {
    en: [
        ['h', 'when device is connected', 'whenConnected'],
        [' ', 'connect %m.hwOut to pin %n', 'connectHW', 'led A', 3],
        [' ', 'connect %m.hwIn to analog %n', 'connectHW', 'rotation knob', 0],
        ['-'],
        [' ', 'set %m.leds %m.outputs', 'digitalLED', 'led A', 'on'],
        [' ', 'set %m.leds brightness to %n%', 'setLED', 'led A', 100],
        [' ', 'change %m.leds brightness by %n%', 'changeLED', 'led A', 20],
        ['-'],
        [' ', 'rotate %m.servos to %n degrees', 'rotateServo', 'servo A', 180],
        [' ', 'rotate %m.servos by %n degrees', 'changeServo', 'servo A', 20],
        ['-'],
        ['h', 'when %m.buttons is %m.btnStates', 'whenButton', 'button A', 'pressed'],
        ['b', '%m.buttons pressed?', 'isButtonPressed', 'button A'],
        ['-'],
        ['h', 'when %m.hwIn %m.ops %n%', 'whenInput', 'rotation knob', '>', 50],
        ['r', 'read %m.hwIn', 'readInput', 'rotation knob'],
        ['-'],
        [' ', 'set pin %n %m.outputs', 'digitalWrite', 1, 'on'],
        [' ', 'set pin %n to %n%', 'analogWrite', 3, 100],
        ['-'],
        ['h', 'when pin %n is %m.outputs', 'whenDigitalRead', 1, 'on'],
        ['b', 'pin %n on?', 'digitalRead', 1],
        ['-'],
        ['h', 'when analog %n %m.ops %n%', 'whenAnalogRead', 1, '>', 50],
        ['r', 'read analog %n', 'analogRead', 0],
        ['-'],
        ['r', 'map %n from %n %n to %n %n', 'mapValues', 50, 0, 100, -240, 240]
    ],
    de: [
        ['h', 'Wenn Arduino verbunden ist', 'whenConnected'],
        [' ', 'Verbinde %m.hwOut mit Pin %n', 'connectHW', 'LED A', 3],
        [' ', 'Verbinde %m.hwIn mit Analog %n', 'connectHW', 'Drehknopf', 0],
        ['-'],
        [' ', 'Schalte %m.leds %m.outputs', 'digitalLED', 'LED A', 'Ein'],
        [' ', 'Setze %m.leds Helligkeit auf %n%', 'setLED', 'LED A', 100],
        [' ', 'Ändere %m.leds Helligkeit um %n%', 'changeLED', 'LED A', 20],
        ['-'],
        [' ', 'Drehe %m.servos auf %n Grad', 'rotateServo', 'Servo A', 180],
        [' ', 'Drehe %m.servos um %n Grad', 'changeServo', 'Servo A', 20],
        ['-'],
        ['h', 'Wenn %m.buttons ist %m.btnStates', 'whenButton', 'Taste A', 'gedrückt'],
        ['b', '%m.buttons gedrückt?', 'isButtonPressed', 'Taste A'],
        ['-'],
        ['h', 'Wenn %m.hwIn %m.ops %n%', 'whenInput', 'Drehknopf', '>', 50],
        ['r', 'Wert von %m.hwIn', 'readInput', 'Drehknopf'],
        ['-'],
        [' ', 'Schalte Pin %n %m.outputs', 'digitalWrite', 1, 'Ein'],
        [' ', 'Setze Pin %n auf %n%', 'analogWrite', 3, 100],
        ['-'],
        ['h', 'Wenn Pin %n ist %m.outputs', 'whenDigitalRead', 1, 'Ein'],
        ['b', 'Pin %n ein?', 'digitalRead', 1],
        ['-'],
        ['h', 'Wenn Analog %n %m.ops %n%', 'whenAnalogRead', 1, '>', 50],
        ['r', 'Wert von Analog %n', 'analogRead', 0],
        ['-'],
        ['r', 'Setze %n von %n %n auf %n %n', 'mapValues', 50, 0, 100, -240, 240]
    ],
    it: [
        ['h', 'quando Arduino è connesso', 'whenConnected'],
        [' ', 'connetti il %m.hwOut al pin %n', 'connectHW', 'led A', 3],
        [' ', 'connetti il %m.hwIn ad analog %n', 'connectHW', 'potenziometro', 0],
        ['-'],
        [' ', '%m.outputs il %m.leds', 'digitalLED', 'led A', 'on'],
        [' ', 'porta luminosità di %m.leds a %n%', 'setLED', 'led A', 100],
        [' ', 'cambia luminosità di %m.leds a %n%', 'changeLED', 'led A', 20],
        ['-'],
        [' ', 'ruota %m.servos fino a %n gradi', 'rotateServo', 'servo A', 180],
        [' ', 'ruota %m.servos di %n gradi', 'changeServo', 'servo A', 20],
        ['-'],
        ['h', 'quando tasto %m.buttons è %m.btnStates', 'whenButton', 'pulsante A', 'premuto'],
        ['b', '%m.buttons premuto?', 'isButtonPressed', 'pulsante A'],
        ['-'],
        ['h', 'quando %m.hwIn %m.ops %n%', 'whenInput', 'potenziometro', '>', 50],
        ['r', 'leggi %m.hwIn', 'readInput', 'potenziometro'],
        ['-'],
        [' ', 'porta pin %n a %m.outputs', 'digitalWrite', 1, 'acceso'],
        [' ', 'porta pin %n al %n%', 'analogWrite', 3, 100],
        ['-'],
        ['h', 'quando pin %n è %m.outputs', 'whenDigitalRead', 1, 'acceso'],
        ['b', 'pin %n acceso?', 'digitalRead', 1],
        ['-'],
        ['h', 'quando analog %n %m.ops %n%', 'whenAnalogRead', 1, '>', 50],
        ['r', 'leggi analog %n', 'analogRead', 0],
        ['-'],
        ['r', 'porta %n da %n %n a %n %n', 'mapValues', 50, 0, 100, -240, 240]
    ],
    ja: [
        ['h', 'デバイスがつながったとき', 'whenConnected'],
        [' ', '%m.hwOut を %n ピンへつなぐ', 'connectHW', 'led A', 3],
        [' ', '%m.hwIn をアナログ入力 %n ピンへつなぐ', 'connectHW', 'rotation knob', 0],
        ['-'],
        [' ', '%m.leds を %m.outputs にする', 'digitalLED', 'led A', 'on'],
        [' ', '%m.leds の明るさを %n% にする', 'setLED', 'led A', 100],
        [' ', '%m.leds の明るさを %n% ずつ変える', 'changeLED', 'led A', 20],
        ['-'],
        [' ', '%m.servos を %n 度へ向ける', 'rotateServo', 'servo A', 180],
        [' ', '%m.servos を %n 度ずつ回す', 'changeServo', 'servo A', 20],
        ['-'],
        ['h', '%m.buttons が %m.btnStates とき', 'whenButton', 'ボタン A', '押された'],
        ['b', '%m.buttons 押された', 'isButtonPressed', 'ボタン A'],
        ['-'],
        ['h', '%m.hwIn が %m.ops %n% になったとき', 'whenInput', '回転つまみ', '>', 50],
        ['r', '%m.hwIn の値', 'readInput', '回転つまみ'],
        ['-'],
        [' ', 'デジタル出力 %n を %m.outputs にする', 'digitalWrite', 1, 'on'],
        [' ', 'アナログ出力 %n を %n% にする', 'analogWrite', 3, 100],
        ['-'],
        ['h', 'デジタル入力 %n が %m.outputs になったとき', 'whenDigitalRead', 1, 'on'],
        ['b', 'デジタル入力 %n はオン', 'digitalRead', 1],
        ['-'],
        ['h', 'アナログ入力 %n が %m.ops %n% になったとき', 'whenAnalogRead', 1, '>', 50],
        ['r', 'アナログ入力 %n の値', 'analogRead', 0],
        ['-'],
        ['r', '%n を %n ... %n から %n ... %n へ変換', 'mapValues', 50, 0, 100, -240, 240]
    ],
    nb: [
        ['h', 'når enheten tilkobles', 'whenConnected'],
        [' ', 'koble %m.hwOut til digital %n', 'connectHW', 'LED A', 3],
        [' ', 'koble %m.hwIn til analog %n', 'connectHW', 'dreieknapp', 0],
        ['-'],
        [' ', 'sett %m.leds %m.outputs', 'digitalLED', 'LED A', 'på'],
        [' ', 'sett %m.leds styrke til %n%', 'setLED', 'LED A', 100],
        [' ', 'endre %m.leds styrke med %n%', 'changeLED', 'LED A', 20],
        ['-'],
        [' ', 'rotér %m.servos til %n grader', 'rotateServo', 'servo A', 180],
        [' ', 'rotér %m.servos med %n grader', 'changeServo', 'servo A', 20],
        ['-'],
        ['h', 'når %m.buttons %m.btnStates', 'whenButton', 'knapp A', 'trykkes'],
        ['b', '%m.buttons trykket?', 'isButtonPressed', 'knapp A'],
        ['-'],
        ['h', 'når %m.hwIn %m.ops %n%', 'whenInput', 'dreieknapp', '>', 50],
        ['r', '%m.hwIn verdi', 'readInput', 'dreieknapp'],
        ['-'],
        [' ', 'sett digital %n %m.outputs', 'digitalWrite', 1, 'på'],
        [' ', 'set utgang %n til %n%', 'analogWrite', 3, 100],
        ['-'],
        ['h', 'når digital %n er %m.outputs', 'whenDigitalRead', 1, 'på'],
        ['b', 'digital %n på?', 'digitalRead', 1],
        ['-'],
        ['h', 'når analog %n %m.ops %n%', 'whenAnalogRead', 1, '>', 50],
        ['r', 'analog %n verdi', 'analogRead', 0],
        ['-'],
        ['r', 'skalér %n fra %n %n til %n %n', 'mapValues', 50, 0, 100, -240, 240]
    ],
    nl: [
        ['h', 'als het apparaat verbonden is', 'whenConnected'],
        [' ', 'verbindt %m.hwOut met pin %n', 'connectHW', 'led A', 3],
        [' ', 'verbindt %m.hwIn met analoog %n', 'connectHW', 'draaiknop', 0],
        ['-'],
        [' ', 'schakel %m.leds %m.outputs', 'digitalLED', 'led A', 'on'],
        [' ', 'schakel %m.leds helderheid tot %n%', 'setLED', 'led A', 100],
        [' ', 'verander %m.leds helderheid met %n%', 'changeLED', 'led A', 20],
        ['-'],
        [' ', 'draai %m.servos tot %n graden', 'rotateServo', 'servo A', 180],
        [' ', 'draai %m.servos met %n graden', 'changeServo', 'servo A', 20],
        ['-'],
        ['h', 'wanneer %m.buttons is %m.btnStates', 'whenButton', 'knop A', 'in gedrukt'],
        ['b', '%m.knoppen in gedrukt?', 'isButtonPressed', 'knoppen A'],
        ['-'],
        ['h', 'wanneer%m.hwIn %m.ops %n%', 'whenInput', 'draaiknop', '>', 50],
        ['r', 'read %m.hwIn', 'readInput', 'draaiknop'],
        ['-'],
        [' ', 'schakel pin %n %m.outputs', 'digitalWrite', 1, 'on'],
        [' ', 'schakel pin %n tot %n%', 'analogWrite', 3, 100],
        ['-'],
        ['h', 'wanneer pin %n is %m.outputs', 'whenDigitalRead', 1, 'on'],
        ['b', 'pin %n aan?', 'digitalRead', 1],
        ['-'],
        ['h', 'wanneer analoge %n %m.ops %n%', 'whenAnalogRead', 1, '>', 50],
        ['r', 'lees analoge %n', 'analogRead', 0],
        ['-'],
        ['r', 'zet %n van %n %n tot %n %n', 'mapValues', 50, 0, 100, -240, 240]
    ],
    pt: [
        ['h', 'Quando dispositivo estiver conectado', 'whenConnected'],
        [' ', 'conectar%m.hwOut para pino %n', 'connectHW', 'led A', 3],
        [' ', 'conectar %m.hwIn para analogico %n', 'connectHW', 'potenciometro', 0],
        ['-'],
        [' ', 'estado %m.leds %m.outputs', 'digitalLED', 'led A', 'ligado'],
        [' ', 'estado %m.leds brilho to %n%', 'setLED', 'led A', 100],
        [' ', 'mudar %m.leds brilho em %n%', 'changeLED', 'led A', 20],
        ['-'],
        [' ', 'girar %m.servos para %n graus', 'rotateServo', 'servo A', 180],
        [' ', 'girar %m.servos em %n graus', 'changeServo', 'servo A', 20],
        ['-'],
        ['h', 'quando %m.buttons is %m.btnStates', 'whenButton', 'botao A', 'pressionado'],
        ['b', '%m.buttons pressionado?', 'isButtonPressed', 'botao A'],
        ['-'],
        ['h', 'quando %m.hwIn %m.ops %n%', 'whenInput', 'potenciometro', '>', 50],
        ['r', 'read %m.hwIn', 'readInput', 'potenciometro'],
        ['-'],
        [' ', 'estado digital pino %n %m.outputs', 'digitalWrite', 1, 'ligado'],
        [' ', 'estado analogico pino %n to %n%', 'analogWrite', 3, 100],
        ['-'],
        ['h', 'quando pino %n is %m.outputs', 'whenDigitalRead', 1, 'ligado'],
        ['b', 'pino %n ligado?', 'digitalRead', 1],
        ['-'],
        ['h', 'quando valor analogico %n %m.ops %n%', 'whenAnalogRead', 1, '>', 50],
        ['r', 'ler valor analogico %n', 'analogRead', 0],
        ['-'],
        ['r', 'mapear %n from %n %n to %n %n', 'mapValues', 50, 0, 100, -240, 240]
    ]
};

interface MenuItems {
    buttons: string[];
    btnStates: string[];
    hwIn: string[];
    hwOut: string[];
    leds: string[];
    outputs: string[];
    ops: string[]; 
    servos: string[];
}

type Menu = { [lang: string]: MenuItems };
var menus: Menu = {
    en: {
        buttons: ['button A', 'button B', 'button C', 'button D'],
        btnStates: ['pressed', 'released'],
        hwIn: ['rotation knob', 'light sensor', 'temperature sensor'],
        hwOut: ['led A', 'led B', 'led C', 'led D', 'button A', 'button B', 'button C', 'button D', 'servo A', 'servo B', 'servo C', 'servo D'],
        leds: ['led A', 'led B', 'led C', 'led D'],
        outputs: ['on', 'off'],
        ops: ['>', '=', '<'],
        servos: ['servo A', 'servo B', 'servo C', 'servo D']
    },
    de: {
        buttons: ['Taste A', 'Taste B', 'Taste C', 'Taste D'],
        btnStates: ['gedrückt', 'losgelassen'],
        hwIn: ['Drehknopf', 'Lichtsensor', 'Temperatursensor'],
        hwOut: ['LED A', 'LED B', 'LED C', 'LED D', 'Taste A', 'Taste B', 'Taste C', 'Taste D', 'Servo A', 'Servo B', 'Servo C', 'Servo D'],
        leds: ['LED A', 'LED B', 'LED C', 'LED D'],
        outputs: ['Ein', 'Aus'],
        ops: ['>', '=', '<'],
        servos: ['Servo A', 'Servo B', 'Servo C', 'Servo D']
    },
    it: {
        buttons: ['pulsante A', 'pulsante B', 'pulsante C', 'pulsante D'],
        btnStates: ['premuto', 'rilasciato'],
        hwIn: ['potenziometro', 'sensore di luce', 'sensore di temperatura'],
        hwOut: ['led A', 'led B', 'led C', 'led D', 'pulsante A', 'pulsante B', 'pulsante C', 'pulsante D', 'servo A', 'servo B', 'servo C', 'servo D'],
        leds: ['led A', 'led B', 'led C', 'led D'],
        outputs: ['acceso', 'spento'],
        ops: ['>', '=', '<'],
        servos: ['servo A', 'servo B', 'servo C', 'servo D']
    },
    ja: {
        buttons: ['ボタン A', 'ボタン B', 'ボタン C', 'ボタン D'],
        btnStates: ['押された', '放された'],
        hwIn: ['回転つまみ', '光センサー', '温度センサー'],
        hwOut: ['led A', 'led B', 'led C', 'led D', 'ボタン A', 'ボタン B', 'ボタン C', 'ボタン D', 'サーボ A', 'サーボ B', 'サーボ C', 'サーボ D'],
        leds: ['led A', 'led B', 'led C', 'led D'],
        outputs: ['オン', 'オフ'],
        ops: ['>', '=', '<'],
        servos: ['サーボ A', 'サーボ B', 'サーボ C', 'サーボ D']
    },
    nb: {
        buttons: ['knapp A', 'knapp B', 'knapp C', 'knapp D'],
        btnStates: ['trykkes', 'slippes'],
        hwIn: ['dreieknapp', 'lyssensor', 'temperatursensor'],
        hwOut: ['LED A', 'LED B', 'LED C', 'LED D', 'knapp A', 'knapp B', 'knapp C', 'knapp D', 'servo A', 'servo B', 'servo C', 'servo D'],
        leds: ['LED A', 'LED B', 'LED C', 'LED D'],
        outputs: ['på', 'av'],
        ops: ['>', '=', '<'],
        servos: ['servo A', 'servo B', 'servo C', 'servo D']
    },
    nl: {
        buttons: ['knop A', 'knop B', 'knop C', 'knop D'],
        btnStates: ['ingedrukt', 'losgelaten'],
        hwIn: ['draaiknop', 'licht sensor', 'temperatuur sensor'],
        hwOut: ['led A', 'led B', 'led C', 'led D', 'knop A', 'knop B', 'knop C', 'knop D', 'servo A', 'servo B', 'servo C', 'servo D'],
        leds: ['led A', 'led B', 'led C', 'led D'],
        outputs: ['aan', 'uit'],
        ops: ['>', '=', '<'],
        servos: ['servo A', 'servo B', 'servo C', 'servo D']
    },
    pt: {
        buttons: ['botao A', 'botao B', 'botao C', 'botao D'],
        btnStates: ['pressionado', 'solto'],
        hwIn: ['potenciometro', 'sensor de luz', 'sensor de temperatura'],
        hwOut: ['led A', 'led B', 'led C', 'led D', 'botao A', 'botao B', 'botao C', 'botao D', 'servo A', 'servo B', 'servo C', 'servo D'],
        leds: ['led A', 'led B', 'led C', 'led D'],
        outputs: ['ligado', 'desligado'],
        ops: ['>', '=', '<'],
        servos: ['servo A', 'servo B', 'servo C', 'servo D']
    }
};

// Check for GET param 'lang'
var paramString = window.location.search.replace(/^\?|\/$/g, '');
var vars = paramString.split("&");
var lang = 'en';
for (var i = 0; i < vars.length; i++) {
var pair = vars[i].split('=');
if (pair.length > 1 && pair[0] == 'lang')
  lang = pair[1];
}


var descriptor = {
    blocks: blocks[lang],
    menus: menus[lang],
    url: 'http://khanning.github.io/scratch-arduino-extension'
};

export { descriptor };