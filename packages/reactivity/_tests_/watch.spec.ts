import { computed } from "../src/computed";
import { reactive } from "../src/reactive";
import { watch } from "../src/watch";

describe("watch", () => {
  it("happy path", () => {
    const person = reactive({
      age: 10,
    });

    let a = 1;
    watch(person, () => {
      a = 2;
    });

    person.age = 11;
    expect(a).toBe(2);
  });

  it("nested watch", () => {
    const person = reactive({
      age: 10,
      name: {
        first: "ce",
      },
    });

    let a = 1;
    watch(person, () => {
      a = 2;
    });

    person.name.first = "qinsi";
    expect(a).toBe(2);
  });

  it("receive a getter", () => {
    const person = reactive({
      age: 10,
    });

    let a = 1;
    watch(
      () => person.age,
      () => {
        a = 2;
      },
    );

    person.age = 11;
    expect(a).toBe(2);
  });

  it("cb have two argument", () => {
    const person = reactive({
      age: 10,
    });

    let num1, num2;
    watch(
      () => person.age,
      (newValue: any, oldValue: any) => {
        num1 = newValue;
        num2 = oldValue;
      },
    );

    person.age = 11;
    expect(num1).toBe(11);
    expect(num2).toBe(10);
  });

  it("immediate watch", () => {
    const person = reactive({
      age: 10,
    });

    let num1, num2;
    watch(
      () => person.age,
      (newValue: any, oldValue: any) => {
        num1 = newValue;
        num2 = oldValue;
      },
      {
        immediate: true,
      },
    );

    expect(num1).toBe(10);
    expect(num2).toBe(undefined);

    person.age = 11;
    expect(num1).toBe(11);
    expect(num2).toBe(10);
  });
});
