import { track, trigger } from "./effect";
export function reactive(obj: any): any {
    return new Proxy(obj, {
        set(target, key, value) {
            const res = Reflect.set(target, key, value);

            // 触发依赖
            trigger(target, key);
            return res;
        },
        get(target, key) {
            const res = Reflect.get(target, key);

            // 收集依赖
            track(target, key);
            return res;
        },
    });
}
