export const extend = Object.assign;

export const isObject = (obj: any): boolean => {
    return obj !== null && typeof obj === "object";
};

export const hasChanged = (value: any, newValue: any) => {
    return !Object.is(value, newValue);
};

export const hasOwn = (val: any, key: string) =>
    Object.prototype.hasOwnProperty.call(val, key);
