import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    name: "Foo",
    setup(props) {
        // 1. setup 可以传入 props
        console.log(props);

        // 3. props shallowReadonly
        props.count++;
    },
    render() {
        // 2. render 可以获取
        return h("div", {}, `foo: ${this.count}`);
    },
};
