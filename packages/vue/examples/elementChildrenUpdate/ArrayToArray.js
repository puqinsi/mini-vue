import { h, ref } from "../../dist/guide-mini-vue.esm.js";

export default {
  name: "App",
  setup() {
    const flag = ref(false);
    window.change = flag;

    return {
      flag,
    };
  },
  render() {
    /* 1. 左侧对比 */
    // (a b) c
    // (a b) d e
    // const prevChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "C" }, "C"),
    // ]);

    // const nextChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "D" }, "D"),
    //     h("div", { key: "E" }, "E"),
    // ]);

    /* 2. 右侧对比 */
    //   c (b a)
    // e d (b a)
    // const prevChildren = h("div", {}, [
    //   h("div", { key: "C" }, "C"),
    //   h("div", { key: "B" }, "B"),
    //   h("div", { key: "A" }, "A"),
    // ]);
    // const nextChildren = h("div", {}, [
    //   h("div", { key: "E" }, "E"),
    //   h("div", { key: "D" }, "D"),
    //   h("div", { key: "B" }, "B"),
    //   h("div", { key: "A" }, "A"),
    // ]);

    /* 3. 新的比老的长 */
    // 左侧不变
    // (a b)
    // (a b) c d
    // const prevChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    // ]);
    // const nextChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "C" }, "C"),
    //     h("div", { key: "D" }, "D"),
    // ]);

    // 右侧不变
    //     (c d)
    // a b (c d)
    // const prevChildren = h("div", {}, [
    //     h("div", { key: "C" }, "C"),
    //     h("div", { key: "D" }, "D"),
    // ]);
    // const nextChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "C" }, "C"),
    //     h("div", { key: "D" }, "D"),
    // ]);

    /* 4. 老的比新的长 */
    // 左侧不变
    // (a b) c d
    // (a b)
    // const prevChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "C" }, "C"),
    //     h("div", { key: "D" }, "D"),
    // ]);
    // const nextChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    // ]);

    // 右侧不变
    // c d (b a)
    //     (b a)
    // const prevChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "C" }, "C"),
    //     h("div", { key: "D" }, "D"),
    // ]);
    // const nextChildren = h("div", {}, [
    //     h("div", { key: "C" }, "C"),
    //     h("div", { key: "D" }, "D"),
    // ]);

    /* 5. 中间 */
    // (a b) c e f (g h)
    // (a b) d c (g h)
    // 创建新节点
    // 删除老节点
    // 移动老节点
    // const prevChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "C", id: "prev" }, "C"),
    //     h("div", { key: "E" }, "E"),
    //     h("div", { key: "F" }, "F"),
    //     h("div", { key: "G" }, "G"),
    //     h("div", { key: "H" }, "H"),
    // ]);

    // const nextChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "D" }, "D"),
    //     h("div", { key: "C", id: "next" }, "C"),
    //     h("div", { key: "G" }, "G"),
    //     h("div", { key: "H" }, "H"),
    // ]);

    /* 5.1 删除优化 */
    // (a b) c d e (g h)
    // (a b) c d (g h)
    // prevChildren 超出 nextChildren 变动部分的 child 直接删除
    // const prevChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "C", id: "prev" }, "C"),
    //     h("div", { key: "D" }, "D"),
    //     h("div", { key: "E" }, "E"),
    //     h("div", { key: "G" }, "G"),
    //     h("div", { key: "H" }, "H"),
    // ]);

    // const nextChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "D" }, "D"),
    //     h("div", { key: "C", id: "next" }, "C"),
    //     h("div", { key: "G" }, "G"),
    //     h("div", { key: "H" }, "H"),
    // ]);

    /* 5.2 移动老节点 */
    // 移动
    // (a b) c d e (g h)
    // (a b) e c d (g h)
    // const prevChildren = h("div", {}, [
    //   h("div", { key: "A" }, "A"),
    //   h("div", { key: "B" }, "B"),
    //   h("div", { key: "C", id: "prev" }, "C"),
    //   h("div", { key: "D" }, "D"),
    //   h("div", { key: "E" }, "E"),
    //   h("div", { key: "G" }, "G"),
    //   h("div", { key: "H" }, "H"),
    // ]);

    // const nextChildren = h("div", {}, [
    //   h("div", { key: "A" }, "A"),
    //   h("div", { key: "B" }, "B"),
    //   h("div", { key: "E" }, "E"),
    //   h("div", { key: "C", id: "next" }, "C"),
    //   h("div", { key: "D" }, "D"),
    //   h("div", { key: "G" }, "G"),
    //   h("div", { key: "H" }, "H"),
    // ]);

    /* 综合 */
    // 移动+创建
    // (a b) c d e (g h)
    // (a b) e c f d (g h)
    // const prevChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "C", id: "prev" }, "C"),
    //     h("div", { key: "D" }, "D"),
    //     h("div", { key: "E" }, "E"),
    //     h("div", { key: "G" }, "G"),
    //     h("div", { key: "H" }, "H"),
    // ]);

    // const nextChildren = h("div", {}, [
    //     h("div", { key: "A" }, "A"),
    //     h("div", { key: "B" }, "B"),
    //     h("div", { key: "E" }, "E"),
    //     h("div", { key: "C", id: "next" }, "C"),
    //     h("div", { key: "F" }, "F"),
    //     h("div", { key: "D" }, "D"),
    //     h("div", { key: "G" }, "G"),
    //     h("div", { key: "H" }, "H"),
    // ]);

    // 移动+创建+删除
    // (a b) c d e f (g h)
    // (a b) e c k d (g h)
    const prevChildren = h("div", {}, [
      h("div", { key: "A" }, "A"),
      h("div", { key: "B" }, "B"),
      h("div", { key: "C", id: "prev" }, "C"),
      h("div", { key: "D" }, "D"),
      h("div", { key: "E" }, "E"),
      h("div", { key: "F" }, "F"),
      h("div", { key: "G" }, "G"),
      h("div", { key: "H" }, "H"),
    ]);

    const nextChildren = h("div", {}, [
      h("div", { key: "A" }, "A"),
      h("div", { key: "B" }, "B"),
      h("div", { key: "E" }, "E"),
      h("div", { key: "C", id: "next" }, "C"),
      h("div", { key: "K" }, "K"),
      h("div", { key: "D" }, "D"),
      h("div", { key: "G" }, "G"),
      h("div", { key: "H" }, "H"),
    ]);

    return this.flag ? nextChildren : prevChildren;
  },
};
