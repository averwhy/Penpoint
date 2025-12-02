import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { privateEnv } from "../env/private";

export const transporter = privateEnv.smtp
    ? nodemailer.createTransport({
          host: privateEnv.smtp.host,
          port: privateEnv.smtp.port,
          auth: {
              user: privateEnv.smtp.username,
              pass: privateEnv.smtp.password,
          },
      })
    : null;

export async function sendEmail({ to, subject, text, html }: Mail.Options) {
    return privateEnv.smtp && transporter
        ? transporter.sendMail({
              from: privateEnv.smtp.from,
              to,
              subject,
              text,
              html,
          })
        : null;
}
