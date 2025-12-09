// Представление: отвечает за DOM, формы и вывод ленты
export class AppView {
    constructor(root) {
        this.root = root;
        // Базовая разметка приложения
        this.root.innerHTML = `
            <section class="composer">
                <h2>Мой маленький мир</h2>
                <form class="post-form">
                    <label>Картинка<input name="imageUrl" type="url" placeholder="https://..." required /></label>
                    <label>Описание<input name="caption" type="text" placeholder="Скажи что-нибудь..." maxlength="120" required /></label>
                    <button type="submit">Опубликовать</button>
                </form>
                <p class="message" aria-live="polite"></p>
            </section>
            <section class="feed"></section>
        `;
        this.form = this.root.querySelector('.post-form');
        this.list = this.root.querySelector('.feed');
        this.message = this.root.querySelector('.message');
        // Обработка отправки формы: собираем данные и пробрасываем наружу
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!this.createHandler)
                return;
            const formData = new FormData(this.form);
            const imageUrl = String(formData.get('imageUrl') || '').trim();
            const caption = String(formData.get('caption') || '').trim();
            this.createHandler(imageUrl, caption);
        });
    }
    // Подписка контроллера на событие создания поста
    bindCreate(handler) {
        this.createHandler = handler;
    }
    // Подписка контроллера на событие реакции
    bindReact(handler) {
        this.reactHandler = handler;
    }
    // Показать сообщение об ошибке/подсказке
    showMessage(text) {
        this.message.textContent = text;
        this.message.classList.add('visible');
    }
    // Скрыть сообщение
    clearMessage() {
        this.message.textContent = '';
        this.message.classList.remove('visible');
    }
    // Сбросить форму и вернуть фокус на первый инпут
    resetForm() {
        this.form.reset();
        const firstInput = this.form.querySelector('input');
        firstInput?.focus();
    }
    // Нарисовать список постов
    render(posts) {
        this.list.innerHTML = '';
        if (!posts.length) {
            const empty = document.createElement('p');
            empty.className = 'empty';
            empty.textContent = 'No posts yet - add one!';
            this.list.appendChild(empty);
            return;
        }
        posts.forEach((post) => this.list.appendChild(this.createPostElement(post)));
    }
    // Создаем DOM-узел поста
    createPostElement(post) {
        const container = document.createElement('article');
        container.className = 'post-card';
        container.innerHTML = `
            <div class="image-wrap">
                <img src="${post.imageUrl}" alt="${post.caption}" loading="lazy" />
            </div>
            <div class="post-body">
                <p class="caption">${post.caption}</p>
                <div class="reactions">
                    ${this.reactionButton(post, 'like', 'Like', post.reactions.like)}
                    ${this.reactionButton(post, 'wow', 'Wow', post.reactions.wow)}
                    ${this.reactionButton(post, 'laugh', 'Haha', post.reactions.laugh)}
                </div>
            </div>
        `;
        // Навешиваем обработчики на кнопки реакций
        const buttons = container.querySelectorAll('[data-reaction]');
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const reaction = button.dataset.reaction;
                const postId = Number(button.dataset.postId);
                this.reactHandler?.(postId, reaction);
            });
        });
        return container;
    }
    // Возвращаем шаблон реакции
    reactionButton(post, reaction, label, count) {
        return `
            <button class="reaction" data-post-id="${post.id}" data-reaction="${reaction}">
                <span>${label}</span>
                <strong>${count}</strong>
            </button>
        `;
    }
}
