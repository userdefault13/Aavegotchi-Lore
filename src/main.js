import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import { useUiStore } from './stores';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');

const ui = useUiStore();
ui.initTheme();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
