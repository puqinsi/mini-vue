import { effect } from "../effect";
import { ref } from "../ref";

describe("ref", () => {
    it("happy path", () => {
        const count = ref(1);
        expect(count.value).toBe(1);
    });

    it("should be reactive", () => {
        const count = ref(1);
        let dummy;
        let num = 0;
        effect(() => {
            num++;
            dummy = count.value;
        });

        expect(num).toBe(1);
        expect(dummy).toBe(1);

        count.value++;
        expect(num).toBe(2);
        expect(dummy).toBe(2);

        count.value = 2;
        expect(num).toBe(2);
        expect(dummy).toBe(2);
    });

    it("should be nested reactive", () => {
        const a = ref({
            count: 1,
        });
        let dummy;
        effect(() => {
            dummy = a.value.count;
        });

        expect(a.value.count).toBe(1);
        expect(dummy).toBe(1);

        a.value.count++;
        expect(a.value.count).toBe(2);
        expect(dummy).toBe(2);
    });
});
