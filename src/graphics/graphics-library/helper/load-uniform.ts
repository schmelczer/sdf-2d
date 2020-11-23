import { mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { UniversalRenderingContext } from '../universal-rendering-context';

/** @internal */
const loaderMat3 = mat3.create();

/** @internal */
const loaderMat4 = mat4.create();

/** @internal */
const converters: Map<
  GLenum,
  (gl: UniversalRenderingContext, value: any, location: WebGLUniformLocation) => void
> = new Map();
converters.set(WebGLRenderingContext.SAMPLER_2D, (gl, v, l) => gl.uniform1i(l, v));

converters.set(WebGLRenderingContext.INT, (gl, v: number | Array<number>, l) => {
  if (v instanceof Array) {
    if (v.length == 0) {
      return;
    }

    gl.uniform1iv(l, new Int32Array(v));
  } else {
    gl.uniform1i(l, v);
  }
});

converters.set(WebGLRenderingContext.BOOL, (gl, v: boolean | Array<boolean>, l) => {
  if (v instanceof Array) {
    if (v.length == 0) {
      return;
    }

    gl.uniform1iv(l, new Int32Array(v.map((b) => +b)));
  } else {
    gl.uniform1i(l, +v);
  }
});

converters.set(
  WebGLRenderingContext.FLOAT,
  (gl, v: number | Array<number> | Float32Array, l) => {
    if (v instanceof Array || v instanceof Float32Array) {
      if (v.length == 0) {
        return;
      }

      gl.uniform1fv(l, new Float32Array(v));
    } else {
      gl.uniform1f(l, v);
    }
  }
);

converters.set(
  WebGLRenderingContext.FLOAT_VEC2,
  (gl, v: vec2 | Array<vec2> | Float32Array, l) => {
    if (v.length == 0) {
      return;
    }

    if (v[0] instanceof Array || v[0] instanceof Float32Array) {
      const result = new Float32Array(v.length * 2);

      for (let i = 0; i < v.length; i++) {
        result[2 * i] = (v[i] as Array<number>).x;
        result[2 * i + 1] = (v[i] as Array<number>).y;
      }
      gl.uniform2fv(l, result);
    } else {
      gl.uniform2fv(l, v as vec2);
    }
  }
);

converters.set(
  WebGLRenderingContext.FLOAT_VEC3,
  (gl, v: vec3 | Array<vec3> | Float32Array, l) => {
    if (v.length == 0) {
      return;
    }

    if (v[0] instanceof Array || v[0] instanceof Float32Array) {
      const result = new Float32Array(v.length * 3);

      for (let i = 0; i < v.length; i++) {
        result[3 * i] = (v[i] as Array<number>)[0];
        result[3 * i + 1] = (v[i] as Array<number>)[1];
        result[3 * i + 2] = (v[i] as Array<number>)[2];
      }

      gl.uniform3fv(l, result);
    } else {
      gl.uniform3fv(l, v as vec3);
    }
  }
);

converters.set(
  WebGLRenderingContext.FLOAT_VEC4,
  (gl, v: vec4 | Array<vec4> | Float32Array, l) => {
    if (v.length == 0) {
      return;
    }

    if (v[0] instanceof Array || v[0] instanceof Float32Array) {
      const result = new Float32Array(v.length * 4);

      for (let i = 0; i < v.length; i++) {
        result[4 * i] = (v[i] as Array<number>)[0];
        result[4 * i + 1] = (v[i] as Array<number>)[1];
        result[4 * i + 2] = (v[i] as Array<number>)[2];
        result[4 * i + 3] = (v[i] as Array<number>)[3];
      }

      gl.uniform4fv(l, result);
    } else {
      gl.uniform4fv(l, v as vec4);
    }
  }
);

converters.set(WebGLRenderingContext.FLOAT_MAT3, (gl, v, l) => {
  if (gl.isWebGL2) {
    if (v.length < 9) {
      gl.uniformMatrix3fv(l, true, mat3.fromMat2d(loaderMat3, v));
    } else {
      gl.uniformMatrix3fv(l, true, v);
    }
  } else {
    if (v.length < 9) {
      gl.uniformMatrix3fv(
        l,
        false,
        mat3.transpose(loaderMat3, mat3.fromMat2d(loaderMat3, v))
      );
    } else {
      gl.uniformMatrix3fv(l, false, mat3.transpose(loaderMat3, v));
    }
  }
});

converters.set(WebGLRenderingContext.FLOAT_MAT4, (gl, v, l) => {
  if (gl.isWebGL2) {
    gl.uniformMatrix4fv(l, true, v);
  } else {
    gl.uniformMatrix4fv(l, false, mat4.transpose(loaderMat4, v));
  }
});

/** @internal */
export const loadUniform = (
  gl: UniversalRenderingContext,
  value: any,
  type: GLenum,
  location: WebGLUniformLocation
): any => {
  {
    if (!converters.has(type)) {
      throw new Error(`Unimplemented webgl type: ${type}`);
    }

    converters.get(type)!(gl, value, location);
  }
};
