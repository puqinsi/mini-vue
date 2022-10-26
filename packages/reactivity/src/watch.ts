import { isObject } from "@mini-vue/shared";
import { effect } from "./effect";

/* 功能不完善 */
export function watch(source: any, cb: any, options?: any) {
  let getter;
  if (typeof source === "function") {
    // 传入的是一个函数，不是深层监听
    getter = source;
  } else {
    // 传入一个响应式数据，默认深层监听
    getter = () => traverse(source);
  }

  let newValue, oldValue: any;

  const schedulerFn = () => {
    newValue = runner();
    cb(newValue, oldValue);
    oldValue = newValue;
  };

  const runner = effect(getter, {
    scheduler: schedulerFn,
  });

  if (options && options.immediate) {
    schedulerFn();
  } else {
    oldValue = runner();
  }
}

function traverse(value: any, seen = new Set()) {
  if (!isObject(value) || seen.has(value)) return;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }

  return value;
}
