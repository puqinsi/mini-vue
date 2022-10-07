import { createRenderer } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";

// 创建画布添加到 body
const game = new PIXI.Application({
    width: 500,
    height: 500,
});
document.body.append(game.view);

// 自定义渲染器
const renderer = createRenderer({
    createElement(type) {
        if (type === "rect") {
            const rect = new PIXI.Graphics();
            rect.beginFill(0xde3249);
            rect.drawRect(50, 50, 100, 100);
            rect.endFill();

            return rect;
        }
    },
    patchProp(el, key, value) {
        el[key] = value;
    },
    insert(el, parent) {
        parent.addChild(el);
    },
});

renderer.createApp(App).mount(game.stage);
