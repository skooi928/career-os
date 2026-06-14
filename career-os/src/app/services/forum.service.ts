// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface PostMediaDTO {
//   id?: number;
//   url: string;
//   mediaType: string;
//   fileName?: string;
//   fileSize?: number;
// }

// export interface PostDTO {
//   id: number;
//   userId: string;
//   authorName: string;
//   authorInitials: string;
//   content: string;
//   postType: string;
//   includeInCv: boolean;
//   isReshare: boolean;
//   originalPostId?: number;
//   originalPost?: PostDTO;
//   isEdited: boolean;
//   media: PostMediaDTO[];
//   likeCount: number;
//   commentCount: number;
//   reshareCount: number;
//   likedByCurrentUser: boolean;
//   resharedByCurrentUser: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CommentDTO {
//   id: number;
//   postId: number;
//   userId: string;
//   authorName: string;
//   authorInitials: string;
//   content: string;
//   parentCommentId?: number;
//   replies?: CommentDTO[];
//   isEdited: boolean;
//   createdAt: string;
// }

// export interface CreatePostRequest {
//   content: string;
//   postType: string;
//   includeInCv: boolean;
//   media: PostMediaDTO[];
//   reshareOfPostId?: number;
// }

// export interface PageResponse<T> {
//   content: T[];
//   totalElements: number;
//   totalPages: number;
//   number: number;
//   last: boolean;
// }

// @Injectable({ providedIn: 'root' })
// export class ForumService {
//   private http = inject(HttpClient);
//   private api = 'http://localhost:8080/api/forum';

//   getFeed(page = 0, size = 20): Observable<PageResponse<PostDTO>> {
//     const params = new HttpParams().set('page', page).set('size', size);
//     return this.http.get<PageResponse<PostDTO>>(`${this.api}/posts`, { params });
//   }

//   getPost(id: number): Observable<PostDTO> {
//     return this.http.get<PostDTO>(`${this.api}/posts/${id}`);
//   }

//   getUserPosts(userId: string): Observable<PostDTO[]> {
//     return this.http.get<PostDTO[]>(`${this.api}/posts/user/${userId}`);
//   }

//   createPost(request: CreatePostRequest, supabaseUid: string): Observable<PostDTO> {
//     return this.http.post<PostDTO>(`${this.api}/posts?supabaseUid=${supabaseUid}`, request);
//   }

//   updatePost(id: number, content: string, supabaseUid: string): Observable<PostDTO> {
//     return this.http.put<PostDTO>(`${this.api}/posts/${id}?supabaseUid=${supabaseUid}`, { content });
//   }

//   deletePost(id: number, supabaseUid: string): Observable<void> {
//     return this.http.delete<void>(`${this.api}/posts/${id}?supabaseUid=${supabaseUid}`);
//   }

//   likePost(postId: number, supabaseUid: string): Observable<void> {
//     return this.http.post<void>(`${this.api}/posts/${postId}/like?supabaseUid=${supabaseUid}`, {});
//   }

// //   unlikePost(postId: number, supabaseUid: string): Observable<void> {
// //     return this.http.delete<void>(`${this.api}/posts/${postId}/like?supabaseUid=${supabaseUid}`);
// //   }

//   getComments(postId: number): Observable<CommentDTO[]> {
//     return this.http.get<CommentDTO[]>(`${this.api}/posts/${postId}/comments`);
//   }

//   addComment(postId: number, content: string, supabaseUid: string, parentId?: number): Observable<CommentDTO> {
//     return this.http.post<CommentDTO>(
//       `${this.api}/posts/${postId}/comments?supabaseUid=${supabaseUid}`,
//       { content, parentCommentId: parentId }
//     );
//   }

//   deleteComment(commentId: number, supabaseUid: string): Observable<void> {
//     return this.http.delete<void>(`${this.api}/comments/${commentId}?supabaseUid=${supabaseUid}`);
//   }

