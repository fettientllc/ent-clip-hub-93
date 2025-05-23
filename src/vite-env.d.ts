
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DROPBOX_CLIENT_ID: string;
  readonly VITE_DROPBOX_CLIENT_SECRET: string;
  readonly VITE_DROPBOX_REFRESH_TOKEN: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_API_KEY: string;
  readonly VITE_CLOUDINARY_API_SECRET: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
