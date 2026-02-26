import type { Component } from './component';

export interface Library {
  id: string;
  name: string;
  components: Component[];
}
