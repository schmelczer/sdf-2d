declare global {
    interface Array<T> {
        x: number;
        y: number;
    }
    interface Float32Array {
        x: number;
        y: number;
    }
}
export declare const applyArrayPlugins: () => void;