//   resharePost(postId: number, content: string, supabaseUid: string): Observable<PostDTO> {
//     return this.http.post<PostDTO>(
//       `${this.api}/posts/${postId}/reshare?supabaseUid=${supabaseUid}`,
//       { content }
//     );
//   }

//   uploadMedia(file: File, supabaseUid: string): Observable<PostMediaDTO> {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('supabaseUid', supabaseUid);
//     return this.http.post<PostMediaDTO>(`${this.api}/upload`, formData);
//   }
// }
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostMediaDTO {
  id?: number;
  url: string;
  mediaType: string;
  fileName?: string;
  fileSize?: number;
}

export interface PostDTO {
  id: number;
  userId: string;
  authorName: string;
  authorInitials: string;
  content: string;
  postType: string;
  includeInCv: boolean;
  isReshare: boolean;
  originalPostId?: number;
  originalPost?: PostDTO;
  isEdited: boolean;
  media: PostMediaDTO[];
  likeCount: number;
  commentCount: number;
  reshareCount: number;
  likedByCurrentUser: boolean;
  resharedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDTO {
  id: number;
  postId: number;
  userId: string;
  authorName: string;
  authorInitials: string;
  content: string;
  parentCommentId?: number;
  replies?: CommentDTO[];
  isEdited: boolean;
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
  postType: string;
  includeInCv: boolean;
  media: PostMediaDTO[];
  reshareOfPostId?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/forum';

  // ── POSTS ───────────────────────────────────────────────
  getFeed(page = 0, size = 20): Observable<PageResponse<PostDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<PostDTO>>(`${this.api}/feed`, { params });
  }

  getPost(id: number): Observable<PostDTO> {
    return this.http.get<PostDTO>(`${this.api}/posts/${id}`);
  }

  getUserPosts(userId: string): Observable<PostDTO[]> {
    return this.http.get<PostDTO[]>(`${this.api}/posts/user/${userId}`);
  }

  createPost(request: CreatePostRequest, supabaseUid: string): Observable<PostDTO> {
    return this.http.post<PostDTO>(`${this.api}/posts?supabaseUid=${supabaseUid}`, request);
  }

  updatePost(id: number, content: string, supabaseUid: string): Observable<PostDTO> {
    return this.http.put<PostDTO>(`${this.api}/posts/${id}?supabaseUid=${supabaseUid}`, { content });
  }

  deletePost(id: number, supabaseUid: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/posts/${id}?supabaseUid=${supabaseUid}`);
  }

  // ── LIKES (toggle only) ─────────────────────────────────
  likePost(postId: number, supabaseUid: string, actorName: string=''): Observable<void> {
    return this.http.post<void>(
      `${this.api}/posts/${postId}/like?supabaseUid=${supabaseUid}&actorName=${actorName}`,
      {}
    );
  }

  // ── COMMENTS ───────────────────────────────────────────
  getComments(postId: number): Observable<CommentDTO[]> {
    return this.http.get<CommentDTO[]>(`${this.api}/posts/${postId}/comments`);
  }

  addComment(postId: number, content: string, supabaseUid: string, parentId?: number, authorName?: string): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(
      `${this.api}/posts/${postId}/comments?supabaseUid=${supabaseUid}`,
      { content, parentCommentId: parentId, authorName: authorName }
    );
  }

  deleteComment(commentId: number, supabaseUid: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/comments/${commentId}?supabaseUid=${supabaseUid}`);
  }

  // ── RESHARES ───────────────────────────────────────────
  resharePost(postId: number, content: string, supabaseUid: string): Observable<PostDTO> {
    return this.http.post<PostDTO>(
      `${this.api}/posts/${postId}/reshare?supabaseUid=${supabaseUid}`,
      { content }
    );
  }

  // ── MEDIA UPLOAD ───────────────────────────────────────
  uploadMedia(file: File, supabaseUid: string): Observable<PostMediaDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('supabaseUid', supabaseUid);
    return this.http.post<PostMediaDTO>(`${this.api}/upload`, formData);
  }
}
