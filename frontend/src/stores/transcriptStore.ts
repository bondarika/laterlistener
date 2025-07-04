import { makeAutoObservable, runInAction } from 'mobx';

export interface TranscriptBlock {
  id: string;
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export interface Transcript {
  id: string;
  blocks: TranscriptBlock[];
  summary?: string;
}

class TranscriptStore {
  transcript: Transcript | null = null;
  loading: boolean = false;
  error: string | null = null;
  summaryLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async loadById(id: string) {
    this.loading = true;
    this.error = null;
    try {
      // Replace with real API call
      const response = await fetch(`/api/transcripts/${id}`);
      if (!response.ok) throw new Error('Failed to load transcript');
      const data = await response.json();
      runInAction(() => {
        this.transcript = data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
        this.loading = false;
      });
    }
  }

  editBlock(blockId: string, newText: string) {
    if (!this.transcript) return;
    const block = this.transcript.blocks.find((b) => b.id === blockId);
    if (block) block.text = newText;
  }

  editSpeaker(blockId: string, newSpeaker: string) {
    if (!this.transcript) return;
    const block = this.transcript.blocks.find((b) => b.id === blockId);
    if (block) block.speaker = newSpeaker;
  }

  async save() {
    if (!this.transcript) return;
    // Replace with real API call
    await fetch(`/api/transcripts/${this.transcript.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.transcript),
    });
  }

  async fetchSummary() {
    if (!this.transcript) return;
    this.summaryLoading = true;
    // Replace with real API call
    const response = await fetch(`/api/transcripts/${this.transcript.id}/summary`);
    const data = await response.json();
    runInAction(() => {
      if (this.transcript) this.transcript.summary = data.summary;
      this.summaryLoading = false;
    });
  }
}

export const transcriptStore = new TranscriptStore();
