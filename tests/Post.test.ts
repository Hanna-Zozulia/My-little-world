import { Post, ReactionType } from '../src/models/Post';

describe('Post', () => {
    let post: Post;

    // Before each test, create a new Post instance to ensure isolation
    beforeEach(() => {
        post = new Post(1, 'http://example.com/image.jpg', 'Test Caption');
    });

    // Test case for constructor initialization
    test('should initialize with provided values and default reactions', () => {
        expect(post.id).toBe(1);
        expect(post.imageUrl).toBe('http://example.com/image.jpg');
        expect(post.caption).toBe('Test Caption');
        expect(post.reactions).toEqual({ like: 0, wow: 0, laugh: 0 });
    });

    // Test case for constructor initialization with custom reactions
    test('should initialize with custom reactions if provided', () => {
        const customReactions = { like: 5, wow: 2, laugh: 1 };
        const customPost = new Post(2, 'http://example.com/another.jpg', 'Another Caption', customReactions);
        expect(customPost.reactions).toEqual(customReactions);
    });

    // Test case for adding a 'like' reaction
    test('should increment the "like" reaction count', () => {
        post.addReaction('like');
        expect(post.reactions.like).toBe(1);
        post.addReaction('like');
        expect(post.reactions.like).toBe(2);
        expect(post.reactions.wow).toBe(0);
        expect(post.reactions.laugh).toBe(0);
    });

    // Test case for adding a 'wow' reaction
    test('should increment the "wow" reaction count', () => {
        post.addReaction('wow');
        expect(post.reactions.wow).toBe(1);
        post.addReaction('wow');
        expect(post.reactions.wow).toBe(2);
        expect(post.reactions.like).toBe(0);
        expect(post.reactions.laugh).toBe(0);
    });

    // Test case for adding a 'laugh' reaction
    test('should increment the "laugh" reaction count', () => {
        post.addReaction('laugh');
        expect(post.reactions.laugh).toBe(1);
        post.addReaction('laugh');
        expect(post.reactions.laugh).toBe(2);
        expect(post.reactions.like).toBe(0);
        expect(post.reactions.wow).toBe(0);
    });

    // Test case for adding multiple types of reactions
    test('should increment multiple reaction counts independently', () => {
        post.addReaction('like');
        post.addReaction('wow');
        post.addReaction('like');
        post.addReaction('laugh');

        expect(post.reactions.like).toBe(2);
        expect(post.reactions.wow).toBe(1);
        expect(post.reactions.laugh).toBe(1);
    });
});
