import { makeAutoObservable, runInAction } from 'mobx';
import type { Transcript } from './transcriptStore';

class UserStore {
  transcripts: Transcript[] = [];
  loading: boolean = false;
  error: string | null = null;
  searchQuery: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  async loadTranscripts() {
    this.loading = true;
    this.error = null;
    try {
      // Replace with real API call
      const response = await fetch('/api/transcripts');
      if (!response.ok) throw new Error('Failed to load transcripts');
      const data = await response.json();
      runInAction(() => {
        this.transcripts = data;
        this.loading = false;
      });
    } catch (e: unknown) {
      runInAction(() => {
        if (e instanceof Error) {
          this.error = e.message;
        } else {
          this.error = 'Unknown error';
        }
        this.loading = false;
      });
    }
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  get filteredTranscripts() {
    if (!this.searchQuery) return this.transcripts;
    return this.transcripts.filter((t) =>
      t.blocks.some((b) => b.text.toLowerCase().includes(this.searchQuery.toLowerCase())),
    );
  }
}

export const userStore = new UserStore();
