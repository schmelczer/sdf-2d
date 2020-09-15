export declare class Autoscaler {
    private setters;
    private targets;
    private scalingOptions;
    private index;
    constructor(setters: {
        [key: string]: (value: number | boolean) => void;
    }, targets: Array<{
        [key: string]: number | boolean;
    }>, startingIndex: number, scalingOptions: {
        additiveIncrease: number;
        multiplicativeDecrease: number;
    });
    increase(): void;
    decrease(): void;
    private applyScaling;
}
