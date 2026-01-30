import { Comment } from './Comment';

// Возможные типы реакций под постом
export type ReactionType = 'like' | 'wow' | 'laugh';

// Модель поста с индентификатором, ссылкой на картинку, подписью и счетчиками реакций
export class Post {
    constructor(
        public id: number,
        public imageUrl: string,
        public caption: string,
        public reactions: Record<ReactionType, number> = {like: 0, wow: 0, laugh: 0},
        public comments: Comment[] = []
    ) {}

    // Увеличиваем счетчик выбранной реакции
    addReaction(type: ReactionType): void {
        this.reactions[type] = (this.reactions[type] ?? 0) + 1;
    }
}