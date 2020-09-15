#version 300 es

precision lowp float;

#define CIRCLE_LIGHT_COUNT {circleLightCount}
#define FLASHLIGHT_COUNT {flashlightCount}

uniform mat3 modelTransform;
in vec4 vertexPosition;

out vec2 position;
out vec2 uvCoordinates;

uniform vec2 squareToAspectRatio;

#if CIRCLE_LIGHT_COUNT > 0
    uniform struct CircleLight {
        vec2 center;
        float lightDrop;
        vec3 value;
    }[CIRCLE_LIGHT_COUNT] circleLights;

    out vec2[CIRCLE_LIGHT_COUNT] circleLightDirections;
#endif

#if FLASHLIGHT_COUNT > 0
    uniform struct Flashlight {
        vec2 center;
        vec2 direction;
        float lightDrop;
        vec3 value;
    }[FLASHLIGHT_COUNT] flashlights;

    out vec2[FLASHLIGHT_COUNT] flashlightDirections;
#endif

void main() {
    vec3 vertexPosition2D = vec3(vertexPosition.xy, 1.0) * modelTransform;
    gl_Position = vec4(vertexPosition2D.xy, 0.0, 1.0);
    position = vertexPosition2D.xy * squareToAspectRatio;

    uvCoordinates = (vertexPosition2D * mat3(
        0.5, 0.0, 0.5,
        0.0, 0.5, 0.5,
        0.0, 0.0, 1.0
    )).xy;

    #if CIRCLE_LIGHT_COUNT > 0
        for (int i = 0; i < CIRCLE_LIGHT_COUNT; i++) {
            circleLightDirections[i] = circleLights[i].center - position;
        }
    #endif

    #if FLASHLIGHT_COUNT > 0
        for (int i = 0; i < FLASHLIGHT_COUNT; i++) {
            flashlightDirections[i] = flashlights[i].center - position;
        }
    #endif
}
