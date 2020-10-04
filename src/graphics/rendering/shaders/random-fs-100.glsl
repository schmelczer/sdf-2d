#version 100

precision lowp float;

varying vec2 uvCoordinates;

uniform float scale;
uniform float amplitude;

float noise(float x){
    return fract(sin(x) * 43758.5453123) / 100.0;
}

float terrain(float x) {
    float result = 0.0;

    float frequency = 0.01;
    float amplitude = 1.0;
  
    const float pi = 3.141592654;
    for (int i = 0; i < 8; i++) {
        result += sin(2.0 * pi * x * frequency - 2.0 * pi * noise(float(i) * 200.0)) * amplitude;
        frequency *= 1.5;
        amplitude /= 1.2;
    }

    return result;
}

void main() {
    gl_FragColor = vec4(vec3(terrain(uvCoordinates.x * scale) * amplitude + 0.5), 1.0);
}
