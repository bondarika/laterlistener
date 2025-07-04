import { authStore } from './authStore';
import { transcriptStore } from './transcriptStore';
import { userStore } from './userStore';

export class RootStore {
  authStore = authStore;
  transcriptStore = transcriptStore;
  userStore = userStore;
}

export const rootStore = new RootStore();
