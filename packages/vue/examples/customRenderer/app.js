import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
    name: "App",
    setup() {
        return {
            x: 10,
            y: 10,
        };
    },
    render() {
        return h("rect", { x: this.x, y: this.y });
    },
};
