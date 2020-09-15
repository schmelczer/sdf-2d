#version 300 es

precision lowp float;

// #define LINE_COUNT {lineCount}
// #define BLOB_COUNT {blobCount}
#define CIRCLE_COUNT {circleCount}

#define SURFACE_OFFSET 0.001
 
uniform float maxMinDistance;
uniform float distanceNdcPixelSize;

in vec2 position;

float smoothMin(float a, float b)
{
    const float k = 2.0;
    
    a = pow(a, k);
    b = pow(b, k);
    return pow((a * b) / (a + b), 1.0 / k);
}
/*
#if LINE_COUNT > 0
    uniform struct {
        vec2 from;
        vec2 toFromDelta;
        float fromRadius;
        float toRadius;
    }[LINE_COUNT] lines;

    void lineMinDistance(inout float minDistance, inout float color) {
        float myMinDistance = maxMinDistance;
        for (int i = 0; i < LINE_COUNT; i++) {
            vec2 targetFromDelta = position - lines[i].from;
            vec2 toFromDelta = lines[i].toFromDelta;
            
            float h = clamp(
                dot(targetFromDelta, toFromDelta) / dot(toFromDelta, toFromDelta),
                0.0, 1.0
            );

            float lineDistance = -mix(
                lines[i].fromRadius, lines[i].toRadius, h
            ) + distance(
                targetFromDelta, toFromDelta * h
            );

            myMinDistance = min(myMinDistance, lineDistance);
        }

        color = mix(0.0, color, step(distanceNdcPixelSize + SURFACE_OFFSET, -myMinDistance));
        minDistance = -myMinDistance;
    }
#endif
*/
#if CIRCLE_COUNT > 0
    uniform struct {
        vec2 center;
        float radius;
    }[CIRCLE_COUNT] circles;

    void circleMinDistance(inout float minDistance, inout float color) {
        for (int i = 0; i < CIRCLE_COUNT; i++) {
            float dist = distance(circles[i].center, position) - circles[i].radius;
            minDistance = min(minDistance, dist);
        }
    }
#endif

/*
#if BLOB_COUNT > 0
    uniform struct {
        vec2 headCenter;
        vec2 leftFootCenter;
        vec2 rightFootCenter;
        float headRadius;
        float footRadius;
        float k;
    }[BLOB_COUNT] blobs;

    float circleMinDistance(vec2 circleCenter, float radius) {
        return distance(position, circleCenter) - radius;
    }

    void blobMinDistance(inout float minDistance, inout float color) {
        for (int i = 0; i < BLOB_COUNT; i++) {
            float headDistance = circleMinDistance(blobs[i].headCenter, blobs[i].headRadius);
            float leftFootDistance = circleMinDistance(blobs[i].leftFootCenter, blobs[i].footRadius);
            float rightFootDistance = circleMinDistance(blobs[i].rightFootCenter, blobs[i].footRadius);

            float res = min(
                smoothMin(headDistance, leftFootDistance),
                smoothMin(headDistance, rightFootDistance)
            );

            res = min(100.0, headDistance);
            res = min(res, leftFootDistance);
            res = min(res, rightFootDistance);
            //color = mix(2.0, color, step(distanceUvPixelSize + SURFACE_OFFSET, res));
            minDistance = min(minDistance, res);
            color = mix(2.0, color, step(distanceNdcPixelSize + SURFACE_OFFSET, res));
        }
    }
#endif
*/

out vec2 fragmentColor;

void main() {
    float minDistance = 10.0; //-maxMinDistance;
    float color = 1.0;

    /*#if LINE_COUNT > 0
        lineMinDistance(minDistance, color);
    #endif

    #if BLOB_COUNT > 0
        blobMinDistance(minDistance, color);
    #endif*/

    #if CIRCLE_COUNT > 0
        circleMinDistance(minDistance, color);
    #endif

    // minDistance / 2.0: NDC to UV scale
    fragmentColor = vec2(minDistance / 2.0, color);
}
