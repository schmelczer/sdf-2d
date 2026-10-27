# ![SDF-2D logo](media/logo-colored.svg) Documentation

The motivation behind this library and more in-depth information about the rendering techniques utilised can be found in [my thesis](media/thesis-andras-schmelczer.pdf).

## Links

- [Repository](https://git.schmelczer.dev/andras/sdf-2d)
- [Demo](https://sdf2d.schmelczer.dev/)
- [Minimal example](https://github.com/schmelczerandras/sdf-2d-minimal-example)
- [More complex example](https://github.com/schmelczerandras/sdf-2d-more-complex-example)
- [Source code of the demo](https://git.schmelczer.dev/andras/sdf-2d-demo)

## Usage (1st option)

- To start using cutting-edge 2D graphics, you first need a renderer instance. You can get one by calling the [compile function](functions/compile.compile.html).
  - For this, you have to provide one or more [DrawableDescriptors](interfaces/drawables_drawable-descriptor.DrawableDescriptor.html).
  - Optionally, the default compile settings can be overridden using [StartupSettings](interfaces/graphics_rendering_settings_startup-settings.StartupSettings.html).
- Once you have a renderer, you can start drawing objects through the [Renderer](interfaces/graphics_rendering_renderer_renderer.Renderer.html) interface.

## Usage (2nd option)

If you're planning to create animated content, use the [runAnimation function](functions/run-animation.runAnimation.html) to save yourself from writing boilerplate code.
See its [documentation](functions/run-animation.runAnimation.html) for more details.

## Extending drawables

> Iñigo Quilez has a great collection of [2D SDFs](https://iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm)

- Subclass [Drawable](classes/drawables_drawable.Drawable.html)
- Implement its abstract methods
- Add a static `descriptor` property of type [DrawableDescriptor](interfaces/drawables_drawable-descriptor.DrawableDescriptor.html) to your class
- Follow the instructions given in [Usage](#usage-1st-option)

### Custom drawable example

The function named by `sdf.distanceFunctionName` must have the signature
`float distanceFunction(in vec2 target, out vec4 color)` in both GLSL 100 and GLSL 300 ES.
It returns the signed distance (negative inside, zero on the boundary, positive outside)
and writes the closest drawable's RGBA color to `color` on every code path.

This complete example defines a custom orange circle, maps its serialized properties
to shader uniforms, and compiles and renders it. Use it in a JavaScript module with
`sdf-2d` and `gl-matrix` installed. Documentation CI runs this exact code with both
WebGL 1 and WebGL 2.


```js
import { compile, Drawable } from 'sdf-2d';
import { vec2 } from 'gl-matrix';

class CustomCircle extends Drawable {
  constructor(center, radius) {
    super();
    this.center = center;
    this.radius = radius;
  }

  static descriptor = {
    propertyUniformMapping: {
      center: 'customCircleCenters',
      radius: 'customCircleRadii',
    },
    uniformCountMacroName: 'CUSTOM_CIRCLE_COUNT',
    shaderCombinationSteps: [0, 1, 4],
    // Unused array entries are filled with this zero-radius circle and moved away.
    empty: new CustomCircle([0, 0], 0),
    sdf: {
      distanceFunctionName: 'customCircleDistance',
      shader: `
        uniform vec2 customCircleCenters[CUSTOM_CIRCLE_COUNT];
        uniform float customCircleRadii[CUSTOM_CIRCLE_COUNT];

        float customCircleDistance(in vec2 target, out vec4 color) {
          color = vec4(1.0, 0.25, 0.0, 1.0);
          float minDistance = 1000.0;
          for (int i = 0; i < CUSTOM_CIRCLE_COUNT; i++) {
            float d = distance(target, customCircleCenters[i]) - customCircleRadii[i];
            minDistance = min(minDistance, d);
          }
          return minDistance;
        }
      `,
    },
  };

  minDistance(target) {
    return vec2.distance(this.center, target) - this.radius;
  }

  getObjectToSerialize(transform2d, transform1d) {
    return {
      center: vec2.transformMat2d(vec2.create(), this.center, transform2d),
      radius: this.radius * transform1d,
    };
  }
}

const canvas = document.createElement('canvas');
canvas.width = 320;
canvas.height = 240;
document.body.appendChild(canvas);

const renderer = await compile(canvas, [CustomCircle.descriptor]);
renderer.setRuntimeSettings({ ambientLight: [1, 1, 1], motionBlur: 0 });
renderer.addDrawable(new CustomCircle([160, 120], 50));
renderer.renderDrawables();

// Call renderer.destroy() when the renderer is no longer needed.
```

## Useful to know

### Math

The `vec2`, `vec3`, and `vec4` types seen in the documentation come from the [glMatrix](http://glmatrix.net/) library and are equivalent to regular JS Arrays or Float32Arrays, so feel free to pass `[x, y]` to functions that expect a `vec2`.

### Coordinates

Wherever positions need to be specified, the `y` axis grows upwards. This means that when you set the view area, the origin is at the bottom-left corner of the display.

### Tile-based rendering

To optimise the evaluation of the distance field, the display is divided into a grid of tiles. The shaders for each tile are compiled to support a fixed maximum number of objects. When using the built-in drawables, this means that beyond a certain number of on-screen objects, new ones may stop appearing.

Mitigating this is easy. Instead of the following code:

```js
this.renderer = await compile(canvas, [Circle.descriptor, CircleLight.descriptor]);
```

modify it to something like this:

```js
this.renderer = await compile(canvas, [
  {
    ...Circle.descriptor,
    shaderCombinationSteps: [0, 1, 2, 24, 64],
  },
  {
    ...CircleLight.descriptor,
    shaderCombinationSteps: [0, 1, 2, 4],
  },
]);
```

Using very large numbers is not advised, for both compatibility and performance reasons.

> Steps are especially useful for tile-based rendering: at any given moment, one tile may be empty or contain just a few objects, while another holds a large cluster. The compiled shaders only account for the number of objects actually present on each tile.
