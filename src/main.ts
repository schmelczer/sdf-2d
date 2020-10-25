/**
 * Importing this file gives arrays (`Array` and `Float32Array` instances)
 * two new properties: `x` and `y`. The former refers to their 0th element,
 * and the latter to their 1st.
 *
 * @packageDocumentation
 */

import { applyArrayPlugins } from './helper/array';

declare global {
  interface Array<T> {
    x: T;
    y: T;
  }

  interface ReadonlyArray<T> {
    x: T;
    y: T;
  }

  interface Float32Array {
    x: number;
    y: number;
  }
}

applyArrayPlugins();

export * from './compile';
export * from './drawables/drawable';
export * from './drawables/drawable-descriptor';
export * from './drawables/lights/circle-light';
export * from './drawables/lights/flashlight';
export * from './drawables/shapes/circle-factory';
export * from './drawables/shapes/colorful-circle';
export * from './drawables/shapes/droplet-factory';
export * from './drawables/shapes/inverted-tunnel-factory';
export * from './drawables/shapes/meta-circle-factory';
export * from './drawables/shapes/noisy-polygon-factory';
export * from './drawables/shapes/polygon-factory';
export * from './drawables/shapes/rotated-rectangle-factory';
export * from './graphics/graphics-library/texture/texture-options';
export * from './graphics/rendering/renderer/noise-renderer';
export * from './graphics/rendering/renderer/renderer';
export * from './helper/colors/hex';
export * from './helper/colors/hsl';
export * from './helper/colors/rgb';
export * from './helper/colors/rgb255';
export * from './helper/colors/rgba';
export * from './helper/colors/rgba255';
export * from './helper/delta-time-calculator';
export * from './run-animation';
