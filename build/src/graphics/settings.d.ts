export declare const settings: {
    enableHighDpiRendering: boolean;
    qualityScaling: {
        targetDeltaTimeInMilliseconds: number;
        deltaTimeError: number;
        deltaTimeResponsiveness: number;
        adjusmentRateInMilliseconds: number;
        qualityTargets: {
            distanceRenderScale: number;
            finalRenderScale: number;
            softShadowsEnabled: boolean;
        }[];
        startingTargetIndex: number;
        scalingOptions: {
            additiveIncrease: number;
            multiplicativeDecrease: number;
        };
    };
    tileMultiplier: number;
    shaderMacros: {};
    shaderCombinations: {
        lineSteps: number[];
        blobSteps: number[];
        circleLightSteps: number[];
        flashlightSteps: number[];
    };
};
