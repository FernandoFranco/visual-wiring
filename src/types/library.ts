import type { Component } from './component';
import type { LibrarySourceType } from './librarySource';

export interface Library {
  id: string;
  name: string;
  components: Component[];
  sourceType?: LibrarySourceType;
  sourceUrl?: string;
}
