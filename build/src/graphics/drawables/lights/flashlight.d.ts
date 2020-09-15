import { mat2d, vec2, vec3 } from 'gl-matrix';
import { IDrawableDescriptor } from '../i-drawable-descriptor';
import { ILight } from './i-light';
export declare class Flashlight implements ILight {
    center: vec2;
    direction: vec2;
    lightDrop: number;
    color: vec3;
    lightness: number;
    static descriptor: IDrawableDescriptor;
    constructor(center: vec2, direction: vec2, lightDrop: number, color: vec3, lightness: number);
    distance(_: vec2): number;
    serializeToUniforms(uniforms: any, scale: number, transform: mat2d): void;
    get value(): vec3;
}
