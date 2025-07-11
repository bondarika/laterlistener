import { authStore } from './authStore';
import { transcriptStore } from './transcriptStore';

export class RootStore {
  authStore = authStore;
  transcriptStore = transcriptStore;
}

export const rootStore = new RootStore();
