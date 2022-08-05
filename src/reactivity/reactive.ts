import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export function reactive(obj: any): any {
    return createActiveObj(obj, mutableHandlers);
}

export function readonly(obj: any): any {
    return createActiveObj(obj, readonlyHandlers);
}

function createActiveObj(obj: any, baseHandlers: any) {
    return new Proxy(obj, baseHandlers);
}
