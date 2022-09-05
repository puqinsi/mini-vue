import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
    name: "App",
    render() {
        window.self = this;
        return h(
            "div",
            {
                class: "root",
            },
            [
                h("p", { class: "red" }, "hi"),
                h("p", { class: "green" }, "mini-vue"),
                "hi, mini-vue",
                h(Foo, {
                    count: 1,
                    onAdd(...arg) {
                        console.log("onAdd", arg);
                    },
                    onAddFoo(...arg) {
                        console.log("onAddFoo", arg);
                    },
                }),
            ],
        );
    },
    setup() {
        // composition api
        return {
            msg: "mini-vue-zc",
        };
    },
};
