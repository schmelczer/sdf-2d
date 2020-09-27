import { enableExtension } from '../helper/enable-extension';
import { ParallelCompiler } from '../parallel-compiler';
import { UniversalRenderingContext } from '../universal-rendering-context';
import Program from './program';

export class FragmentShaderOnlyProgram extends Program {
  private vao?: WebGLVertexArrayObject;
  private vertexArrayExtension: any;
  constructor(gl: UniversalRenderingContext) {
    super(gl);
    if (!gl.isWebGL2) {
      this.vertexArrayExtension = enableExtension(this.gl, 'OES_vertex_array_object');
    }
  }

  public async initialize(
    sources: [string, string],
    substitutions: { [name: string]: string },
    compiler: ParallelCompiler
  ): Promise<void> {
    await super.initialize(sources, substitutions, compiler);
    this.prepareScreenQuad('vertexPosition');
  }

  public bind() {
    super.bind();
    if (this.gl.isWebGL2) {
      this.gl.bindVertexArray(this.vao!);
    } else {
      this.vertexArrayExtension.createVertexArrayOES();
    }
  }

  public draw(uniforms: { [name: string]: any }) {
    super.draw(uniforms);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  public destroy(): void {
    if (this.gl.isWebGL2) {
      this.gl.deleteVertexArray(this.vao!);
    } else {
      this.vertexArrayExtension.deleteVertexArrayOES(this.vao!);
    }

    super.destroy();
  }

  private prepareScreenQuad(attributeName: string) {
    const positionAttributeLocation = this.gl.getAttribLocation(
      this.program!,
      attributeName
    );

    const positionBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
      this.gl.STATIC_DRAW
    );

    if (this.gl.isWebGL2) {
      // can only return null on lost context
      this.vao = this.gl.createVertexArray()!;
      this.gl.bindVertexArray(this.vao!);
    } else {
      this.vao = this.vertexArrayExtension.createVertexArrayOES();
      this.vertexArrayExtension.bindVertexArrayOES(this.vao!);
    }

    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
  }
}
