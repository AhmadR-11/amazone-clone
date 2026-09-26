import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailOtp extends Document {
  email: string;
  name: string;
  passwordHash: string;
  otp: string;
  attempts: number;
  lastSentAt: Date;
  createdAt: Date;
}

const EmailOtpSchema: Schema<IEmailOtp> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // MongoDB TTL index: automatically deletes document after 10 minutes (600s)
    },
  },
  { timestamps: false }
);

const EmailOtp: Model<IEmailOtp> =
  mongoose.models.EmailOtp || mongoose.model<IEmailOtp>('EmailOtp', EmailOtpSchema);

export default EmailOtp;
