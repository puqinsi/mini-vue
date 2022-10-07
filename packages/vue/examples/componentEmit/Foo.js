import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    name: "Foo",
    setup(props, { emit }) {
        console.log(props);

        const emitAdd = () => {
            console.log("emit");
            emit("add", 1, 2);
            emit("add-foo");
        };
        return {
            emitAdd,
        };
    },
    render() {
        const btn = h(
            "button",
            {
                onClick: this.emitAdd,
            },
            "emitEvent",
        );
        const foo = h("div", {}, `foo: ${this.count}`);

        return h("div", {}, [foo, btn]);
    },
};
