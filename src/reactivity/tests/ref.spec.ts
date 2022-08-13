import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from "../ref";

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

    it("isRef", () => {
        const a = ref(1);
        const person = reactive({
            age: 10,
        });
        expect(isRef(a)).toBe(true);
        expect(isRef(1)).toBe(false);
        expect(isRef(person)).toBe(false);
    });

    it("unRef", () => {
        const a = ref(1);
        expect(unRef(a)).toBe(1);
        expect(unRef(1)).toBe(1);
    });

    it("proxyRefs", () => {
        // proxyRefs 目的就是处理对象中属性是ref的数据，
        // 利用 proxy 去 处理 get 和 set 时的操作，处理 ref 数据 解构和赋值
        const person = {
            age: ref(10),
            name: "puqinsi",
        };
        const proxyPerson = proxyRefs(person);
        expect(proxyPerson.age).toBe(10);
        expect(person.age.value).toBe(10);
        expect(person.name).toBe("puqinsi");

        proxyPerson.age = 20;
        expect(proxyPerson.age).toBe(20);
        expect(person.age.value).toBe(20);

        proxyPerson.age = ref(20);
        expect(proxyPerson.age).toBe(20);
        expect(person.age.value).toBe(20);
    });
});
