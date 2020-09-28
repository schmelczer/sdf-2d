# ![SDF-2D logo](../docs/media/logo-colored.svg) Documentation

Background and more in depth information about the rendring techniques can be found in [this technical report](media/sdf-2d.pdf).

## Links

- [Repository](https://github.com/schmelczerandras/sdf-2d)
- [Demo](https://sdf2d.schmelczer.dev/)
- [Minimal example](https://github.com/schmelczerandras/sdf-2d-minimal-example)
- [More complex example](https://github.com/schmelczerandras/sdf-2d-minimal-example)

## Important to know

### Coordinates

Anywhere, where positions need to specified, the `y` values grow upwards, so are the `x` values. That means, when specifying the view area, the origin is at the bottom left corner of the display.

### Tile-based rendering

For optimising the evaluation of the distance field, the display is divided up into a grid of tiles. The shader for each tile is compiled to support a fix maximum number of objects on it. When using the built-in drawables, it is possible that after a certain number of on-screen objects, new ones won't be visible.

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

> Steps are very useful for tile-based rendering, because it is possible for one tile (at a given moment) to be empty or contain just a few objects, while others have a large cluster of objects. The compiled shaders only take into account the necesseary number of objects on each tiles.

## Usage

To start using cutting-edge 2D graphics, first you have get a renderer instance. This is possible by calling the [compile function](globals.html#compile).
