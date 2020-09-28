# ![SDF-2D logo](media/logo-colored.svg) SDF-2D library

A graphics library to enable the rendering of 2D signed distance fields (SDF-s) on web.

[View it in action!](https://sdf2d.schmelczer.dev)

> Further documentation will be provided by the end of September 2020.

- [Minimal example using Webpack](#minimal-example-using-webpack)
  - [Instructions](#instructions)
  - [End result](#end-result)
- [More complex example](#more-complex-example)
  - [Instructions](#instructions-1)
  - [End result](#end-result-1)
- [Real life example](#real-life-example)

## Minimal example using Webpack

> Certainly, other build tools can be used as well.

### Instructions

> A tutorial for installing Webpack is also included below, for more information about Webpack visit [their getting started page](https://webpack.js.org/guides/getting-started/).

- Install [Node.js](https://nodejs.org/en/)
- Create a directory called `sdf-2d-example` and open a terminal inside it

- Run the following commands
  ```sh
  npm init -y
  npm install webpack webpack-cli sdf-2d --save-dev
  ```
- Create a directory called `src`, and a new file inside of it named `index.html`
- Copy the following code into `sdf-2d-example/dist/index.html`
  ```html
  <!DOCTYPE html>
  <html>
    <body>
      <canvas width="600" height="300"></canvas>
      <script src="main.js"></script>
    </body>
  </html>
  ```
- Create a directory called `src`, and a new file inside of it named `index.js`
- Copy the following code into `sdf-2d-example/src/index.js`

  ```js
  import { compile, Circle, CircleLight } from 'sdf-2d';

  const main = async () => {
    const canvas = document.querySelector('canvas');
    const renderer = await compile(canvas, [Circle.descriptor, CircleLight.descriptor]);

    renderer.addDrawable(new Circle([200, 200], 50));
    renderer.addDrawable(new CircleLight([500, 300], [1, 0.5, 0], 0.5));

    renderer.renderDrawables();
  };

  main();
  ```

- Inside `sdf-2d-example`, execute the command `npx webpack`, this will generate a new file in your `dist` folder.
- You're finished, open `sdf-2d-example/dist/index.html`

### End result

The result of the above instructions can also be found [in this repository](https://github.com/schmelczerandras/sdf-2d-minimal-example) and the finished website is [available here](https://schmelczerandras.github.io/sdf-2d-minimal-example/dist/index.html).

## More complex example

### Instructions

We'll be using the files and directory structure created in the [minimal example](#minimal-example-using-webpack).

- Paste the following `HTML` into the `<head>` of `index.html`
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html,
    body,
    canvas {
      margin: 0;
      width: 100%;
      height: 100%;
    }
  </style>
  ```
- Install [gl-matrix](http://glmatrix.net/docs/) by running `npm install gl-matrix --save-dev`
- Copy the following code into `index.js`

  ```js
  import { vec2, vec3 } from 'gl-matrix';
  import { compile, Circle, CircleLight } from 'sdf-2d';

  const main = async () => {
    const canvas = document.querySelector('canvas');

    const renderer = await compile(canvas, [Circle.descriptor, CircleLight.descriptor]);

    renderer.setRuntimeSettings({
      colorPalette: [
        vec3.create(),
        vec3.create(),
        vec3.fromValues(0.5, 0.2, 1), // By default, Circle has a colorIndex of 2
      ],
    });

    let aspectRatio;
    const setViewArea = () => {
      const canvasSize = renderer.canvasSize;
      aspectRatio = canvasSize.x / canvasSize.y;

      // The view area is given in a coordinate system
      // originated from the bottom (!) left edge of the canvas
      renderer.setViewArea(vec2.fromValues(0, 1), vec2.fromValues(aspectRatio, 1));
    };

    setViewArea();
    onresize = setViewArea;

    const circle = new Circle(vec2.fromValues(0.5, 0.5), 0.1);
    const light = new CircleLight(vec2.create(), vec3.fromValues(1, 0.5, 0.1), 0.0005);

    const animate = (currentTime) => {
      vec2.set(circle.center, aspectRatio / 2, 0.5);
      vec2.set(light.center, ((Math.sin(currentTime / 1000) + 1) / 2) * aspectRatio, 1);

      renderer.addDrawable(circle);
      renderer.addDrawable(light);
      renderer.renderDrawables();

      console.log(renderer.insights);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  main();
  ```

- Run `npx webpack`
- You're finished, open `index.html`

### End result

The result of the above instructions can also be found [in this repository](https://github.com/schmelczerandras/sdf-2d-more-complex-example) and the finished website is [available here](https://schmelczerandras.github.io/sdf-2d-more-complex-example/dist/index.html).

## Real life example

The source code for the [demo page](https://sdf2d.schmelczer.dev) of this library is available [here, on GitHub](https://github.com/schmelczerandras/sdf-2d-demo).
