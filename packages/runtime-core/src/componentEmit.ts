import { camelize, toHandlerKey } from "@mini-vue/shared";

export function emit(instance: any, event: any, ...arg: any[]) {
  // instance.props -> event
  const { props } = instance;

  // TPP 先实现一个特定的行为，再重构成一个通用的行为
  // add -> Add -> onAdd
  // add-foo -> addFoo -> AddFoo -> onAddFoo

  const handlerName = toHandlerKey(camelize(event));
  // 从属性中找
  const handler = props[handlerName];
  handler & handler(...arg);
}
