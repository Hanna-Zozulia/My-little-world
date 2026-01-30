export class Comment {
    id: number;
    postId: number;
    text: string;
    timestamp: Date;

    constructor(id: number, postId: number, text: string) {
        this.id = id;
        this.postId = postId;
        this.text = text;
        this.timestamp = new Date();
    }
}
