// Модель поста с индентификатором, ссылкой на картинку, подписью и счетчиками реакций
export class Post {
    constructor(id, imageUrl, caption, reactions = { like: 0, wow: 0, laugh: 0 }) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.reactions = reactions;
    }
    // Увеличиваем счетчик выбранной реакции
    addReaction(type) {
        this.reactions[type] = (this.reactions[type] ?? 0) + 1;
    }
}
