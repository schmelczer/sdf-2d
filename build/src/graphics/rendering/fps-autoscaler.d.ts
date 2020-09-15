import { Autoscaler as AutoScaler } from '../../helper/autoscaler';
export declare class FpsAutoscaler extends AutoScaler {
    private timeSinceLastAdjusment;
    private exponentialDecayedDeltaTime;
    constructor(setters: {
        [key: string]: (value: number | boolean) => void;
    });
    autoscale(lastDeltaTime: DOMHighResTimeStamp): void;
}
