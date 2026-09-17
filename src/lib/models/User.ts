import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface IViewHistoryItem {
  asin: string;
  title: string;
  image: string;
  price: number;
  category: string;
  timestamp: Date;
}

export interface ISearchHistoryItem {
  query: string;
  category?: string;
  timestamp: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  addresses: IAddress[];
  searchHistory: ISearchHistoryItem[];
  viewHistory: IViewHistoryItem[];
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    addresses: [AddressSchema],
    searchHistory: [
      {
        query: String,
        category: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    viewHistory: [
      {
        asin: String,
        title: String,
        image: String,
        price: Number,
        category: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
