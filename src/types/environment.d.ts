
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DROPBOX_CLIENT_ID?: string;
      DROPBOX_CLIENT_SECRET?: string;
      DROPBOX_REFRESH_TOKEN?: string;
    }
  }
}

export {};
