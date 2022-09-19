import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export default {
    name: "App",
    setup() {
        const flag = ref(false);
        window.self = flag;

        return {
            flag,
        };
    },
    render() {
        const oldArray = h("div", {}, [h("div", {}, "A"), h("div", {}, "B")]);
        const newArray = h("div", {}, [h("div", {}, "C"), h("div", {}, "D")]);
        return this.flag ? newArray : oldArray;
    },
};
