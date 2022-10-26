import { h, ref } from "../../dist/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    function onClick() {
      count.value++;
      console.log(count);
    }

    const props = ref({
      foo: "foo",
      bar: "bar",
    });

    function onChangeProps1() {
      props.value.foo = "new-foo";
    }

    function onChangeProps2() {
      props.value.foo = undefined;
    }

    function onChangeProps3() {
      props.value = {
        foo: "foo",
      };
    }

    return {
      count,
      props,
      onClick,
      onChangeProps1,
      onChangeProps2,
      onChangeProps3,
    };
  },
  render() {
    return h("div", { ...this.props }, [
      h("div", {}, `count: ${this.count}`),
      h("button", { onClick: this.onClick }, "点击"),
      h("button", { onClick: this.onChangeProps1 }, "点击-属性修改-修改"),
      h(
        "button",
        { onClick: this.onChangeProps2 },
        "点击-属性改为undefined-删除",
      ),
      h("button", { onClick: this.onChangeProps3 }, "点击-属性没有了-删除"),
    ]);
  },
};
