import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js";

export const App = {
    name: "App",
    setup() {
        provide("app", "app");

        return {};
    },
    render() {
        const app = h("div", {}, "app");
        const foo = h(Foo);
        return h("div", {}, [app, foo]);
    },
};

export const Foo = {
    name: "Foo",
    setup() {
        provide("app", "foo");
        const app = inject("app");

        return { app };
    },
    render() {
        const foo = h("div", {}, `foo: ${this.app}`);
        const bar = h(Bar);
        return h("div", {}, [foo, bar]);
    },
};

export const Bar = {
    name: "Bar",
    setup() {
        const app = inject("app");
        const foo = inject("foo", () => "foo");

        return { app, foo };
    },
    render() {
        return h("div", {}, `bar: ${this.app} ${this.foo}`);
    },
};
