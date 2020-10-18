#version 100

precision lowp float;

#define INTENSITY_INSIDE_RATIO 0.5
#define SHADOW_TRACE_COUNT {shadowTraceCount}

{macroDefinitions}

uniform float shadingNdcPixelSize;
uniform vec2 squareToAspectRatioTimes2;
uniform vec3 ambientLight;

uniform sampler2D colorTexture;

varying vec2 position;
varying vec2 uvCoordinates;

float getDistance(in vec2 target, out vec4 color) {
    vec4 values = texture2D(colorTexture, target);
    color = vec4(values.rgb, 1.0);
    return values[3] / 8.0;
}

float getDistance(in vec2 target) {
    return texture2D(colorTexture, target)[3] / 8.0;
}

float shadowTransparency(float startingDistance, float lightCenterDistance, vec2 direction) {
    float rayLength = startingDistance;
    for (int j = 0; j < SHADOW_TRACE_COUNT; j++) {
        rayLength += max(0.0, getDistance(uvCoordinates + direction * rayLength));
    }
    return min(1.0, pow(rayLength / lightCenterDistance, 0.3));
}

#ifdef CIRCLE_LIGHT_COUNT
#if CIRCLE_LIGHT_COUNT > 0
    uniform vec2 circleLightCenters[CIRCLE_LIGHT_COUNT];
    uniform float circleLightIntensities[CIRCLE_LIGHT_COUNT];
    uniform vec3 circleLightColors[CIRCLE_LIGHT_COUNT];
#endif
#endif

#ifdef FLASHLIGHT_COUNT
#if FLASHLIGHT_COUNT > 0
    uniform vec2 flashlightCenters[FLASHLIGHT_COUNT];
    uniform float flashlightIntensities[FLASHLIGHT_COUNT];
    uniform vec3 flashlightColors[FLASHLIGHT_COUNT];
    uniform vec2 flashlightDirections[FLASHLIGHT_COUNT];

    float intensityInDirection(vec2 lightDirection, vec2 targetDirection) {
        return smoothstep(
            0.0,
            1.0,
            10.0 * max(0.0, dot(targetDirection, -lightDirection) - 0.9)
        );
    }
#endif
#endif

void main() {
    vec4 rgbaColorAtPosition;
    float startingDistance = getDistance(uvCoordinates, rgbaColorAtPosition);

    vec3 colorAtPosition = rgbaColorAtPosition.rgb;

    vec3 lighting = ambientLight;
    vec3 lightingInside = ambientLight;

    #ifdef CIRCLE_LIGHT_COUNT
    #if CIRCLE_LIGHT_COUNT > 0
    for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
        float lightCenterDistance = distance(circleLightCenters[i], position);

        vec3 lightColorAtPosition = circleLightColors[i] / pow(
            lightCenterDistance / circleLightIntensities[i] + 1.0, 2.0
        );

        vec2 direction = normalize(circleLightCenters[i] - position) / squareToAspectRatioTimes2;
        lighting += lightColorAtPosition * shadowTransparency(
            startingDistance, 
            lightCenterDistance, 
            direction
        );

        lightingInside += lightColorAtPosition;
    }
    #endif
    #endif

    #ifdef FLASHLIGHT_COUNT
    #if FLASHLIGHT_COUNT > 0
    for (int i = 0; i < FLASHLIGHT_COUNT; i++) {
        vec2 originalDirection = normalize(flashlightCenters[i] - position);

        float lightCenterDistance = distance(flashlightCenters[i], position);

        vec3 lightColorAtPosition = intensityInDirection(flashlightDirections[i], originalDirection) 
            * flashlightColors[i] / pow(
                lightCenterDistance / flashlightIntensities[i] + 1.0, 2.0
            );

        vec2 direction = originalDirection / squareToAspectRatioTimes2;

        if (length(lightColorAtPosition) < 0.0) {
            continue;
        }

        lighting += lightColorAtPosition * shadowTransparency(
            startingDistance, 
            lightCenterDistance, 
            direction
        );

        lightingInside += lightColorAtPosition;
    }
    #endif
    #endif

    vec3 outsideColor = {backgroundColor}.rgb * lighting;
    vec3 insideColor = colorAtPosition * lightingInside * INTENSITY_INSIDE_RATIO;

    float edge = clamp(startingDistance / shadingNdcPixelSize, 0.0, 1.0);
    vec3 antialiasedColor = mix(insideColor, outsideColor, edge);
    gl_FragColor = vec4(
        antialiasedColor,
        rgbaColorAtPosition.a
    );
}
