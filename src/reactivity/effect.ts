import { extend } from "../shared";

let activeEffect: any;
let shouldTrack: boolean;
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
        shouldTrack = false;
        // 已 stop
        if (!this.active) {
            return this._fn();
        }

        // 应收集
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        // 重置全局变量
        shouldTrack = false;

        return res;
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

    effect.deps.length = 0;
}

// 收集依赖
const targetMap = new Map();
export function track(target: any, key: any) {
    if (!isTracking()) return;

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

    trackEffects(dep);
}

export function trackEffects(dep: any) {
    if (dep.has(activeEffect)) return;
    dep.add(activeEffect);
    // 每个 activeEffect 存储所有被存储的的dep，为了 stop 时找到 activeEffect 所有对应的 dep，并从中删除，再触发依赖时不会执行
    activeEffect.deps.push(dep);
}
export function isTracking() {
    return activeEffect !== undefined && shouldTrack;
}

// 触发依赖
export function trigger(target: any, key: any) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}

export function triggerEffects(dep: any) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

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
