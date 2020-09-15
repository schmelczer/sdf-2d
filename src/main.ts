import { glMatrix } from 'gl-matrix';
import { applyArrayPlugins } from './helper/array';
import { Random } from './helper/random';

glMatrix.setMatrixArrayType(Array);
applyArrayPlugins();

const main = async () => {
  try {
    Random.seed = 42;
    //await new Game().start();
  } catch (e) {
    console.error(e);
    alert(e);
  }
};

main();
