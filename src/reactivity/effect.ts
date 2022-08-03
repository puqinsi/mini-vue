class ReactiveEffect {
    private _fn: any;
    constructor(fn: any) {
        this._fn = fn;
    }
    run() {
        activeEffect = this;
        return this._fn();
    }
}

// 收集依赖
const targetMap = new Map();
export function track(target: any, key: any) {
    // target => key => dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }

    dep.add(activeEffect);
}

// 触发依赖
export function trigger(target: any, key: any) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    for (const effect of dep) {
        effect.run();
    }
}

let activeEffect: any;
export function effect(fn: any) {
    const _effect = new ReactiveEffect(fn);
    _effect.run();

    return _effect.run.bind(_effect);
}
