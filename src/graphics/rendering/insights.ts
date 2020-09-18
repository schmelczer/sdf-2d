import { last } from '../../helper/last';
import { msToString } from '../../helper/ms-to-string';

export class Insights {
  private static insights: any = {};

  public static setValue(key: string | Array<string>, value: any): void {
    if (Array.isArray(key)) {
      if (key.length == 0) {
        throw new Error('Key length must be greater than 0');
      }

      const lastObject = key.slice(0, -1).reduce((previousValue, currentKey) => {
        if (!Object.prototype.hasOwnProperty.call(previousValue, currentKey)) {
          previousValue[currentKey] = {};
        }

        return previousValue[currentKey];
      }, Insights.insights);

      lastObject[last(key)!] = value;
    } else {
      Insights.insights[key] = value;
    }
  }

  public static measure(key: string | Array<string>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const targetFunction = descriptor.value;

      descriptor.value = function (...values: Array<any>) {
        return Insights.measureFunction(key, () => targetFunction(...values));
      };
      return descriptor;
    };
  }

  public static measureFunction(
    key: string | Array<string>,
    targetFunction: () => any
  ): any {
    const start = performance.now();
    const result = targetFunction();
    const end = performance.now();

    const newKey = Array.isArray(key) ? ['measurements', ...key] : ['measurements', key];
    Insights.setValue(newKey, msToString(end - start));

    return result;
  }

  public static get values(): any {
    return Insights.insights;
  }
}
