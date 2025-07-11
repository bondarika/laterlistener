export interface TranscriptBlock {
  id: string;
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export interface Transcript {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  speakers: string[];
}

export interface TranscriptUpdate {
  text: string;
  speakers: string[];
}

export interface Summary {
  summary: string;
}

export interface UploadResponse {
  transcript_id: string;
  status: string;
  file_url: string;
}

// Интерфейс для ответа /api/transcripts/:id
export interface TranscriptApiResponse {
  id: string;
  telegram_id: number;
  file_name: string;
  file_url: string;
  result_url: string;
  status: string; // например, 'FINISHED'
}

// Интерфейс для расшифрованного JSON (примерная структура)
export interface TranscriptResult {
  // Добавьте реальные поля из JSON-файла, например:
  // text: string;
  // blocks: TranscriptBlock[];
  // speakers: string[];
  // ...
}
