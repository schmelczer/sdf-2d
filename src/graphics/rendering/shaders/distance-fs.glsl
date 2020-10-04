#version 300 es

precision lowp float;

uniform float maxMinDistance;
uniform float distanceNdcPixelSize;
in vec2 position;

{macroDefinitions}

{declarations}

out vec2 fragmentColor;

void main() {
    float minDistance = maxMinDistance;
    float color = 0.0;

    float objectMinDistance, objectColor;

    {functionCalls}

    fragmentColor = vec2(minDistance, color);
}
