import { makeAutoObservable, runInAction } from 'mobx';
import type { Transcript, UploadResponse } from '../types/Transcript';
import {
  getAllTranscripts,
  getTranscriptById,
  updateTranscript,
  getTranscriptSummary,
  downloadTranscript,
  uploadAudioFile,
} from '../services/api';

class TranscriptStore {
  transcript: Transcript | null = null;
  transcripts: Transcript[] = [];
  loading: boolean = false;
  error: string | null = null;
  summaryLoading: boolean = false;
  summary: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadAll() {
    this.loading = true;
    this.error = null;
    try {
      const data = await getAllTranscripts();
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

  async loadById(id: string) {
    this.loading = true;
    this.error = null;
    try {
      const data = await getTranscriptById(id);
      runInAction(() => {
        this.transcript = data;
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

  editText(newText: string) {
    if (!this.transcript) return;
    this.transcript.text = newText;
  }

  editSpeakers(newSpeakers: string[]) {
    if (!this.transcript) return;
    this.transcript.speakers = newSpeakers;
  }

  async save() {
    if (!this.transcript) return;
    const updatedTranscript = await updateTranscript(this.transcript.id, {
      text: this.transcript.text,
      speakers: this.transcript.speakers,
    });
    runInAction(() => {
      this.transcript = updatedTranscript;
    });
  }

  async fetchSummary() {
    if (!this.transcript) return;
    this.summaryLoading = true;
    this.error = null;
    try {
      const data = await getTranscriptSummary(this.transcript.id);
      runInAction(() => {
        this.summary = data.summary;
        this.summaryLoading = false;
      });
    } catch (e: unknown) {
      runInAction(() => {
        if (e instanceof Error) {
          this.error = e.message;
        } else {
          this.error = 'Unknown error';
        }
        this.summaryLoading = false;
      });
    }
  }

  async downloadTranscriptFile(format: 'txt' | 'pdf'): Promise<Blob> {
    if (!this.transcript) throw new Error('No transcript loaded');
    return await downloadTranscript(this.transcript.id, format);
  }

  async uploadAudioFile(file: File): Promise<UploadResponse> {
    return await uploadAudioFile(file);
  }
}

export const transcriptStore = new TranscriptStore();
