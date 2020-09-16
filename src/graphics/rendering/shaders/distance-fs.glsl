#version 300 es

precision lowp float;

#define SURFACE_OFFSET 0.001
 
uniform float maxMinDistance;
uniform float distanceNdcPixelSize;
in vec2 position;

{macroDefinitions}

{declarations}

/*
#endif
#if BLOB_COUNT > 0
    uniform struct {
        vec2 headCenter;
        vec2 leftFootCenter;
        vec2 rightFootCenter;
        float headRadius;
        float footRadius;
        float k;
    }[BLOB_COUNT] blobs;

    float smoothMin(float a, float b)
    {
        const float k = 2.0;
        
        a = pow(a, k);
        b = pow(b, k);
        return pow((a * b) / (a + b), 1.0 / k);
    }

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
    float minDistance = maxMinDistance;
    float color = 1.0;

    {functionCalls}

    // minDistance / 2.0: NDC to UV scale
    fragmentColor = vec2(minDistance / 2.0, color);
}
