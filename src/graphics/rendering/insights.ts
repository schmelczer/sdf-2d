export class Insights {
  private static insights: any = {};

  public static setValue(key: string | Array<string>, value: any): void {
    if (Array.isArray(key)) {
      key.reduce((previousValue, currentKey) => {
        if (!Object.prototype.hasOwnProperty.call(previousValue, currentKey)) {
          previousValue[currentKey] = {};
        }

        return previousValue[currentKey];
      }, Insights.insights);
    } else {
      Insights.insights[key] = value;
    }
  }

  public static get values(): any {
    return Insights.insights;
  }
}
