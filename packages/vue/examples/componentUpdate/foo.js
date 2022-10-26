import { h } from "../../dist/guide-mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup(props) {
    console.log(props);
    return {};
  },
  render() {
    return h("div", {}, "msg: " + this.$props.msg);
  },
};
