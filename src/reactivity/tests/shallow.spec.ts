import {
    isReactive,
    isReadonly,
    shallowReactive,
    shallowReadonly,
} from "../reactive";

describe("shallow", () => {
    test("shallowReadonly", () => {
        const props = shallowReadonly({ n: { foo: 1 } });
        expect(isReadonly(props)).toBe(true);
        expect(isReadonly(props.n)).toBe(false);
    });
    test("shallowReactive", () => {
        const props = shallowReactive({ n: { foo: 1 } });
        expect(isReactive(props)).toBe(true);
        expect(isReactive(props.n)).toBe(false);
    });
});
