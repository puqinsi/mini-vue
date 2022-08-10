import { reactive } from "../reactive";
import { effect, stop } from "../effect";
describe("effect", () => {
    it("happy path", () => {
        const user = reactive({
            age: 10,
        });

        let nextAge;
        effect(() => {
            nextAge = user.age + 1;
        });

        expect(nextAge).toBe(11);

        // update
        user.age++;
        expect(nextAge).toBe(12);
    });

    it("runner", () => {
        // effect(fn) → function (runner) → fn → return
        let count = 10;
        const runner = effect(() => {
            count++;
            return "count";
        });
        expect(count).toBe(11);
        const r = runner();
        expect(count).toBe(12);
        expect(r).toBe("count");
    });

    it("scheduler", () => {
        // 1.通过 effect 的第二个参数给定一个 schedule
        // 2.effect第一次执行，会执行 fn;
        // 3.当响应式对象set update 不会执行 fn, 而是执行 scheduler;
        // 4.执行runner 时，不会执行scheduler，而是执行 fn;
        let dummy;
        let run: any;
        const scheduler = jest.fn(() => {
            run = runner;
        });

        const obj = reactive({ foo: 1 });
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            {
                scheduler,
            },
        );

        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on first trigger
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        // should not run yet
        expect(dummy).toBe(1);
        // manually run
        run();
        // should han run
        expect(dummy).toBe(2);
    });

    it("stop", () => {
        let dummy;
        const obj = reactive({ foo: 1 });
        const runner = effect(() => {
            dummy = obj.foo;
        });

        obj.foo = 2;
        expect(dummy).toBe(2);
        stop(runner);
        // 触发 set
        // obj.foo = 3;
        // 触发 get set
        obj.foo++;
        expect(dummy).toBe(2);

        runner();
        expect(dummy).toBe(3);
    });

    it("onStop", () => {
        let dummy;
        const onStop = jest.fn();
        const obj = reactive({ foo: 1 });
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            { onStop },
        );

        stop(runner);
        expect(onStop).toHaveBeenCalled();
    });

    // 嵌套响应对象，effect只会收集属性对应的值为非对象的依赖
    it("nested effect", () => {
        let obj = reactive({ foo: 1, bar: { coo: 2 } });
        let baz;
        effect(() => {
            baz = obj.bar;
        });
        expect(baz.coo).toBe(2);
    });
});
