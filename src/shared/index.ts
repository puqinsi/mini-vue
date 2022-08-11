export const extend = Object.assign;

export const isObject = (obj: any): boolean => {
    return obj !== null && typeof obj === "object";
};

export const hasChanged = (value: any, newValue: any) => {
    return !Object.is(value, newValue);
};
