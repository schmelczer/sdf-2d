export class Insights {
  private static insights: any = {};

  public static setValue(key: string | Array<string>, value: any): void {
    if (Array.isArray(key)) {
      key.reduce((previousValue, currentKey, i, a) => {
        if (!Object.prototype.hasOwnProperty.call(previousValue, currentKey)) {
          previousValue[currentKey] = i == a.length - 1 ? value : {};
        }

        return previousValue[currentKey];
      }, Insights.insights);
    } else {
      Insights.insights[key] = value;
    }
  }

  public static measure(name: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const targetFunction = descriptor.value;

      descriptor.value = function (...values: Array<any>) {
        const start = performance.now();

        const result = targetFunction.bind(this)(...values);

        const end = performance.now();
        Insights.setValue(['measurements', name], `${(end - start).toFixed(3)} ms`);

        return result;
      };

      return descriptor;
    };
  }

  public static get values(): any {
    return Insights.insights;
  }
}
