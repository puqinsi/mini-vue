import { createVNode, Fragment } from "../src/vnode";

export function renderSlots(slots: any, name: string, props: any) {
  const slot = slots[name];
  if (slot) {
    // function
    if (typeof slot === "function") {
      return createVNode(Fragment, {}, slot(props));
    }
  }
}
