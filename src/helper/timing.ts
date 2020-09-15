export function timeIt(interval = 60) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let i = 0;
    let previousTimes: Array<DOMHighResTimeStamp> = [];

    const targetFunction = descriptor.value;

    descriptor.value = function (...values) {
      const start = performance.now();
      targetFunction.bind(this)(...values);
      const end = performance.now();

      previousTimes.push(end - start);

      if (i++ % interval == 0) {
        previousTimes = previousTimes.sort();

        /*const text = `Max: ${last(previousTimes).toFixed(
          2
        )} ms\n\tMedian: ${previousTimes[Math.floor(previousTimes.length / 2)].toFixed(
          2
        )} ms`;*/

        //InfoText.modifyRecord(propertyKey, text);

        previousTimes = [];
      }
    };

    return descriptor;
  };
}
