import { h, ref } from "../../lib/guide-mini-vue.esm.js";

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
        const prevChildren = h("div", {}, [
            h("div", { key: "A" }, "A"),
            h("div", { key: "B" }, "B"),
            h("div", { key: "C" }, "C"),
        ]);

        const nextChildren = h("div", {}, [
            h("div", { key: "A" }, "A"),
            h("div", { key: "B" }, "B"),
            h("div", { key: "D" }, "D"),
            h("div", { key: "E" }, "E"),
        ]);

        /* 2. 右侧对比 */
        //   c (b a)
        // e d (b a)
        // const prevChildren = h("div", {}, [
        //     h("div", { key: "C" }, "C"),
        //     h("div", { key: "B" }, "B"),
        //     h("div", { key: "A" }, "A"),
        // ]);
        // const nextChildren = h("div", {}, [
        //     h("div", { key: "E" }, "E"),
        //     h("div", { key: "D" }, "D"),
        //     h("div", { key: "B" }, "B"),
        //     h("div", { key: "A" }, "A"),
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

        return this.flag ? nextChildren : prevChildren;
    },
};
