import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    name: "Foo",
    setup(props) {
        console.log(props);
    },
    render() {
        const foo = h("div", {}, "foo");
        // 具名插槽
        return h("div", {}, [
            renderSlots(this.$slots, "header", { age: 18 }),
            foo,
            renderSlots(this.$slots, "footer"),
        ]);
    },
};
