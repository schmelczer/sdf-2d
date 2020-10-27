import { enableContextLostSimulator } from './graphics/graphics-library/helper/enable-context-lost-simulator';
import { FpsQualityAutoscaler } from './graphics/rendering/fps-quality-autoscaler';
import { ContextAwareRenderer } from './graphics/rendering/renderer/context-aware-renderer';
import { RuntimeSettings } from './graphics/rendering/settings/runtime-settings';
import { StartupSettings } from './graphics/rendering/settings/startup-settings';
import { DeltaTimeCalculator } from './helper/delta-time-calculator';
import { DrawableDescriptor, Renderer } from './main';

/**
 * Implements the boilerplate code required to run real-time animations
 * in the browser. An FPS based autoscaler is also used. This creates an additional `fps`
 * key in the renderers `insights` property.
 *
 * Example usage:
 *
 * ```html
 *   <canvas id="main" style="width: 300px; height: 150px"></canvas>
 * ```
 * > The canvas needs to have a fixed size specified by CSS.
 
 * ```js
 * import { CircleFactory, CircleLight, hsl, runAnimation } from 'sdf-2d';
 *
 * const canvas = document.querySelector('canvas');
 * const Circle = CircleFactory(hsl(180, 100, 40));
 *
 * runAnimation(canvas, [Circle.descriptor, CircleLight.descriptor], (renderer, time) => {
 *   renderer.addDrawable(
 *     new Circle([150 + 50 * Math.cos(time / 1000), 75 + 50 * Math.sin(time / 1000)], 25)
 *   );
 *   renderer.addDrawable(new CircleLight([150, 75], hsl(270, 100, 40), 0.1));
 *   return true;
 * });
 * ```
 *
 * @param canvas The returned renderer will only be able to draw to this canvas.
 * @param descriptors The descriptor of every single object (and light) that
 * ever needs to be drawn by this renderer has to be given before compiling.
 * @param animate This function will be called before rendering each frame.
 * `renderDrawables` must not be called by the animate function. It should return `true`
 * if the animation should be continued. To break out of the animation loop, a `false` (falsy)
 * return value must be given.
 * @param startupSettingOverrides Sensible defaults are provided, but these can be overridden.
 * @param initialRuntimeSettingOverrides Sensible defaults are provided, but these can be overridden.
 */
export async function runAnimation(
  canvas: HTMLCanvasElement,
  descriptors: Array<DrawableDescriptor>,
  animate: (
    renderer: Renderer,
    currentTimeInMilliseconds: DOMHighResTimeStamp,
    deltaTimeInMilliseconds: DOMHighResTimeStamp
  ) => boolean,
  startupSettingOverrides: Partial<StartupSettings> = {},
  initialRuntimeSettingOverrides: Partial<RuntimeSettings> = {}
): Promise<void> {
  if (startupSettingOverrides.enableContextLostSimulator) {
    enableContextLostSimulator(canvas);
  }
  const renderer = new ContextAwareRenderer(canvas, descriptors, startupSettingOverrides);

  const deltaTimeCalculator = new DeltaTimeCalculator();
  let triggerIsOver: () => void;
  const isOver = new Promise((resolve) => (triggerIsOver = resolve));
  renderer.setRuntimeSettings(initialRuntimeSettingOverrides);
  const autoscaler = new FpsQualityAutoscaler(renderer);

  await renderer.initializedPromise;

  let startTime: DOMHighResTimeStamp | null = null;
  const handleFrame = (currentTime: DOMHighResTimeStamp) => {
    if (startTime === null) {
      startTime = currentTime;
    }
    const deltaTime = deltaTimeCalculator.getNextDeltaTime(currentTime);
    autoscaler.addDeltaTime(deltaTime);

    if (renderer.insights) {
      renderer.insights.fps = autoscaler.FPS;
    }

    const shouldStop = animate(renderer, currentTime - startTime, deltaTime);
    renderer.renderDrawables();

    if (!shouldStop) {
      triggerIsOver();
    } else {
      requestAnimationFrame(handleFrame);
    }
  };

  requestAnimationFrame(handleFrame);

  await isOver;
  deltaTimeCalculator.destroy();
  renderer.destroy();
}
