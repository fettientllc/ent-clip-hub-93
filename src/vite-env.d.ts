
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DROPBOX_CLIENT_ID: string;
  readonly VITE_DROPBOX_CLIENT_SECRET: string;
  readonly VITE_DROPBOX_REFRESH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
