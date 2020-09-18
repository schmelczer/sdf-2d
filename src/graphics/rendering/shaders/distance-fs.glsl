#version 300 es

precision lowp float;

#define SURFACE_OFFSET 0.001
 
uniform float maxMinDistance;
uniform float distanceNdcPixelSize;
in vec2 position;

{macroDefinitions}

{declarations}

out vec2 fragmentColor;

void main() {
    float minDistance = maxMinDistance;
    float color = 0.0;

    {functionCalls}

    // minDistance / 2.0: NDC to UV scale
    fragmentColor = vec2(minDistance / 2.0, color);
}
