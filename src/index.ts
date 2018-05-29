import { extension } from './extension';
import { descriptor } from './descriptor';

declare var ScratchExtensions;
declare var Scratch;
declare var window: any;

let ready = false;
let readyTimer = null;
console.log('about to init..')
function init() {
    if (!pluginAvailable()) {
        console.log('plugin not available, trying again..')
        readyTimer = setTimeout(init, 200);
        return;
    }
    console.log('initting..', pluginAvailable())
    readyTimer = null;
    ScratchExtensions.register('Arduino Debug', descriptor, extension, { type: 'serial' });
}
init();

setTimeout(() => {
    if (readyTimer) {
        console.warn('Could not initialize arduino, please reload...');
    }
}, 10000);

window.addEventListener('error', e => {
    console.log('error from error: ', e);

});
var isOffline = Scratch && Scratch.FlashApp && Scratch.FlashApp.ASobj &&
Scratch.FlashApp.ASobj.isOffline && Scratch.FlashApp.ASobj.isOffline();


function pluginAvailable () {
    return !!window.ArrayBuffer && !!(
            isOffline ||
            (window.ScratchPlugin && window.ScratchPlugin.isAvailable()) ||
            (window.ScratchDeviceHost && window.ScratchDeviceHost.isAvailable())
        );
};