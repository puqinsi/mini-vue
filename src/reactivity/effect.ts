import { extend } from "../shared";

class ReactiveEffect {
    private _fn: any;
    public scheduler: any;
    public deps: any[] = [];
    active = true;
    onStop?: () => void;
    constructor(fn: any, scheduler?: any) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        activeEffect = this;
        return this._fn();
    }
    stop() {
        if (!this.active) return;
        cleanupEffect(this);
        this.active = false;
        if (this.onStop) this.onStop();
    }
}

function cleanupEffect(effect: any) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    });
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

    if (!activeEffect) return;
    dep.add(activeEffect);
    // 每个 activeEffect 存储所有被存储的的dep，为了 stop 时找到 activeEffect 所有对应的 dep，并从中删除，再触发依赖时不会执行
    activeEffect.deps.push(dep);
}

// 触发依赖
export function trigger(target: any, key: any) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

let activeEffect: any;
export function effect(fn: any, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);

    _effect.run();
    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

export function stop(runner: any) {
    const _effect = runner.effect;
    _effect.stop();
}
