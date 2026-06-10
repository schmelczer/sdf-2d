# ![SDF-2D logo](media/logo-colored.svg) Documentation

The motivation behind this library and more in-depth information about the rendering techniques utilised can be found in [my thesis](media/thesis-andras-schmelczer.pdf).

## Links

- [Repository](https://github.com/schmelczerandras/sdf-2d)
- [Demo](https://sdf2d.schmelczer.dev/)
- [Minimal example](https://github.com/schmelczerandras/sdf-2d-minimal-example)
- [More complex example](https://github.com/schmelczerandras/sdf-2d-more-complex-example)
- [Source code of the demo](https://github.com/schmelczerandras/sdf-2d-demo)

## Usage (1st option)

- To start using cutting-edge 2D graphics, you first need a renderer instance. You can get one by calling the [compile function](globals.html#compile).
  - For this, you have to provide one or more [DrawableDescriptors](interfaces/drawabledescriptor.html).
  - Optionally, the default compile settings can be overridden using [StartupSettings](interfaces/startupsettings.html).
- Once you have a renderer, you can start drawing objects through the [Renderer](interfaces/renderer.html) interface.

## Usage (2nd option)

If you're planning to create animated content, use the [runAnimation function](globals.html#runanimation) to save yourself from writing boilerplate code.
See its [documentation](globals.html#runanimation) for more details.

## Extending drawables

> Iñigo Quilez has a great collection of [2D SDFs](https://iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm)

- Subclass [Drawable](classes/drawable.html)
- Implement its abstract methods
- Add a static `descriptor` property of type [DrawableDescriptor](interfaces/drawabledescriptor.html) to your class
- Follow the instructions given in [Usage](#usage-1st-option)

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
