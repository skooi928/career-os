import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ForumService, PostDTO, CommentDTO } from '../../services/forum.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private forumService = inject(ForumService);

  postId = signal<number | null>(null);
  post = signal<PostDTO | null>(null);
  comments = signal<CommentDTO[]>([]);
  isLoading = signal(true);

  rootCommentText = signal('');
  replyInputs = signal<Record<number, string>>({});
  showReplyBox = signal<Record<number, boolean>>({});

  get currentUser() {
    return this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const idStr = params.get('id');

        if (idStr) {
          this.postId.set(Number(idStr));
          this.loadPostAndComments();
        }
      });
  }

  loadPostAndComments(): void {

    const id = this.postId();

    if (!id) return;

    this.isLoading.set(true);

    this.forumService.getPost(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (postData) => {
          this.post.set(postData);
          this.loadComments(id);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
  }

  loadComments(id: number): void {

    this.forumService.getComments(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (commentData) => {
          this.comments.set(commentData);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
  }

  submitRootComment(): void {

    const user = this.currentUser as any;

    const postId = this.postId();
    const text = this.rootCommentText().trim();

    const uid =
      user?.userId ||
      user?.id ||
      user?.uid ||
      user?.supabaseUid;

    if (!uid || !postId || !text) {
      return;
    }

    const userName =
      user?.userName ||
      user?.name ||
      'User';

    this.forumService
      .addComment(postId, text, uid, userName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newComment) => {

          this.comments.update(comments => [
            ...comments,
            {
              ...newComment,
              replies: newComment.replies ?? []
            }
          ]);

          this.rootCommentText.set('');

          this.post.update(post => {
            if (!post) return null;

            return {
              ...post,
              commentCount: post.commentCount + 1
            };
          });
        }
      });
  }

  toggleReplyBox(commentId: number): void {

    this.showReplyBox.update(state => ({
      ...state,
      [commentId]: !state[commentId]
    }));
  }

  submitNestedReply(
    parentCommentId: number,
    parentComment: CommentDTO
  ): void {

    const user = this.currentUser as any;

    const postId = this.postId();

    const text =
      this.replyInputs()[parentCommentId]?.trim();

    const uid =
      user?.userId ||
      user?.id ||
      user?.uid ||
      user?.supabaseUid;

    if (!uid || !postId || !text) {
      return;
    }

    const userName =
      user?.userName ||
      user?.name ||
      'User';

    this.forumService
      .addComment(
        postId,
        text,
        uid,
        parentCommentId
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newReply) => {

          this.comments.update(comments =>
            comments.map(comment => {

              if (comment.id === parentCommentId) {

                return {
                  ...comment,
                  replies: [
                    ...(comment.replies || []),
                    newReply
                  ]
                };
              }

              return comment;
            })
          );

          this.replyInputs.update(inputs => ({
            ...inputs,
            [parentCommentId]: ''
          }));

          this.showReplyBox.update(boxes => ({
            ...boxes,
            [parentCommentId]: false
          }));

          this.post.update(post => {
            if (!post) return null;

            return {
              ...post,
              commentCount: post.commentCount + 1
            };
          });
        }
      });
  }

  openProfile(userId: string): void {

    if (!userId) return;

    this.router.navigate([
      '/user-profile',
      userId
    ]);
  }

  formatTime(dateStr: string | Date): string {

    if (!dateStr) return '';

    const date = new Date(dateStr);

    const now = new Date();

    const diff =
      Math.floor(
        (now.getTime() - date.getTime()) / 1000
      );

    if (diff < 60) {
      return 'just now';
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    }

    return date.toLocaleDateString();
  }

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();
  }

  updateReplyInput(commentId: number, value: string): void {
  this.replyInputs.update(inputs => ({
    ...inputs,
    [commentId]: value
  }));
  }
}