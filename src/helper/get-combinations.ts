export const getCombinations = (values: Array<Array<number>>): Array<Array<number>> => {
  if (!values.every((a) => a.length > 0)) {
    return [];
  }

  const result: Array<Array<number>> = [];
  const counters = values.map((_) => 0);

  const increaseCounter = (i: number) => {
    if (i >= counters.length) {
      return false;
    }

    counters[i]++;

    if (counters[i] >= values[i].length) {
      counters[i] = 0;
      return increaseCounter(i + 1);
    }

    return true;
  };

  do {
    result.push(values.map((v, i) => v[counters[i]]));
  } while (increaseCounter(0));

  return result;
};
