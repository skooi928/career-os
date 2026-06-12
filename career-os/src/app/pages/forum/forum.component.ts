import { Component, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ForumService, PostDTO, CreatePostRequest, PostMediaDTO, CommentDTO } from '../../services/forum.service';
import { ForumStoreService } from '../../services/forum-store.service';

type FeedFilter = 'all' | 'achievement' | 'project' | 'learning' | 'hiring' | 'general';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private auth = inject(AuthService);
  private forumService = inject(ForumService);
  private router = inject(Router);
  private store = inject(ForumStoreService);

  // Feed (persistent via store)
  get posts() { return this.store.posts; }
  get isLoading() { return this.store.isLoading; }
  get isLoadingMore() { return this.store.isLoadingMore; }
  get currentPage() { return this.store.currentPage; }
  get hasMore() { return this.store.hasMore; }
  get commentsMap() { return this.store.commentsMap; }

  // Local UI state
  activeFilter = signal<FeedFilter>('all');
  showCreateModal = signal(false);
  postContent = signal('');
  postType = signal('general');
  includeInCv = signal(false);
  uploadedMedia = signal<PostMediaDTO[]>([]);
  isSubmitting = signal(false);
  isUploading = signal(false);
  resharePostId = signal<number | null>(null);
  resharePost = signal<PostDTO | null>(null);
  showReshareModal = signal(false);
  reshareContent = signal('');
  openMenuPostId = signal<number | null>(null);
  editingPostId = signal<number | null>(null);
  editContent = signal('');
  commentInputs = signal<Record<number, string>>({});
  showCommentInput = signal<Record<number, boolean>>({});

  replyingTo: number | null = null;
  replyText: string = '';

  readonly POST_TYPES = [
    { value: 'general',     label: 'General',     icon: '✦' },
    { value: 'achievement', label: 'Achievement', icon: '🏆' },
    { value: 'project',     label: 'Project',     icon: '🚀' },
    { value: 'learning',    label: 'Learning',    icon: '📚' },
    { value: 'hiring',      label: 'Hiring',      icon: '💼' },
  ];

  readonly FILTERS: { key: FeedFilter; label: string }[] = [
    { key: 'all',         label: 'All' },
    { key: 'achievement', label: 'Achievements' },
    { key: 'project',     label: 'Projects' },
    { key: 'learning',    label: 'Learning' },
    { key: 'hiring',      label: 'Hiring' },
    { key: 'general',     label: 'General' },
  ];

  ngOnInit(): void {
    this.loadFeed(true);
  }

  get currentUser() { return this.auth.getCurrentUser(); }

  // ── Feed ──
  loadFeed(reset = false): void {
    if (reset) {
      this.currentPage.set(0);
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    this.forumService.getFeed(this.currentPage(), 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          const newPosts = reset ? page.content : [...this.posts(), ...page.content];
          this.posts.set(newPosts);
          this.hasMore.set(!page.last);
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        }
      });
  }

  loadMore(): void {
    if (!this.hasMore() || this.isLoadingMore()) return;
    this.currentPage.update(p => p + 1);
    this.loadFeed(false);
  }

  setFilter(filter: FeedFilter): void {
    this.activeFilter.set(filter);
  }

  get filteredPosts(): PostDTO[] {
    const f = this.activeFilter();
    if (f === 'all') return this.posts();
    return this.posts().filter(p => p.postType === f);
  }

  // ── Create post ──
  openCreateModal(reshare?: PostDTO): void {
    if (reshare) {
      this.resharePost.set(reshare);
      this.resharePostId.set(reshare.id);
      this.showReshareModal.set(true);
    } else {
      this.resharePost.set(null);
      this.resharePostId.set(null);
      this.showCreateModal.set(true);
    }
    this.postContent.set('');
    this.postType.set('general');
    this.includeInCv.set(false);
    this.uploadedMedia.set([]);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.showReshareModal.set(false);
    this.resharePost.set(null);
    this.reshareContent.set('');
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || !this.currentUser?.userId) return;

    this.isUploading.set(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.forumService.uploadMedia(file, this.currentUser.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (media) => {
            this.uploadedMedia.update(m => [...m, media]);
            this.isUploading.set(false);
          },
          error: () => this.isUploading.set(false)
        });
    }
  }

  removeMedia(index: number): void {
    this.uploadedMedia.update(m => m.filter((_, i) => i !== index));
  }

  submitPost(): void {
    const user = this.currentUser;
    if (!user?.userId || (!this.postContent().trim() && !this.uploadedMedia().length)) return;

    this.isSubmitting.set(true);
    const request: CreatePostRequest = {
      content: this.postContent(),
      postType: this.postType(),
      includeInCv: this.includeInCv(),
      media: this.uploadedMedia(),
    };

    this.forumService.createPost(request, user.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (post) => {
          this.posts.update(posts => [post, ...posts]);
          this.closeCreateModal();
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false)
      });
  }

  submitReshare(): void {
    const user = this.currentUser;
    const postId = this.resharePostId();
    if (!user?.userId || !postId) return;

    this.isSubmitting.set(true);
    this.forumService.resharePost(postId, this.reshareContent(), user.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (post) => {
          this.posts.update(posts => [post, ...posts]);
          this.closeCreateModal();
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false)
      });
  }

  // ── Like ──
  toggleLike(post: PostDTO): void {
    const user = this.currentUser;
    if (!user?.userId) return;

    const action = this.forumService.likePost(post.id, user.userId);

    this.posts.update(posts => posts.map(p => p.id === post.id ? {
      ...p,
      likedByCurrentUser: !p.likedByCurrentUser,
      likeCount: p.likedByCurrentUser ? p.likeCount - 1 : p.likeCount + 1
    } : p));

    action.pipe(takeUntil(this.destroy$)).subscribe({
      error: () => {
        this.posts.update(posts => posts.map(p => p.id === post.id ? {
          ...p,
          likedByCurrentUser: !p.likedByCurrentUser,
          likeCount: p.likeCount ? p.likeCount - 1 : p.likeCount + 1
        } : p));
      }
    });
  }

  // ── Comments ──
  toggleCommentInput(postId: number): void {
    const current = this.showCommentInput()[postId];
    this.showCommentInput.update(s => ({ ...s, [postId]: !current }));
    if (!current) {
      this.loadComments(postId);
    }
  }

    loadComments(postId: number): void {
    this.forumService.getComments(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comments) => {
          this.commentsMap.update(map => ({ ...map, [postId]: comments }));
        }
      });
  }

  submitQuickComment(post: PostDTO): void {
    const user = this.currentUser;
    const content = this.commentInputs()[post.id]?.trim();
    if (!user?.userId || !content) return;

    this.forumService.addComment(post.id, content, user.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newComment) => {
          // Clear input
          this.commentInputs.update(c => ({ ...c, [post.id]: '' }));

          // Update count
          this.posts.update(posts => posts.map(p =>
            p.id === post.id ? { ...p, commentCount: p.commentCount + 1 } : p
          ));

          // Push new comment into commentsMap
          const current = this.commentsMap()[post.id] || [];
          this.commentsMap.update(map => ({
            ...map,
            [post.id]: [...current, newComment]
          }));
        }
      });
  }

  startReply(comment: CommentDTO): void {
    this.replyingTo = comment.id;
    this.replyText = '';
    }

    submitReply(postId: number, parentCommentId: number): void {
    if (!this.replyText.trim()) return;

    const user = this.currentUser;
    if (!user?.userId) return;

    this.forumService.addComment(
        postId,
        this.replyText,
        user.userId,
        parentCommentId,
        `${user.firstName} ${user.lastName}`
        )
        .subscribe({
        next: (newReply) => {
            // clear input
            this.replyText = '';
            this.replyingTo = null;

            // update local comment thread
            const comments = this.commentsMap()[postId] || [];
            const parent = comments.find(c => c.id === parentCommentId);
            if (parent) {
            parent.replies = [...(parent.replies || []), newReply];
            this.commentsMap.update(map => ({ ...map, [postId]: comments }));
            }
        }
        });
    }


  // ── Edit / Delete ──
  togglePostMenu(postId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuPostId.update(id => id === postId ? null : postId);
  }

  startEdit(post: PostDTO): void {
    this.editingPostId.set(post.id);
    this.editContent.set(post.content);
    this.openMenuPostId.set(null);
  }

  cancelEdit(): void {
    this.editingPostId.set(null);
    this.editContent.set('');
  }

  saveEdit(postId: number): void {
    const user = this.currentUser;
    if (!user?.userId || !this.editContent().trim()) return;

    this.forumService.updatePost(postId, this.editContent(), user.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.posts.update(posts => posts.map(p => p.id === postId ? updated : p));
          this.cancelEdit();
        }
      });
  }

  deletePost(postId: number): void {
    const user = this.currentUser;
    if (!user?.userId || !confirm('Delete this post?')) return;

    this.forumService.deletePost(postId, user.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.posts.update(posts => posts.filter(p => p.id !== postId))
      });
    this.openMenuPostId.set(null);
  }

  // ── Navigation ──
  openPost(postId: number): void {
    this.router.navigate(['/post', postId]);
  }

  openProfile(userId: string): void {
    this.router.navigate(['/user-profile', userId]);
  }

  // ── Helpers ──
  getPostTypeLabel(type: string): string {
    return this.POST_TYPES.find(t => t.value === type)?.label ?? type;
  }

  getPostTypeIcon(type: string): string {
    return this.POST_TYPES.find(t => t.value === type)?.icon ?? '✦';
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  isImageMedia(media: PostMediaDTO): boolean {
    return media.mediaType === 'image';
  }

  @HostListener('document:click')
  closeMenus(): void { this.openMenuPostId.set(null); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
