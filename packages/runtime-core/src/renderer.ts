import { effect } from "@mini-vue/reactivity";
import { ShapeFlags, EMPTY_OBJ, getSequence, isObject } from "@mini-vue/shared";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppApi } from "./createApp";
import { queueJobs } from "./scheduler";
import { Fragment, Text } from "./vnode";

// 把具体实现，改成接口传入形式，把具体功能抽象成公用功能
export function createRenderer(options: any) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  // 注：此 render 和 instance.render 不是一回事
  function render(vnode: any, container: any) {
    patch(null, vnode, container, null, null);
  }

  // n1 -> old Vnode
  // n2 -> new Vnode
  function patch(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ): void {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 element 类型
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 去处理 component 类型
          processComponent(n1, n2, container, parentComponent, anchor);
        }
    }
  }

  function processFragment(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  // 处理 element 类型
  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    if (!n1) {
      // 挂载元素
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    console.log("patchElement");
    console.log("n1", n1);
    console.log("n2", n2);

    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);

    // children diff
    patchChildren(n1, n2, el, parentComponent, anchor);
    // props diff
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // Array diff Array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(
    c1: any,
    c2: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    function isSameVnodeType(n1: any, n2: any) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    /* 算法：指针移动 */
    // 第一步：左侧对比，i 向右移
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVnodeType(n1, n2)) {
        // 继续 patch，可能 children 中有变化
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }

      i++;
    }

    // 第二步：右侧对比，e1, e2 向左移
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    /* 处理：针对指针的不同情况 */
    // 新的比老的长 -> 创建
    if (i > e1) {
      if (i <= e2) {
        const nextIndex = e2 + 1;
        // 左侧新增的首部插入（需要插入位 el），右侧新增的尾部插入（不需要插入位 el）
        const anchor = nextIndex < l2 ? c2[nextIndex].el : null;

        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 老的比新的长 -> 删除
      while (i <= e1) {
        // 把 prevChildren 中多的 child 的 el 删除
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      /* 中间对比 */
      const s1 = i;
      const s2 = i;

      const toBePatch = e2 - i + 1;
      let patchCount = 0;
      // key -> newIndex 的映射。children 更新时 key 的作用，优化更新流程，如果 child 有绑定 key 可以直接映射查找，否则需要遍历查找
      const keyToNewIndexMap = new Map();
      // index（指的是需要 patch 的元素中的 index，不是 c2 中的 index） -> oldIndex（指的是 c1 中的 index）的映射。用定长数组优化性能
      const indexToOldIndexMap = new Array(toBePatch);
      let moved = false;
      let maxIndexSoFar = 0;

      // 初始化，0 表示 newIndex 在 prevChildren 中没有映射，需要新增
      for (let i = 0; i < toBePatch; i++) indexToOldIndexMap[i] = 0;

      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(c2[i].key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        // 超出 c2 变动部分的 child -> 删除
        if (patchCount >= toBePatch) {
          hostRemove(prevChild.el);
          continue;
        }

        // null undefined
        let newIndex;
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVnodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        // prevChild 在 c2 中不存在 -> 删除
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          // 优化移动：为何放在这里，因为 prevChild 在 c2 中存在才需要移动，判断 newIndex 是不是递增，不是的话需要移动
          if (newIndex >= maxIndexSoFar) {
            maxIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          // 注意：i 有可能是 0，因为 0 表示需要创建，所以用 i+1
          indexToOldIndexMap[newIndex - s2] = i + 1;

          // prevChild 在 c2 中存在 -> 更新
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patchCount++;
        }
      }

      // 求出最长递增子序列（稳定序列），内容是 indexToOldIndexMap 中的 index
      const increasingNewIndexSequence = moved
        ? getSequence(indexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;
      // 倒序移动，确保插入前的元素位置都是稳定的。
      for (let i = toBePatch - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        // 如果没有到老节点的映射，表示新增 -> 创建
        if (indexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          // 如果该位置的元素不是稳定序列中的元素 -> 移动
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            // 移动位置
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  function patchProps(el: any, oldProps: any, newProps: any) {
    // 1. newProps 中属性值修改 -> 修改
    // 2. newProps 中属性值修改为 undefined | null -> 删除
    // 3. newProps 中属性删除 -> 删除
    if (oldProps !== newProps) {
      if (newProps !== EMPTY_OBJ) {
        for (const key in newProps) {
          const nextProp = newProps[key];
          const prevProp = oldProps[key];
          if (prevProp !== nextProp) {
            hostPatchProp(el, key, nextProp);
          }
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, null);
          }
        }
      }
    }
  }

  function mountElement(
    vnode: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    const { type, props, children, shapeFlag } = vnode;

    const el = (vnode.el = hostCreateElement(type));
    // 添加属性
    for (const key in props) {
      const val = props[key];

      hostPatchProp(el, key, val);
    }

    // 添加内容
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    hostInsert(el, container, anchor);
  }

  function mountChildren(
    children: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    children.forEach((v: any) => {
      if (isObject(v)) {
        patch(null, v, container, parentComponent, anchor);
      }
    });
  }

  // 去处理 component 类型
  function processComponent(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    if (!n1) {
      console.log("初始化 component");
      // 挂载组件
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      console.log("更新 component");
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1: any, n2: any) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(
    initialVNode: any,
    container: any,
    parentComponent: any,
    anchor: any,
  ) {
    // 创建组件 instance，把 instance 挂载到 vnode 上，component 更新逻辑要用
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
    ));

    // 初始化 setup 数据
    setupComponent(instance);

    // 渲染组件
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(
    instance: any,
    initialVNode: any,
    container: any,
    anchor: any,
  ) {
    instance.update = effect(
      () => {
        const { proxy, isMounded, subTree: preSubTree } = instance;
        if (!isMounded) {
          console.log("init");
          // vnode -> patch，和 createApp mount 的处理一样
          const subTree = (instance.subTree = instance.render.call(
            proxy,
            proxy,
          ));
          patch(null, subTree, container, instance, anchor);

          // 等组件处理完，所有 element 都创建好，添加到父节点上
          initialVNode.el = subTree.el;

          instance.isMounded = true;
        } else {
          console.log("update");

          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }

          const subTree = instance.render.call(proxy, proxy);
          instance.subTree = subTree;

          patch(preSubTree, subTree, container, instance, anchor);
        }
      },
      {
        // 巧妙利用 effect 调度器，把每一帧的更新任务先保存到队列里，等主任务完成后，在调用微任务一次更新。
        scheduler() {
          console.log("update scheduler");
          queueJobs(instance.update);
        },
      },
    );

    // 对照 createComponentInstance，把与 vnode 更新相关的属性更新
    function updateComponentPreRender(instance: any, nextVNode: any) {
      instance.vnode = nextVNode;
      instance.next = null;
      instance.props = nextVNode.props;
    }
  }

  return {
    createApp: createAppApi(render),
  };
}
