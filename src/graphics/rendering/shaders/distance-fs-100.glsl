#version 100

precision lowp float;

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

    gl_FragColor = vec4(minDistance * 8.0, color, 0.0, 1.0);
}
