import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
    render() {
        return h(
            "div",
            { class: "root" },
            // `hi, mini-vue`,
            [
                h("p", { class: "red" }, "hi"),
                h("p", { class: "pink" }, "mini-vue"),
                "hi, mini-vue",
            ],
        );
    },
    setup() {
        // composition api
        return {
            msg: "mini-vue",
        };
    },
};
