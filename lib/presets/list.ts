import { consolePreset } from './console.ts';
import { defaultPreset } from './default.ts';
import { night } from './night.ts';
import type { Preset } from './palette.ts';
import { soft } from './soft.ts';
import { warm } from './warm.ts';

/** Every preset, the default first. */
export const presets: readonly Preset[] = [defaultPreset, warm, soft, consolePreset, night];
