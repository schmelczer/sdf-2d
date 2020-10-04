#version 100

precision lowp float;

attribute vec4 vertexPosition;
varying vec2 uvCoordinates;

void main() {
    gl_Position = vec4(vertexPosition.xy, 0.0, 1.0);

    uvCoordinates = (
        vec3(vertexPosition.xy, 1.0) 
      * mat3(
        0.5, 0.0, 0.5,
        0.0, 0.5, 0.5,
        0.0, 0.0, 1.0
    )).xy;
}
