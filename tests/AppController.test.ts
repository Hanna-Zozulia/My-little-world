import { AppController } from '../src/controller/AppController';
import { AppView } from '../src/views/AppView';
import { Post, ReactionType } from '../src/models/Post';

describe('AppController', () => {
    let mockAppView: AppView;
    let controller: AppController;

    // Set up a new mock AppView and AppController before each test
    beforeEach(() => {
        mockAppView = {
            bindCreate: jest.fn(),
            bindReact: jest.fn(),
            bindComment: jest.fn(),
            showMessage: jest.fn(),
            clearMessage: jest.fn(),
            render: jest.fn(),
            resetForm: jest.fn(),
        } as unknown as AppView; // Cast to AppView as we're mocking it

        controller = new AppController(mockAppView);
    });

    // Test initialization logic
    describe('init', () => {
        test('should bind create and react handlers, seed posts, and render view', () => {
            controller.init();

            // Verify that handlers are bound
            expect(mockAppView.bindCreate).toHaveBeenCalledWith(expect.any(Function));
            expect(mockAppView.bindReact).toHaveBeenCalledWith(expect.any(Function));

            // Verify that seed method populated posts
            // We can't directly check the private 'posts' array, but we can check the render call
            // The initial render should have 2 posts from the seed method
            expect(mockAppView.render).toHaveBeenCalledWith(expect.arrayContaining([
                expect.any(Post),
                expect.any(Post)
            ]));
            expect((mockAppView.render as jest.Mock).mock.calls[0][0].length).toBe(2);
        });
    });

    // Test handling of post creation
    describe('handleCreatePost', () => {
        let handleCreatePost: (imageUrl: string, caption: string) => void;

        // Extract the bound handler after init is called
        beforeEach(() => {
            controller.init();
            handleCreatePost = (mockAppView.bindCreate as jest.Mock).mock.calls[0][0];
        });

        test('should create a new post, update posts, render view, and reset form for valid input', () => {
            const initialRenderCallCount = (mockAppView.render as jest.Mock).mock.calls.length;
            const initialPosts = (mockAppView.render as jest.Mock).mock.calls[0][0]; // Get posts from initial render

            handleCreatePost('http://new.com/image.jpg', 'New Caption');

            // Expect clearMessage to be called before adding post
            expect(mockAppView.clearMessage).toHaveBeenCalled();

            // Verify a new post was added and render was called with updated posts
            expect(mockAppView.render).toHaveBeenCalledTimes(initialRenderCallCount + 1); // Initial render + one for new post
            const updatedPosts = (mockAppView.render as jest.Mock).mock.calls[initialRenderCallCount][0];
            expect(updatedPosts.length).toBe(initialPosts.length + 1);
            expect(updatedPosts[0].caption).toBe('New Caption'); // New post should be at the beginning

            // Verify form reset
            expect(mockAppView.resetForm).toHaveBeenCalled();
        });

        test('should show message and not create post for empty image URL', () => {
            const initialRenderCallCount = (mockAppView.render as jest.Mock).mock.calls.length;

            handleCreatePost('', 'New Caption');

            // Verify showMessage is called
            expect(mockAppView.showMessage).toHaveBeenCalledWith('Add an image URL and a caption.');
            // Verify no new render call
            expect(mockAppView.render).toHaveBeenCalledTimes(initialRenderCallCount);
            // Verify form not reset
            expect(mockAppView.resetForm).not.toHaveBeenCalled();
        });

        test('should show message and not create post for empty caption', () => {
            const initialRenderCallCount = (mockAppView.render as jest.Mock).mock.calls.length;

            handleCreatePost('http://new.com/image.jpg', '');

            // Verify showMessage is called
            expect(mockAppView.showMessage).toHaveBeenCalledWith('Add an image URL and a caption.');
            // Verify no new render call
            expect(mockAppView.render).toHaveBeenCalledTimes(initialRenderCallCount);
            // Verify form not reset
            expect(mockAppView.resetForm).not.toHaveBeenCalled();
        });

        test('should show message and not create post for both empty image URL and caption', () => {
            const initialRenderCallCount = (mockAppView.render as jest.Mock).mock.calls.length;

            handleCreatePost('', '');

            // Verify showMessage is called
            expect(mockAppView.showMessage).toHaveBeenCalledWith('Add an image URL and a caption.');
            // Verify no new render call
            expect(mockAppView.render).toHaveBeenCalledTimes(initialRenderCallCount);
            // Verify form not reset
            expect(mockAppView.resetForm).not.toHaveBeenCalled();
        });
    });

    // Test handling of reactions
    describe('handleReact', () => {
        let handleReact: (postId: number, reaction: ReactionType) => void;
        let initialPosts: Post[];
        let firstPostId: number;
        let secondPostId: number;

        // Initialize controller, extract handler, and get initial posts
        beforeEach(() => {
            controller.init();
            handleReact = (mockAppView.bindReact as jest.Mock).mock.calls[0][0];
            initialPosts = (mockAppView.render as jest.Mock).mock.calls[0][0];
            firstPostId = initialPosts[0].id;
            secondPostId = initialPosts[1].id;
        });

        test('should increment reaction count and re-render for a valid post and reaction', () => {
            const initialRenderCallCount = (mockAppView.render as jest.Mock).mock.calls.length;

            const initialLikes = initialPosts[0].reactions.like;
            handleReact(firstPostId, 'like');

            // Verify reaction count is incremented on the correct post
            const updatedPosts = (mockAppView.render as jest.Mock).mock.calls[initialRenderCallCount][0];
            const updatedFirstPost = updatedPosts.find((p: Post) => p.id === firstPostId);
            expect(updatedFirstPost?.reactions.like).toBe(initialLikes + 1);
            expect(mockAppView.render).toHaveBeenCalledTimes(initialRenderCallCount + 1);
        });

        test('should not change reaction count or re-render for an invalid post ID', () => {
            const initialRenderCallCount = (mockAppView.render as jest.Mock).mock.calls.length;
            const postsBeforeReact = JSON.parse(JSON.stringify(initialPosts)); // Deep copy to compare

            handleReact(999, 'wow'); // Invalid post ID

            // Verify no change in reaction counts
            const postsAfterReact = (mockAppView.render as jest.Mock).mock.calls[initialRenderCallCount -1][0]; // Get the last render before this call
            expect(postsAfterReact).toEqual(postsBeforeReact); // No change in posts array

            // Verify no new render call
            expect(mockAppView.render).toHaveBeenCalledTimes(initialRenderCallCount);
        });

        test('should increment different reaction types independently', () => {
            const initialRenderCallCount = (mockAppView.render as jest.Mock).mock.calls.length;
            const initialFirstPostLikes = initialPosts[0].reactions.like;
            const initialSecondPostWows = initialPosts[1].reactions.wow;

            handleReact(firstPostId, 'like');
            handleReact(secondPostId, 'wow');

            // Check first post's like count
            let updatedPosts = (mockAppView.render as jest.Mock).mock.calls[initialRenderCallCount][0];
            let updatedFirstPost = updatedPosts.find((p: Post) => p.id === firstPostId);
            expect(updatedFirstPost?.reactions.like).toBe(initialFirstPostLikes + 1);

            // Check second post's wow count
            updatedPosts = (mockAppView.render as jest.Mock).mock.calls[initialRenderCallCount + 1][0];
            let updatedSecondPost = updatedPosts.find((p: Post) => p.id === secondPostId);
            expect(updatedSecondPost?.reactions.wow).toBe(initialSecondPostWows + 1);

            expect(mockAppView.render).toHaveBeenCalledTimes(initialRenderCallCount + 2); // Initial + 2 reactions
        });
    });
});
