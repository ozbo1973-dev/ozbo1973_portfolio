import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { Resend } from "resend";

const client = new MongoClient(process.env.DATABASE_URI!);
const db = client.db();

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  plugins: [
    magicLink({
      expiresIn: 60 * 60 * 24, // 24 hours
      allowedAttempts: 1, // single-use
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "noreply@" + new URL(process.env.NEXT_PUBLIC_APP_URL!).hostname,
          to: email,
          subject: "Your magic link",
          html: `<p>Click <a href="${url}">here</a> to sign in. This link expires in 24 hours.</p>`,
        });
      },
    }),
  ],
});
