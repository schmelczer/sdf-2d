#version 300 es

precision lowp float;

uniform mat3 modelTransform;
uniform vec2 squareToAspectRatio;

in vec4 vertexPosition;
out vec2 position;

void main() {
    vec3 vertexPosition2D = vec3(vertexPosition.xy, 1.0) * modelTransform;
    gl_Position = vec4(vertexPosition2D.xy, 0.0, 1.0);
    position = vertexPosition2D.xy * squareToAspectRatio;
}
