// src/types/env.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    SERVER_PORT: number
    CORS_ORIGIN: string
    JWT_SECRET: string
    COOKIE_SECRET: string
    R2_ENDPOINT: string
    R2_PUBLIC_URL: string
    R2_BUCKET_NAME: string
    R2_ACCESS_KEY_ID: string
    R2_SECRET_ACCESS_KEY: string
    AUTH_REDIRECT_URL: string
  }
}
