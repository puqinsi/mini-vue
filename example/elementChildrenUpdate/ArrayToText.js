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
        const array = h("div", {}, [h("div", {}, "A"), h("div", {}, "B")]);
        const text = h("div", {}, "text");
        return this.flag ? text : array;
    },
};
