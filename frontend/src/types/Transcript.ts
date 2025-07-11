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
