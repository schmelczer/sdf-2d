#version 100

#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

#define INTENSITY_INSIDE_RATIO {intensityInsideRatio}
#define SHADOW_TRACE_COUNT {shadowTraceCount}
// 0.0 == lights add (overlaps brighten & merge); 1.0 == lights take the
// per-channel max (overlaps never exceed the brighter light). See main().
#define LIGHT_OVERLAP_REDUCTION float({lightOverlapReduction})

{macroDefinitions}

uniform float shadingNdcPixelSize;
uniform float ditherStrength;
uniform float ditherSeed;
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

float ditherNoise() {
    float ign = fract(52.9829189 * fract(
        dot(gl_FragCoord.xy + ditherSeed, vec2(0.06711056, 0.00583715))
    ));
    float t = 2.0 * ign - 1.0;
    return sign(t) * (1.0 - sqrt(1.0 - abs(t)));
}

void main() {
    vec4 rgbaColorAtPosition;
    float startingDistance = getDistance(uvCoordinates, rgbaColorAtPosition);

    vec3 colorAtPosition = rgbaColorAtPosition.rgb;

    // Each light contributes to two accumulators: an additive sum (overlaps
    // brighten and glows bridge into one another) and a per-channel max
    // (overlaps read as just the brightest light). LIGHT_OVERLAP_REDUCTION
    // blends between them. Ambient stays a separate additive base, so a single
    // light is identical to pure-additive (sum == max for one light).
    vec3 lightSum = vec3(0.0);
    vec3 lightMax = vec3(0.0);
    vec3 lightSumInside = vec3(0.0);
    vec3 lightMaxInside = vec3(0.0);

    #ifdef CIRCLE_LIGHT_COUNT
    #if CIRCLE_LIGHT_COUNT > 0
    for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
        float lightCenterDistance = distance(circleLightCenters[i], position);

        vec3 lightColorAtPosition = circleLightColors[i] / pow(
            lightCenterDistance / circleLightIntensities[i] + 1.0, 2.0
        );

        vec2 direction = normalize(circleLightCenters[i] - position) / squareToAspectRatioTimes2;
        vec3 shadowed = lightColorAtPosition * shadowTransparency(
            startingDistance,
            lightCenterDistance,
            direction
        );

        lightSum += shadowed;
        lightMax = max(lightMax, shadowed);
        lightSumInside += lightColorAtPosition;
        lightMaxInside = max(lightMaxInside, lightColorAtPosition);
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

        vec3 shadowed = lightColorAtPosition * shadowTransparency(
            startingDistance,
            lightCenterDistance,
            direction
        );

        lightSum += shadowed;
        lightMax = max(lightMax, shadowed);
        lightSumInside += lightColorAtPosition;
        lightMaxInside = max(lightMaxInside, lightColorAtPosition);
    }
    #endif
    #endif

    vec3 lighting = ambientLight + mix(lightSum, lightMax, LIGHT_OVERLAP_REDUCTION);
    vec3 lightingInside =
        ambientLight + mix(lightSumInside, lightMaxInside, LIGHT_OVERLAP_REDUCTION);

    vec3 outsideColor = {backgroundColor}.rgb * lighting;
    vec3 insideColor = colorAtPosition * lightingInside * INTENSITY_INSIDE_RATIO;

    float edge = clamp(startingDistance / shadingNdcPixelSize, 0.0, 1.0);
    vec3 antialiasedColor = mix(insideColor, outsideColor, edge);
    gl_FragColor = vec4(
        antialiasedColor + ditherNoise() * ditherStrength / 255.0,
        rgbaColorAtPosition.a
    );
}
