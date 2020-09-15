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

export const applyArrayPlugins = () => {
  Object.defineProperty(Array.prototype, 'x', {
    get() {
      return this[0];
    },
    set(value) {
      this[0] = value;
    },
  });

  Object.defineProperty(Array.prototype, 'y', {
    get() {
      return this[1];
    },
    set(value) {
      this[1] = value;
    },
  });

  Object.defineProperty(Float32Array.prototype, 'x', {
    get() {
      return this[0];
    },
    set(value) {
      this[0] = value;
    },
  });

  Object.defineProperty(Float32Array.prototype, 'y', {
    get() {
      return this[1];
    },
    set(value) {
      this[1] = value;
    },
  });
};
