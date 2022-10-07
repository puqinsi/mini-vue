import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
    name: "App",
    render() {
        const app = h("div", {}, "app");
        const foo = h(Foo);
        return h("div", {}, [app, foo]);
    },
    setup() {
        console.log("App: ", getCurrentInstance());
        return {};
    },
};
