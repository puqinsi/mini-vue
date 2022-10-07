import { h, ref, nextTick } from "../../lib/guide-mini-vue.esm.js";

export const App = {
    name: "App",
    setup() {
        const count = ref(0);

        function onClick() {
            for (let i = 0; i < 100; i++) {
                count.value++;
            }

            // 视图更新后的数据
            nextTick(() => {
                console.log(count.value);
            });
        }

        return {
            count,
            onClick,
        };
    },
    render() {
        return h("div", {}, [
            h("p", {}, `count: ${this.count}`),
            h("button", { onClick: this.onClick }, "点击"),
        ]);
    },
};
