#version 100

precision lowp float;

#define INFINITY 1000.0
#define INTENSITY_INSIDE_RATIO 0.5
#define SHADOW_TRACE_COUNT {shadowTraceCount}

{macroDefinitions}

uniform vec2 squareToAspectRatioTimes2;
uniform float shadingNdcPixelSize;
uniform float shadowLength;
uniform sampler2D distanceTexture;

varying vec2 position;
varying vec2 uvCoordinates;
uniform vec3 ambientLight;

vec3 colors[{colorCount}];

float getDistance(in vec2 target, out vec3 color) {
    vec4 values = texture2D(distanceTexture, target);
    color = vec3(0.5);
    return values[0];
}

float getDistance(in vec2 target) {
    return texture2D(distanceTexture, target)[0];
}

float shadowTransparency(float startingDistance, float lightCenterDistance, vec2 direction) {
    float rayLength = startingDistance;
    
    for (int j = 0; j < SHADOW_TRACE_COUNT; j++) {
        rayLength += getDistance(uvCoordinates + direction * rayLength);
    }

    return min(
        1.0, 
        (
            step(lightCenterDistance, rayLength) +
            rayLength / (shadowLength * shadingNdcPixelSize)
        ) * 2.0
    );
}

#ifdef CIRCLE_LIGHT_COUNT
#if CIRCLE_LIGHT_COUNT > 0
    uniform vec2 circleLightCenters[CIRCLE_LIGHT_COUNT];
    uniform float circleLightIntensities[CIRCLE_LIGHT_COUNT];
    uniform vec3 circleLightColors[CIRCLE_LIGHT_COUNT];
    
    varying vec2 circleLightDirections[CIRCLE_LIGHT_COUNT];
#endif
#endif

#ifdef FLASHLIGHT_COUNT
#if FLASHLIGHT_COUNT > 0
    uniform vec2 flashlightCenters[FLASHLIGHT_COUNT];
    uniform float flashlightIntensities[FLASHLIGHT_COUNT];
    uniform vec3 flashlightColors[FLASHLIGHT_COUNT];
    uniform vec2 flashlightDirections[FLASHLIGHT_COUNT];

    varying vec2 flashlightActualDirections[FLASHLIGHT_COUNT];

    float intensityInDirection(vec2 lightDirection, vec2 targetDirection) {
        return smoothstep(0.0, 1.0, 10.0 * max(0.0, dot(targetDirection, lightDirection) - 0.9));
    }
#endif
#endif

void main() {
    vec3 lighting = ambientLight;

    {palette};
    
    vec3 colorAtPosition;
    float startingDistance = getDistance(uvCoordinates, colorAtPosition);
    
    if (startingDistance < 0.0) {
        #ifdef CIRCLE_LIGHT_COUNT
        #if CIRCLE_LIGHT_COUNT > 0
        for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
            float lightCenterDistance = distance(circleLightCenters[i], position);
            lighting += circleLightColors[i] / pow(
                lightCenterDistance / (circleLightIntensities[i] * INTENSITY_INSIDE_RATIO) + 1.0, 2.0
            );
        }
        #endif
        #endif

        #ifdef FLASHLIGHT_COUNT
        #if FLASHLIGHT_COUNT > 0
        for (int i = 0; i < FLASHLIGHT_COUNT; i++) {
            float lightCenterDistance = distance(flashlightCenters[i], position);
            lighting += intensityInDirection(
                flashlightDirections[i], 
                normalize(flashlightActualDirections[i])
            ) * flashlightColors[i] / pow(
                lightCenterDistance / (flashlightIntensities[i] * INTENSITY_INSIDE_RATIO) + 1.0, 2.0
            );
        }
        #endif
        #endif
    } else {
        colorAtPosition = vec3(1.0);

        #ifdef CIRCLE_LIGHT_COUNT
        #if CIRCLE_LIGHT_COUNT > 0
        for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
            vec2 direction = normalize(circleLightDirections[i]) / squareToAspectRatioTimes2;

            float lightCenterDistance = distance(circleLightCenters[i], position);
            lighting += circleLightColors[i] / pow(
                lightCenterDistance / circleLightIntensities[i] + 1.0, 2.0
            ) * shadowTransparency(startingDistance, lightCenterDistance, direction);
        }
        #endif
        #endif

        #ifdef FLASHLIGHT_COUNT
        #if FLASHLIGHT_COUNT > 0
        for (int i = 0; i < FLASHLIGHT_COUNT; i++) {
            vec2 originalDirection = normalize(flashlightDirections[i]);
            vec2 direction = originalDirection / squareToAspectRatioTimes2;

            float lightCenterDistance = distance(flashlightCenters[i], position);
            vec3 lightColorAtPosition = intensityInDirection(flashlightDirections[i], positionDirection) *
            flashlightColors[i] / pow(
                lightCenterDistance / flashlightIntensities[i] + 1.0, 2.0
            );
            
            if (length(lightColorAtPosition) < 0.01) {
                continue;
            }

            lighting += lightColorAtPosition * shadowTransparency(startingDistance, lightCenterDistance, direction);
        }
        #endif
        #endif
    }
    
    gl_FragColor = vec4(colorAtPosition * lighting, 1.0);
}
