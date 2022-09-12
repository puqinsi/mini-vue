import { h, createTextVNode } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
    name: "App",
    render() {
        window.self = this;
        const app = h("div", {}, "app");
        // const foo = h(Foo, {}, h("div", {}, "123"));
        const foo = h(
            Foo,
            {},
            {
                header: ({ age }) => [
                    h("div", {}, "header" + age),
                    createTextVNode("text_node"),
                ],
                footer: () => h("div", {}, "footer"),
            },
        );
        return h(
            "div",
            {
                class: "root",
            },
            [app, foo],
        );
    },
    setup() {
        // composition api
        return {
            msg: "mini-vue",
        };
    },
};
