export const settings = {
  enableHighDpiRendering: true,
  qualityScaling: {
    targetDeltaTimeInMilliseconds: 20,
    deltaTimeError: 2,
    deltaTimeResponsiveness: 1 / 16,
    adjusmentRateInMilliseconds: 300,
    qualityTargets: [
      {
        distanceRenderScale: 0.1,
        finalRenderScale: 0.2,
        softShadowsEnabled: false,
      },
      {
        distanceRenderScale: 0.1,
        finalRenderScale: 0.6,
        softShadowsEnabled: false,
      },
      {
        distanceRenderScale: 0.3,
        finalRenderScale: 1.0,
        softShadowsEnabled: false,
      },
      {
        distanceRenderScale: 0.3,
        finalRenderScale: 1.0,
        softShadowsEnabled: true,
      },
      /*{
        distanceRenderScale: 1.0,
        finalRenderScale: 1.5,
        softShadowsEnabled: true,
      },
      {
        distanceRenderScale: 1.25,
        finalRenderScale: 1.75,
        softShadowsEnabled: true,
      },
      {
        distanceRenderScale: 2,
        finalRenderScale: 2,
        softShadowsEnabled: true,
      },*/
    ],
    startingTargetIndex: 2,
    scalingOptions: {
      additiveIncrease: 0.2,
      multiplicativeDecrease: 1.05,
    },
  },
  tileMultiplier: 8,
  shaderMacros: {},
  shaderCombinations: {
    lineSteps: [0, 1, 2, 4, 8, 16, 128],
    blobSteps: [0, 1, 2, 8],
    circleLightSteps: [0, 1],
    flashlightSteps: [0, 1],
  },
};
