import { HttpClient } from '@angular/common/http';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
import { ContainerWithDots } from '../../components/container-with-dots/container-with-dots';

type Tag = {
  id: number;
  name: string;
};

type SortOrder = 'newest' | 'oldest';

interface PostsResponse {
  data: {
    id: number;
    date: string;
    tags: Tag[];
    title: string;
    description: string;
    coverPhotoBlob: string;
  }[];
  count: number | undefined;
}

interface TagsResponse {
  data: Tag[];
}

@Component({
  selector: 'app-blog',
  imports: [AsyncPipe, JsonPipe, ContainerWithDots],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  private readonly http = inject(HttpClient);
  readonly selectedTagIds = signal<ReadonlySet<number>>(new Set());
  readonly sortOrder = signal<SortOrder>('newest');
  postsResponse = combineLatest([
    this.http.get<PostsResponse>('/api/public/posts'),
    toObservable(this.selectedTagIds),
    toObservable(this.sortOrder),
  ]).pipe(
    map(([response, selectedTagIds, sortOrder]) => {
      const data = response.data.filter((post) =>
        selectedTagIds.size === 0 || post.tags.some((tag) => selectedTagIds.has(tag.id)),
      );
      data.sort((a, b) => {
        const difference = Date.parse(a.date) - Date.parse(b.date);
        return sortOrder === 'newest' ? -difference : difference;
      });
      return {
        ...response,
        data,
        count: selectedTagIds.size === 0 ? response.count : data.length,
      };
    }),
  );
  tagsResponse = this.http.get<TagsResponse>('/api/public/tags');

  setTagSelected(tagId: number, checked: boolean): void {
    this.selectedTagIds.update((selectedTagIds) => {
      const next = new Set(selectedTagIds);
      if (checked) {
        next.add(tagId);
      } else {
        next.delete(tagId);
      }
      return next;
    });
  }
}
