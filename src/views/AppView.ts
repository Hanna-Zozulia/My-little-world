import { Post, ReactionType } from "../models/Post.js";
import { Comment } from "../models/Comment.js";

type CreateHandler = (imageUrl: string, caption: string) => void;
type ReactHandler = (postId: number, reaction: ReactionType) => void;
type CommentHandler = (postId: number, text: string) => void;

// Представление: отвечает за DOM, формы и вывод ленты
export class AppView {
    private form: HTMLFormElement;
    private list: HTMLElement;
    private message: HTMLElement;
    private createHandler?: CreateHandler;
    private reactHandler?: ReactHandler;
    private commentHandler?: CommentHandler;

    constructor(private root: HTMLElement) {
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

        this.form = this.root.querySelector('.post-form') as HTMLFormElement;
        this.list = this.root.querySelector('.feed') as HTMLElement;
        this.message = this.root.querySelector('.message') as HTMLElement;

        // Обработка отправки формы: собираем данные и пробрасываем наружу
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!this.createHandler) return;
            const formData = new FormData(this.form);
            const imageUrl = String(formData.get('imageUrl') || '').trim();
            const caption = String(formData.get('caption') || '').trim();
            this.createHandler(imageUrl, caption);
        });
    }

    // Подписка контроллера на событие создания поста
    bindCreate(handler: CreateHandler): void {
        this.createHandler = handler;
    }

    // Подписка контроллера на событие реакции
    bindReact(handler: ReactHandler): void {
        this.reactHandler = handler;
    }

    // Подписка контроллера на событие добавления комментария
    bindComment(handler: CommentHandler): void {
        this.commentHandler = handler;
    }

    // Показать сообщение об ошибке/подсказке
    showMessage(text: string): void {
    this.message.textContent = text;
    this.message.classList.add('visible');
    }

    // Скрыть сообщение
     clearMessage(): void {
        this.message.textContent = '';
        this.message.classList.remove('visible');
     }

     // Сбросить форму и вернуть фокус на первый инпут
     resetForm(): void {
        this.form.reset();
        const firstInput = this.form.querySelector('input');
        firstInput?.focus();
     }

     // Нарисовать список постов
     render(posts: Post[]): void {
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
     private createPostElement(post: Post): HTMLElement {
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
                <div class="comments">
                    <ul class="comment-list"></ul>
                    <form class="comment-form">
                        <input type="text" name="comment" placeholder="Add a comment..." required />
                        <button type="submit">Post</button>
                    </form>
                </div>
            </div>
        `;

        // Навешиваем обработчики на кнопки реакций
        const buttons = container.querySelectorAll('[data-reaction]');
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const reaction = (button as HTMLElement).dataset.reaction as ReactionType;
                const postId = Number((button as HTMLElement).dataset.postId);
                this.reactHandler?.(postId,reaction);
            });
        });

        const commentList = container.querySelector('.comment-list') as HTMLUListElement;
        post.comments.forEach(comment => {
            commentList.appendChild(this.createCommentElement(comment));
        });

        const commentForm = container.querySelector('.comment-form') as HTMLFormElement;
        commentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(commentForm);
            const text = String(formData.get('comment') || '').trim();
            if (text && this.commentHandler) {
                this.commentHandler(post.id, text);
                commentForm.reset();
            }
        });

        return container;
     }

     private createCommentElement(comment: Comment): HTMLElement {
        const item = document.createElement('li');
        item.className = 'comment';
        item.textContent = comment.text;
        return item;
    }

     // Возвращаем шаблон реакции
     private reactionButton(post: Post, reaction: ReactionType, label: string, count: number): String {
        return `
            <button class="reaction" data-post-id="${post.id}" data-reaction="${reaction}">
                <span>${label}</span>
                <strong>${count}</strong>
            </button>
        `;
     }
}