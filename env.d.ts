declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_APP_URL: string;
    readonly DATABASE_URI: string;
    readonly RESEND_API_KEY: string;
    readonly NOTIFICATION_EMAIL: string;
  }
}
