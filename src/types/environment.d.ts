
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_DROPBOX_CLIENT_ID?: string;
      VITE_DROPBOX_CLIENT_SECRET?: string;
      VITE_DROPBOX_REFRESH_TOKEN?: string;
    }
  }
}

export {};
