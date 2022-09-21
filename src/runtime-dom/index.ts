import { createRenderer } from "../runtime-core/renderer";

function createElement(type: any) {
    // 创建元素 el -> element
    return document.createElement(type);
}

function patchProp(el: any, key: any, value: any) {
    // 通用处理
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        // 事件
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
    } else {
        // 属性
        if (value !== undefined && value !== null) {
            el.setAttribute(key, value);
        } else {
            el.removeAttribute(key, value);
        }
    }
}

function insert(child: any, container: any, anchor: any) {
    // 添加到 container
    container.insertBefore(child, anchor);
}

function remove(child: any) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}

function setElementText(el: any, text: any) {
    el.textContent = text;
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});

// export const createApp = renderer.createApp;
export function createApp(...args: any[]) {
    return renderer.createApp(...args);
}

export * from "../runtime-core";
