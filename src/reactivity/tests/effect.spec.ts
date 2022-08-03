import { reactive } from "../reactive";
import { effect } from "../effect";
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
});
