import {AppView} from '../views/AppView.js';
import {Post, ReactionType} from '../models/Post.js';
import { Comment } from '../models/Comment.js';

// Точка инициаоизации: подписываем события, наполняем демо-данными и показываем списокView
export class AppController {
    private posts: Post[] = [];
    private nextId = 1;
    private nextCommentId = 1;

    constructor(private view: AppView) {}

    // Добавляем несколько стартовых постов
    init(): void {
        this.view.bindCreate(this.handleCreatePost);
        this.view.bindReact(this.handleReact);
        this.view.bindComment(this.handleComment);
        this.seed();
        this.view.render(this.posts);
    }

    // Добавляем несколько стартовых постов
    private seed(): void {
        const demo: Post[] = [
            new Post(
                this.nextId++,
                'https://th.bing.com/th/id/R.f4399864d38ceb5040193e0971a6fea3?rik=Wrq%2fnIVf%2figU%2bw&pid=ImgRaw&r=0',
                'Красота вокруг нас, ты только остановись и посмотри.',
                {like: 8, wow: 2, laugh: 1}
            ),
            new Post(
                this.nextId++,
                'https://images.pexels.com/photos/942825/pexels-photo-942825.jpeg?cs=srgb&dl=pexels-enjoyviibes-942825.jpg&fm=jpg',
                'Вы когда-нибуть задумывались почему горы такие высокии? ',
                {like: 5, wow: 1, laugh: 0}
            )
        ];
        this.posts = demo;
    }

    // Обработчик создания нового поста
    private handleCreatePost = (imageUrl: string, caption: string): void => {
        if (!imageUrl || !caption) {
            this.view.showMessage('Add an image URL and a caption.');
            return;
        }

        this.view.clearMessage();
        const post = new Post(this.nextId++, imageUrl, caption);
        this.posts = [post, ...this.posts];
        this.view.render(this.posts);
        this.view.resetForm();
    };

    // Обработчик реакции: ищем и увеличиваем соответствующий счетчик
    private handleReact = (postId: number, reaction: ReactionType): void => {
        const found = this.posts.find((post) => post.id === postId);
        if (!found) return;

        found.addReaction(reaction);
        this.view.render(this.posts);
    };

    private handleComment = (postId: number, text: string): void => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const newComment = new Comment(this.nextCommentId++, postId, text);
            post.comments.push(newComment);
            this.view.render(this.posts);
        }
    };
}