// 注：ELEMENT、STATEFUL_COMPONENT 表示 vnode 类型，TEXT_CHILDREN、ARRAY_CHILDREN、SLOTS_CHILDREN 表示vnode 的 children 类型，children 类型主要在更新时更多用到
export const enum ShapeFlags {
  ELEMENT = 1, // 1
  STATEFUL_COMPONENT = 1 << 1, // 10
  TEXT_CHILDREN = 1 << 2, // 100
  ARRAY_CHILDREN = 1 << 3, // 1000
  SLOTS_CHILDREN = 1 << 4, // 10000
}

/* 位运算 */

/* 左移运算符 */
// <<

/* | 或 */
// 两者都为0，才是0  （一个是1，就是1）
// 修改  应用时 相当于合并状态

// 0001
// 0000
// ————
// 0001

// 0001
// 0100
// ————
// 0101

/* & 与 */
// 两者都为1，才是1   （一个是0，就是0）
// 查找 应用时 判断是否为 0

// 0001
// 0000
// ————
// 0000

// 0001
// 0001
// ————
// 0001
