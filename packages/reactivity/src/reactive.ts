import { isObject } from "@mini-vue/shared";
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "_v_isReactive",
  IS_READONLY = "_v_isReadonly",
}

export function reactive(target: any): any {
  return createActiveObj(target, mutableHandlers);
}

export function readonly(target: any): any {
  return createActiveObj(target, readonlyHandlers);
}

export function shallowReactive(target: any): any {
  return createActiveObj(target, shallowReactiveHandlers);
}
export function shallowReadonly(target: any): any {
  return createActiveObj(target, shallowReadonlyHandlers);
}

export function isReactive(value: any): boolean {
  // 触发 get
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value: any): boolean {
  // 触发 get
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value: any): boolean {
  return isReactive(value) || isReadonly(value);
}

function createActiveObj(target: any, baseHandlers: any) {
  if (!isObject(target)) {
    console.warn(`target ${target} 不是一个对象`);
    return;
  }

  return new Proxy(target, baseHandlers);
}
