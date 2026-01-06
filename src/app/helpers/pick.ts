const pick = <
  T extends Record<string, unknown>,
  K extends readonly (keyof T)[]
>(
  obj: T,
  keys: K
): Pick<T, K[number]> => {
  const finalObject = {} as Pick<T, K[number]>;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObject[key] = obj[key];
    }
  }

  return finalObject;
};

export default pick;
