const debounce = (fn) => {
    let frameId;
    return (...args) => {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => fn.apply(this, args));
    };
};
const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = function(callback) {
    return new OriginalResizeObserver(debounce(callback));
};

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')