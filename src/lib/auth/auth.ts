import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.DATABASE_URI!);
const db = client.db();

// Per-request URL capture: keyed by email, resolved by the sendMagicLink callback.
const pendingCaptures = new Map<string, (url: string) => void>();

export function registerMagicLinkCapture(email: string): Promise<string> {
  return new Promise<string>((resolve) => {
    pendingCaptures.set(email, resolve);
  });
}

const productionUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
const productionHost = productionUrl.replace(/^https?:\/\//, "");

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [productionHost, "*.vercel.app", "localhost:3000"],
    fallback: productionUrl,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  plugins: [
    magicLink({
      expiresIn: 60 * 60 * 24, // 24 hours
      allowedAttempts: 1, // single-use
      sendMagicLink: async ({ email, url }) => {
        const resolve = pendingCaptures.get(email);
        if (resolve) {
          pendingCaptures.delete(email);
          resolve(url);
        }
      },
    }),
  ],
});
