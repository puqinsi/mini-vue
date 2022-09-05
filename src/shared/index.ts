export const extend = Object.assign;

export const isObject = (obj: any): boolean => {
    return obj !== null && typeof obj === "object";
};

export const hasChanged = (value: any, newValue: any) => {
    return !Object.is(value, newValue);
};

export const hasOwn = (val: any, key: string) =>
    Object.prototype.hasOwnProperty.call(val, key);

export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
        return c ? c.toUpperCase() : "";
    });
};

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
    return str ? "on" + capitalize(str) : "";
};
