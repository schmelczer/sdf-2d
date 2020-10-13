#version 100

precision lowp float;

uniform float maxMinDistance;
uniform float distanceNdcPixelSize;
varying vec2 position;

uniform sampler2D palette;

vec4 readFromPalette(int index) {
  return texture2D(palette, vec2((float(index) + 0.5) / {paletteSize}, 0.5));
}


{macroDefinitions}

{declarations}

void main() {
    float minDistance = maxMinDistance, objectMinDistance;
    vec4 color = {backgroundColor};
    vec4 objectColor;

    {functionCalls}
    
    gl_FragColor = vec4(color.rgb, minDistance * 8.0);
}
