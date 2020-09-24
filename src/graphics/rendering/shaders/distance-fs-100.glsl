#version 100

precision lowp float;

#define SURFACE_OFFSET 0.001
 
uniform float maxMinDistance;
uniform float distanceNdcPixelSize;
varying vec2 position;

{macroDefinitions}

{declarations}

void main() {
    float minDistance = abs(maxMinDistance);
    float color = 0.0;

    float objectMinDistance, objectColor;

    {functionCalls}
    
    #ifndef NOT_EMPTY
    minDistance = maxMinDistance;
    #endif

    // minDistance / 2.0: NDC to UV scale
    gl_FragColor = vec4(minDistance / 2.0, color, 0.0, 0.0);
}
