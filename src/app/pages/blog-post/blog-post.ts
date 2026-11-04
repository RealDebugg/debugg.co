import { HttpClient } from '@angular/common/http';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ContainerWithDots } from '../../components/container-with-dots/container-with-dots';
import { DotMatrixLoader } from '../../components/dot-matrix-loader/dot-matrix-loader';

interface BlogPostData {
  id: number;
  date: string;
  author: string;
  title: string;
  description: string;
  content: string;
  coverPhotoBlob: string | null;
  tags: { id: number; name: string }[];
}

interface BlogPostResponse {
  res: BlogPostData | null;
}

type BlogPostState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error' }
  | { status: 'loaded'; post: BlogPostData };

@Component({
  selector: 'app-blog-post',
  imports: [AsyncPipe, DatePipe, RouterLink, ContainerWithDots, DotMatrixLoader],
  templateUrl: './blog-post.html',
})
export class BlogPost {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly postState = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => {
      if (!id) {
        return of<BlogPostState>({ status: 'not-found' });
      }

      return this.http
        .get<BlogPostResponse>(
          `/api/public/posts/post?id=${encodeURIComponent(id)}`,
        )
        .pipe(
          map(({ res }): BlogPostState =>
            res ? { status: 'loaded', post: res } : { status: 'not-found' },
          ),
          startWith<BlogPostState>({ status: 'loading' }),
          catchError(() => of<BlogPostState>({ status: 'error' })),
        );
    }),
  );
}
