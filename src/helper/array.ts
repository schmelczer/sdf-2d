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

const setIndexAlias = (name: string, index: number, type: any) => {
  if (!Object.prototype.hasOwnProperty.call(type.prototype, name)) {
    Object.defineProperty(type.prototype, name, {
      get() {
        return this[index];
      },
      set(value) {
        this[index] = value;
      },
    });
  }
};

export const applyArrayPlugins = () => {
  setIndexAlias('x', 0, Array);
  setIndexAlias('y', 1, Array);
  setIndexAlias('x', 0, Float32Array);
  setIndexAlias('y', 1, Float32Array);
};
