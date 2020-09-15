import { mat3, ReadonlyVec3, vec2, vec3 } from 'gl-matrix';

const loaderMat3 = mat3.create();

export const loadUniform = (
  gl: WebGL2RenderingContext,
  value: any,
  type: GLenum,
  location: WebGLUniformLocation
): any => {
  const converters: Map<
    GLenum,
    (gl: WebGL2RenderingContext, value: any, location: WebGLUniformLocation) => void
  > = new Map();
  {
    converters.set(WebGL2RenderingContext.FLOAT, (gl, v, l) => {
      if (v instanceof Array) {
        if (v.length == 0) {
          return;
        }

        gl.uniform1fv(l, new Float32Array(v));
      } else {
        gl.uniform1f(l, v);
      }
    });

    converters.set(WebGL2RenderingContext.FLOAT_VEC2, (gl, v: vec2 | Array<vec2>, l) => {
      if (v.length == 0) {
        return;
      }

      if (v[0] instanceof Array) {
        const result = new Float32Array(v.length * 2);

        for (let i = 0; i < v.length; i++) {
          result[2 * i] = (v[i] as Array<number>).x;
          result[2 * i + 1] = (v[i] as Array<number>).y;
        }

        gl.uniform2fv(l, result);
      } else {
        gl.uniform2fv(l, v as vec2);
      }
    });

    converters.set(
      WebGL2RenderingContext.FLOAT_VEC3,
      (gl, v: ReadonlyVec3 | Array<vec3>, l) => {
        if (v.length == 0) {
          return;
        }

        if (v[0] instanceof Array) {
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

    converters.set(WebGL2RenderingContext.FLOAT_MAT3, (gl, v, l) => {
      gl.uniformMatrix3fv(l, true, mat3.fromMat2d(loaderMat3, v));
    });

    converters.set(WebGL2RenderingContext.BOOL, (gl, v, l) => gl.uniform1i(l, v));

    if (!converters.has(type)) {
      throw new Error(`Unimplemented webgl type: ${type}`);
    }

    converters.get(type)!(gl, value, location);
  }
};
