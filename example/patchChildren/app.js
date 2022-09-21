import { h, ref } from "../../lib/guide-mini-vue.esm.js";
import ArrayToText from "./ArrayToText.js";
import ArrayToArray from "./ArrayToArray.js";
import TextToText from "./TextToText.js";
import TextToArray from "./TextToArray.js";

export const App = {
    name: "App",
    setup() {
        return {};
    },
    render() {
        return h(
            // TextToArray,
            // TextToText,
            // ArrayToText,
            ArrayToArray,
        );
    },
};
