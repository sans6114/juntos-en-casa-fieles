import nodemailer from "nodemailer"

const globalForNodemailer = globalThis as unknown as { transporter?: nodemailer.Transporter }

export const transporter = globalForNodemailer.transporter ?? nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

if (process.env.NODE_ENV !== "production") globalForNodemailer.transporter = transporter
