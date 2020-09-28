# ![SDF-2D logo](media/logo-colored.svg) Documentation

The motivation behind this library and more in-depth information about the rendering techniques utilised can be found in [this technical report](media/sdf-2d.pdf).

## Links

- [Repository](https://github.com/schmelczerandras/sdf-2d)
- [Demo](https://sdf2d.schmelczer.dev/)
- [Minimal example](https://github.com/schmelczerandras/sdf-2d-minimal-example)
- [More complex example](https://github.com/schmelczerandras/sdf-2d-more-complex-example)
- [Source code of the demo](https://github.com/schmelczerandras/sdf-2d-demo)

## Usage

- To start using cutting-edge 2D graphics, first you have get a renderer instance. This is possible by calling the [compile function](globals.html#compile).
  - For this, some [DrawableDescriptors](interfaces/drawabledescriptor.html) has to be provided.
  - Optionally, default compile settings can overridden using [StartupSettings](interfaces/startupsettings.html).
- After acquiring a renderer, the drawing of objects can be started through the [Renderer](interfaces/renderer.html) interface.

## Extending drawables

> Iñigo Quilez has some great [2D SDF-s](https://iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm)

- Subclass [Drawable](classes/drawable.html)
- Implement its abstract methods
- Add a static property to your class called `descriptor` of type [DrawableDescriptors](interfaces/drawabledescriptor.html)
- Follow the instructions given in [Usage](#usage)

## Useful to know

### Math

The `vec2`, `vec3`, and `vec4` types seen in the documentation come from the [glMatrix](http://glmatrix.net/) library and are equivalent to regular JS Arrays or Float32Arrays. So, feel free to give `[x, y]` as an input for functions requiring `vec2`.

### Coordinates

Anywhere, where positions need to be specified, the `y` values grow upwards. That means, when setting the view area, the origin is at the bottom left corner of the display.

### Tile-based rendering

For optimising the evaluation of the distance field, the display is divided up into a grid of tiles. The shaders for each tile are compiled to support a fix maximum number of objects on it. When using the built-in drawables it is possible that after a certain number of on-screen objects new ones won't be visible.

Mitigating this issue is quite easy. Instead of the following code:

```js
this.renderer = await compile(canvas, [Circle.descriptor, CircleLight.descriptor]);
```

Modify it to something similar:

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

The usage of too large numbers is not advised for compatibility and performance reasons alike.

> Steps are very useful for tile-based rendering, because it is possible for one tile (at a given moment) to be empty or contain just a few objects, while others have a large cluster of objects. The compiled shaders only take into account the necessary number of objects on each tile.
