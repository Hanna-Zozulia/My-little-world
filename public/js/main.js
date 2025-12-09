import { AppView } from './views/AppView.js';
import { AppController } from './controller/AppController.js';
// Точка входа: ищем корневой элемент и поднимаем MVC-связку
const root = document.getElementById('app');
if (root) {
    const view = new AppView(root);
    const controller = new AppController(view);
    controller.init();
}
