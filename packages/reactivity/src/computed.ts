import { ReactiveEffect } from "./effect";

// 主要两点:
// 1.通过 _value (保存数据) 和 _dirty (控制执行),实现缓存功能
// 2.通过 effect scheduler 功能,实现依赖触发 trigger 修改 _dirty, 控制缓存开关
// 类似 effect, effect 是 开始就执行 getter; computed 是获取 value 时,才执行 getter,并且有缓存机制.
class ComputedRefImpl {
  private _dirty: any = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(getter: any) {
    // 利用 effect scheduler 功能,巧妙实现依赖改变的时候,控制缓存的开关打开,获取 value 的时候在重新触发 getter 计算结果
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    // 获取 value 后,把数据缓存,并通过开关控制
    // 再获取 value 时，返回缓存数据
    // 如果依赖触发后, trigger 修改 _dirty (scheduler),不执行 getter (run)
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter: any) {
  return new ComputedRefImpl(getter);
}
