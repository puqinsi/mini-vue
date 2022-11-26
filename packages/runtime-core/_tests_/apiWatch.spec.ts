import { reactive } from '@mini-vue/reactivity';
import { watch, watchEffect } from '../src/apiWatch';
import { nextTick } from '../src/scheduler';

describe('api:watch', () => {
    describe('watchEffect', () => {
        it('effect', async () => {
            const state = reactive({ count: 0 });
            let dummy;

            watchEffect(() => {
                dummy = state.count;
            });
            expect(dummy).toBe(0);

            state.count++;
            await nextTick();
            expect(dummy).toBe(1);
        });

        it('stop the watcher(effect)', async () => {
            const state = reactive({ count: 0 });
            let dummy;

            const stop = watchEffect(() => {
                dummy = state.count;
            });
            expect(dummy).toBe(0);

            stop();
            state.count++;
            await nextTick();
            expect(dummy).toBe(0);
        });

        it('cleanup registration (effect)', async () => {
            const state = reactive({ count: 0 });
            const cleanup = vi.fn();
            let dummy;
            const stop = watchEffect((onCleanup: any) => {
                onCleanup(cleanup);
                dummy = state.count;
            });
            expect(dummy).toBe(0);

            state.count++;
            await nextTick();
            expect(dummy).toBe(1);
            expect(cleanup).toHaveBeenCalledTimes(1);

            stop();
            expect(cleanup).toHaveBeenCalledTimes(2);
        });
    });

    describe('watch', () => {
        it('happy path', () => {
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

        it('nested watch', () => {
            const person = reactive({
                age: 10,
                name: {
                    first: 'ce',
                },
            });

            let a = 1;
            watch(person, () => {
                a = 2;
            });

            person.name.first = 'qinsi';
            expect(a).toBe(2);
        });

        it('receive a getter', () => {
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

        it('cb have two argument', () => {
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

        it('immediate watch', () => {
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
});
