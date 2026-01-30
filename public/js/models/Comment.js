export class Comment {
    constructor(id, postId, text) {
        this.id = id;
        this.postId = postId;
        this.text = text;
        this.timestamp = new Date();
    }
}
