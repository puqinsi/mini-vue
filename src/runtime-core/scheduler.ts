const queue: any[] = [];

const p = Promise.resolve();
let isFlushPending = false;

// 核心：微任务
export function nextTick(fn: any) {
    fn ? p.then(fn) : p;
}

export function queueJobs(job: any) {
    if (!queue.includes(job)) {
        queue.push(job);
    }

    queueFlush();
}

function queueFlush() {
    // 优化：避免重复创建 nextTick
    if (isFlushPending) return;
    isFlushPending = true;

    nextTick(() => {
        let job;
        while ((job = queue.shift())) {
            job && job();
        }

        isFlushPending = false;
    });
}
