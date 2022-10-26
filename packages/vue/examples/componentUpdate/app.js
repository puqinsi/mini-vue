import { h, ref } from "../../dist/guide-mini-vue.esm.js";
import { Foo } from "./foo.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    function onClick() {
      count.value++;
      console.log(count);
    }

    const msg = ref("123");
    window.msg = msg;

    function onChangeProps() {
      msg.value = "456";
    }

    return {
      count,
      msg,
      onClick,
      onChangeProps,
    };
  },
  render() {
    return h("div", {}, [
      h("button", { onClick: this.onChangeProps }, "点击-属性修改-修改"),
      h(Foo, { msg: this.msg }),
      h("button", { onClick: this.onClick }, "点击"),
      h("div", {}, `count: ${this.count}`),
    ]);
  },
};
