import { extension } from './extension';
import { descriptor } from './descriptor';

declare var ScratchExtensions;

setTimeout(() => {
    ScratchExtensions.register('Arduino Debug', descriptor, extension, { type: 'serial' });
}, 1000);