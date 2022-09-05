import { camelize, toHandlerKey } from "../shared";

export function emit(instance: any, event: any) {
    // instance.props -> event
    const { props } = instance;

    // TPP 先实现一个特定的行为，再重构成一个通用的行为
    // add -> Add
    // add-foo -> addFoo

    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler & handler();
}
