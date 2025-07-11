import { makeAutoObservable, runInAction } from 'mobx';
import type { Transcript, UploadResponse } from '../types/Transcript';
import {
  getAllTranscripts,
  getTranscriptById,
  updateTranscript,
  getTranscriptSummary,
  downloadTranscript,
  uploadAudioFile,
  startTranscribe,
  getTranscribeStatus,
  getTranscribeResult,
} from '../services/api';

class TranscriptStore {
  transcript: Transcript | null = null;
  transcripts: Transcript[] = [];
  loading: boolean = false;
  error: string | null = null;
  summaryLoading: boolean = false;
  summary: string | null = null;

  // Новые поля для работы с транскрибацией
  currentTaskId: string | null = null;
  transcribeStatus: 'idle' | 'processing' | 'completed' | 'error' = 'idle';
  transcribeProgress: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  // Новые методы для работы с транскрибацией
  async startTranscribe(fileUrl: string, fileName: string) {
    this.transcribeStatus = 'processing';
    this.transcribeProgress = 0;
    this.error = null;

    try {
      const response = await startTranscribe(fileUrl, fileName);
      runInAction(() => {
        this.currentTaskId = response.task_id;
        this.transcribeStatus = 'processing';
      });
      return this.currentTaskId;
    } catch (e: unknown) {
      runInAction(() => {
        this.transcribeStatus = 'error';
        if (e instanceof Error) {
          this.error = e.message;
        } else {
          this.error = 'Failed to start transcribe';
        }
      });
      throw e;
    }
  }

  async checkTranscribeStatus(taskId: string) {
    try {
      const response = await getTranscribeStatus(taskId);
      runInAction(() => {
        this.transcribeStatus = response.status || 'processing';
        this.transcribeProgress = response.progress || 0;

        if (response.status === 'completed') {
          this.transcribeStatus = 'completed';
        } else if (response.status === 'error') {
          this.transcribeStatus = 'error';
          this.error = response.error || 'Transcribe failed';
        }
      });
      return response;
    } catch (e: unknown) {
      runInAction(() => {
        this.transcribeStatus = 'error';
        if (e instanceof Error) {
          this.error = e.message;
        } else {
          this.error = 'Failed to check status';
        }
      });
      throw e;
    }
  }

  async getTranscribeResult(taskId: string) {
    try {
      const response = await getTranscribeResult(taskId);
      runInAction(() => {
        // Предполагаем, что результат содержит данные транскрипции
        this.transcript = response;
        this.transcribeStatus = 'completed';
      });
      return response;
    } catch (e: unknown) {
      runInAction(() => {
        this.transcribeStatus = 'error';
        if (e instanceof Error) {
          this.error = e.message;
        } else {
          this.error = 'Failed to get result';
        }
      });
      throw e;
    }
  }

  // Метод для полного цикла транскрибации
  async transcribeAudio(fileUrl: string, fileName: string) {
    try {
      const taskId = await this.startTranscribe(fileUrl, fileName);

      if (!taskId) {
        throw new Error('Failed to get task ID');
      }

      // Периодически проверяем статус
      const checkStatus = async () => {
        if (this.transcribeStatus === 'processing') {
          await this.checkTranscribeStatus(taskId);
          if (this.transcribeStatus === 'processing') {
            setTimeout(checkStatus, 2000); // Проверяем каждые 2 секунды
          }
        }
      };

      checkStatus();

      // Ждем завершения
      while (this.transcribeStatus === 'processing') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (this.transcribeStatus === 'completed') {
        return await this.getTranscribeResult(taskId);
      } else {
        throw new Error(this.error || 'Transcribe failed');
      }
    } catch (e: unknown) {
      runInAction(() => {
        this.transcribeStatus = 'error';
        if (e instanceof Error) {
          this.error = e.message;
        } else {
          this.error = 'Transcribe failed';
        }
      });
      throw e;
    }
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
        const maybeAxiosError = e as { response?: { status?: number }; message?: string };
        if (
          maybeAxiosError.response?.status === 404 ||
          (maybeAxiosError.message &&
            maybeAxiosError.message.includes('Request failed with status code 404'))
        ) {
          this.error = 'Что-то пошло не так';
        } else if (e instanceof Error) {
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
        // Проверяем, есть ли у ошибки поле response и статус 404
        const maybeAxiosError = e as { response?: { status?: number } };
        if (maybeAxiosError.response?.status === 404) {
          this.error = 'Что-то пошло не так';
        } else if (e instanceof Error) {
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
