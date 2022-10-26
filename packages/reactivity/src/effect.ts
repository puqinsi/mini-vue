import { extend } from "@mini-vue/shared";

let activeEffect: any;
let shouldTrack: boolean;
export class ReactiveEffect {
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

// page 50: 分支切换与 cleanup TODO
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

  // Map(target) => Map(key) => Set(dep)
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

// 执行收集依赖的方法，收集到 set 中，此方法 reactive 和 ref 都会使用
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
  if (depsMap) {
    const dep = depsMap.get(key);
    triggerEffects(dep);
  }
}

// 执行触发依赖的方法，遍历执行 set 中的副作用，此方法 reactive 和 ref 都会使用
export function triggerEffects(dep: any) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      // 如果依赖收集中（表示副作用函数正在执行），如果执行中又要触发相同的副作用函数，会导致无限递归循环
      // TODO 可能不需要此功能，与 stop 一起使用？
      if (shouldTrack && effect.run === activeEffect.run) return;
      effect.run();
    }
  }
}

// scheduler 为调度器，控制副作用函数的执行时机
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
