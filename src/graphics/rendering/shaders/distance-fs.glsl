#version 300 es

precision lowp float;

uniform float maxMinDistance;
uniform float distanceNdcPixelSize;
in vec2 position;

{macroDefinitions}

{declarations}

out vec2 fragmentColor;

void main() {
    float minDistance = abs(maxMinDistance);
    float color = 0.0;

    float objectMinDistance, objectColor;

    {functionCalls}

    #ifndef NOT_EMPTY
    minDistance = maxMinDistance;
    #endif

    fragmentColor = vec2(minDistance, color);
}
