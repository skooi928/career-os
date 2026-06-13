import { Injectable, signal } from '@angular/core';
import { PostDTO, CommentDTO } from './forum.service';

@Injectable({ providedIn: 'root' })
export class ForumStoreService {
  // Signals for persistent state
  posts = signal<PostDTO[]>([]);
  currentPage = signal(0);
  hasMore = signal(true);
  isLoading = signal(false);
  isLoadingMore = signal(false);

  // Comments per post
  commentsMap = signal<Record<number, CommentDTO[]>>({});
}
