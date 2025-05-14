
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_DROPBOX_CLIENT_ID?: string;
      VITE_DROPBOX_CLIENT_SECRET?: string;
      VITE_DROPBOX_REFRESH_TOKEN?: string;
      VITE_CLOUDINARY_CLOUD_NAME?: string;
      VITE_CLOUDINARY_API_KEY?: string;
      VITE_CLOUDINARY_API_SECRET?: string;
      VITE_CLOUDINARY_UPLOAD_PRESET?: string;
    }
  }
}

export {};
