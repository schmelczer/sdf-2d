#version 300 es

precision lowp float;

#define INFINITY 1000.0
#define LIGHT_DROP_INSIDE_RATIO 0.3
#define AMBIENT_LIGHT vec3(0.25, 0.15, 0.25)
#define SHADOW_HARDNESS 150.0

#define CIRCLE_LIGHT_COUNT {circleLightCount}
#define FLASHLIGHT_COUNT {flashlightCount}

uniform bool softShadowsEnabled;
uniform vec2 squareToAspectRatioTimes2;
uniform float shadingNdcPixelSize;
uniform sampler2D distanceTexture;

in vec2 position;
in vec2 uvCoordinates;

vec3[3] colors = vec3[](
    vec3(0.4, 0.35, 0.6),   // cave color
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0)
);

float getDistance(in vec2 target, out vec3 color) {
    vec4 values = texture(distanceTexture, target);
    color = colors[int(values[1])];
    return values[0];
}

float getDistance(in vec2 target) {
    return texture(distanceTexture, target)[0];
}

float softShadowTransparency(float startingDistance, float lightCenterDistance, vec2 direction) {
    float rayLength = startingDistance;
    float q = 1.0 / SHADOW_HARDNESS;

    for (int j = 0; j < 128; j++) {
        float minDistance = getDistance(uvCoordinates + direction * rayLength);

        q = min(q, minDistance / rayLength);
        rayLength += minDistance / 2.5;

        if (rayLength >= lightCenterDistance) {
            return q * SHADOW_HARDNESS;
        }
    }

    return 0.0;
}

float hardShadowTransparency(float startingDistance, float lightCenterDistance, vec2 direction) {
    float rayLength = startingDistance;
    
    for (int j = 0; j < 32; j++) {
        rayLength += getDistance(uvCoordinates + direction * rayLength);
    }

    return step(lightCenterDistance, rayLength);
}

float shadowTransparency(float startingDistance, float lightCenterDistance, vec2 direction) {
    return softShadowsEnabled ? 
        softShadowTransparency(startingDistance, lightCenterDistance, direction) :
        hardShadowTransparency(startingDistance, lightCenterDistance, direction);
}
 

#if CIRCLE_LIGHT_COUNT > 0
    uniform struct CircleLight {
        vec2 center;
        float lightDrop;
        vec3 value;
    }[CIRCLE_LIGHT_COUNT] circleLights;

    in vec2[CIRCLE_LIGHT_COUNT] circleLightDirections;

    vec3 colorInPosition(CircleLight light, out float lightCenterDistance) {
        lightCenterDistance = distance(light.center, position);
        return light.value / pow(
            lightCenterDistance / light.lightDrop + 1.0, 2.0
        );
    }

    vec3 colorInPositionInside(CircleLight light) {
        float lightCenterDistance = distance(light.center, position);
        return light.value / pow(
            lightCenterDistance / (light.lightDrop * LIGHT_DROP_INSIDE_RATIO) + 1.0, 2.0
        );
    }
#endif

#if FLASHLIGHT_COUNT > 0
    uniform struct Flashlight {
        vec2 center;
        vec2 direction;
        float lightDrop;
        vec3 value;
    }[FLASHLIGHT_COUNT] flashlights;

    in vec2[FLASHLIGHT_COUNT] flashlightDirections;

    float intensityInDirection(vec2 lightDirection, vec2 targetDirection) {
        return smoothstep(0.0, 1.0, 10.0 * max(0.0, dot(targetDirection, lightDirection) - 0.9));
    }

    vec3 colorInPosition(Flashlight light, vec2 positionDirection, out float lightCenterDistance) {
        lightCenterDistance = distance(light.center, position);
        return intensityInDirection(light.direction, positionDirection) * light.value / pow(
            lightCenterDistance / light.lightDrop + 1.0, 2.0
        );
    }

    vec3 colorInPositionInside(Flashlight light, vec2 positionDirection) {
        float lightCenterDistance = distance(light.center, position);
        return intensityInDirection(light.direction, positionDirection) * light.value / pow(
            lightCenterDistance / (light.lightDrop * LIGHT_DROP_INSIDE_RATIO) + 1.0, 2.0
        );
    }
#endif

out vec4 fragmentColor;
void main() {
    vec3 lighting = AMBIENT_LIGHT;
    
    vec3 colorAtPosition;
    float startingDistance = getDistance(uvCoordinates, colorAtPosition);
    
    if (startingDistance < 0.0) {
        #if CIRCLE_LIGHT_COUNT > 0
        for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
            lighting += colorInPositionInside(circleLights[i]);
        }
        #endif

        #if FLASHLIGHT_COUNT > 0
        for (int i = 0; i < FLASHLIGHT_COUNT; i++) {
            lighting += colorInPositionInside(flashlights[i], normalize(flashlightDirections[i]));
        }
        #endif
    } else {
        colorAtPosition = vec3(1.0);

        #if CIRCLE_LIGHT_COUNT > 0
        for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
            vec2 direction = normalize(circleLightDirections[i]) / squareToAspectRatioTimes2;

            float lightCenterDistance;
            vec3 lightColorAtPosition = colorInPosition(circleLights[i], lightCenterDistance);

            lighting += lightColorAtPosition * shadowTransparency(startingDistance, lightCenterDistance, direction);
        }
        #endif

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
    }
    
    fragmentColor = vec4(colorAtPosition * lighting, 1.0);
}
