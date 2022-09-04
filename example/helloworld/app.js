import { h } from "../../lib/guide-mini-vue.esm.js";

window.self = null;
export const App = {
    render() {
        window.self = this;
        return h(
            "div",
            {
                class: "root",
                onClick() {
                    console.log("click");
                },
                onMousedown() {
                    console.log("mousedown");
                },
            },
            // setupStatus, $el->get root element
            // `hi, ${this.msg}`,
            [
                h("p", { class: "red" }, "hi"),
                h("p", { class: "green" }, "mini-vue"),
                "hi, mini-vue",
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
