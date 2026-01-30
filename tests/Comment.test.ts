import { Comment } from '../src/models/Comment';

describe('Comment', () => {
    it('should create a new comment with an id, postId, text, and timestamp', () => {
        const comment = new Comment(1, 1, 'This is a comment');
        expect(comment.id).toBe(1);
        expect(comment.postId).toBe(1);
        expect(comment.text).toBe('This is a comment');
        expect(comment.timestamp).toBeInstanceOf(Date);
    });
});
