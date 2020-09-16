import Program from './program';

export class FragmentShaderOnlyProgram extends Program {
  private vao?: WebGLVertexArrayObject;

  constructor(
    gl: WebGL2RenderingContext,
    sources: [string, string],
    substitutions: { [name: string]: string }
  ) {
    super(gl, sources, substitutions);
    this.prepareScreenQuad('vertexPosition');
  }

  public bind() {
    super.bind();
    this.gl.bindVertexArray(this.vao!);
  }

  public draw() {
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
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
    const vao = this.gl.createVertexArray();
    if (!vao) {
      throw new Error('Could not create vertex array object');
    }
    this.vao = vao;

    this.gl.bindVertexArray(this.vao);
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
  }
}
