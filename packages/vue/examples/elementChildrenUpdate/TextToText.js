import { h, ref } from "../../dist/guide-mini-vue.esm.js";

export default {
  name: "App",
  setup() {
    const flag = ref(false);
    window.self = flag;

    return {
      flag,
    };
  },
  render() {
    const newText = h("div", {}, "newText");
    const oldText = h("div", {}, "oldText");
    return this.flag ? newText : oldText;
  },
};
