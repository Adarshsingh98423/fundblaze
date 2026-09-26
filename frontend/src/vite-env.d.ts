/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_RAZORPAY_KEY_ID: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_ENABLE_MSW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
