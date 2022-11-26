import { effect, ReactiveEffect } from '@mini-vue/reactivity';
import { isObject } from '@mini-vue/shared';
import { queuePreFlushCbs } from './scheduler';

export function watchEffect(source: any) {
    function job() {
        effect.run();
    }

    let cleanup: any;
    function onCleanup(fn: any) {
        cleanup = effect.onStop = () => {
            fn();
        };
    }
    function getter() {
        if (cleanup) {
            cleanup();
        }
        source(onCleanup);
    }

    const effect = new ReactiveEffect(getter, () => {
        queuePreFlushCbs(job);
    });

    effect.run();

    return () => {
        effect.stop();
    };
}

/* TODO 功能不完善，未结合 runtime */
export function watch(source: any, cb: any, options?: any) {
    let getter;
    if (typeof source === 'function') {
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
