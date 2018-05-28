import { extension } from './extension';
import { descriptor } from './descriptor';

declare var ScratchExtensions;

ScratchExtensions.register('Arduino Debug', descriptor, extension, { type: 'serial' });
