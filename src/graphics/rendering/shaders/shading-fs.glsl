#version 300 es

precision lowp float;

#define INFINITY 1000.0
#define INTENSITY_INSIDE_RATIO 0.5
#define SHADOW_TRACE_COUNT {shadowTraceCount}

{macroDefinitions}

uniform vec2 squareToAspectRatioTimes2;
uniform float shadingNdcPixelSize;
uniform float shadowLength;
uniform sampler2D distanceTexture;

in vec2 position;
in vec2 uvCoordinates;

uniform vec3 ambientLight;

vec3[3] colors = vec3[](
    {palette}
);

float getDistance(in vec2 target, out vec3 color) {
    vec4 values = texture(distanceTexture, target);
    color = colors[int(values[1])];
    return values[0];
}

float getDistance(in vec2 target) {
    return texture(distanceTexture, target)[0];
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
    uniform struct CircleLight {
        vec2 center;
        float intensity;
        vec3 color;
    }[CIRCLE_LIGHT_COUNT] circleLights;

    in vec2[CIRCLE_LIGHT_COUNT] circleLightDirections;

    vec3 colorInPosition(CircleLight light, out float lightCenterDistance) {
        lightCenterDistance = distance(light.center, position);
        return light.color / pow(
            lightCenterDistance / light.intensity + 1.0, 2.0
        );
    }

    vec3 colorInPositionInside(CircleLight light) {
        float lightCenterDistance = distance(light.center, position);
        return light.color / pow(
            lightCenterDistance / (light.intensity * INTENSITY_INSIDE_RATIO) + 1.0, 2.0
        );
    }
#endif
#endif

#ifdef FLASHLIGHT_COUNT
#if FLASHLIGHT_COUNT > 0
    uniform struct Flashlight {
        vec2 center;
        vec2 direction;
        float intensity;
        vec3 color;
    }[FLASHLIGHT_COUNT] flashlights;

    in vec2[FLASHLIGHT_COUNT] flashlightDirections;

    float intensityInDirection(vec2 lightDirection, vec2 targetDirection) {
        return smoothstep(0.0, 1.0, 10.0 * max(0.0, dot(targetDirection, lightDirection) - 0.9));
    }

    vec3 colorInPosition(Flashlight light, vec2 positionDirection, out float lightCenterDistance) {
        lightCenterDistance = distance(light.center, position);
        return intensityInDirection(light.direction, positionDirection) * light.color / pow(
            lightCenterDistance / light.intensity + 1.0, 2.0
        );
    }

    vec3 colorInPositionInside(Flashlight light, vec2 positionDirection) {
        float lightCenterDistance = distance(light.center, position);
        return intensityInDirection(light.direction, positionDirection) * light.color / pow(
            lightCenterDistance / (light.intensity * INTENSITY_INSIDE_RATIO) + 1.0, 2.0
        );
    }
#endif
#endif

out vec4 fragmentColor;
void main() {
    vec3 lighting = ambientLight;
    
    vec3 colorAtPosition;
    float startingDistance = getDistance(uvCoordinates, colorAtPosition);
    
    if (startingDistance < 0.0) {
        #ifdef CIRCLE_LIGHT_COUNT
        #if CIRCLE_LIGHT_COUNT > 0
        for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
            lighting += colorInPositionInside(circleLights[i]);
        }
        #endif
        #endif

        #ifdef FLASHLIGHT_COUNT
        #if FLASHLIGHT_COUNT > 0
        for (int i = 0; i < FLASHLIGHT_COUNT; i++) {
            lighting += colorInPositionInside(flashlights[i], normalize(flashlightDirections[i]));
        }
        #endif
        #endif
    } else {
        colorAtPosition = vec3(1.0);

        #ifdef CIRCLE_LIGHT_COUNT
        #if CIRCLE_LIGHT_COUNT > 0
        for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
            vec2 direction = normalize(circleLightDirections[i]) / squareToAspectRatioTimes2;

            float lightCenterDistance;
            vec3 lightColorAtPosition = colorInPosition(circleLights[i], lightCenterDistance);

            lighting += lightColorAtPosition * shadowTransparency(startingDistance, lightCenterDistance, direction);
        }
        #endif
        #endif

        #ifdef FLASHLIGHT_COUNT
        #if FLASHLIGHT_COUNT > 0
        for (int i = 0; i < FLASHLIGHT_COUNT; i++) {
            vec2 originalDirection = normalize(flashlightDirections[i]);
            vec2 direction = originalDirection / squareToAspectRatioTimes2;

            float lightCenterDistance;
            vec3 lightColorAtPosition = colorInPosition(flashlights[i], originalDirection, lightCenterDistance);
            
            if (length(lightColorAtPosition) < 0.01) {
                continue;
            }

            lighting += lightColorAtPosition * shadowTransparency(startingDistance, lightCenterDistance, direction);
        }
        #endif
        #endif
    }
    
    fragmentColor = vec4(colorAtPosition * lighting, 1.0);
}
