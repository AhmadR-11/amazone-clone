import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IViewHistoryItem {
  asin: string;
  title: string;
  imageUrl: string;
  price: number;
  category: string;
  viewedAt: Date;
}

export interface ISearchHistoryItem {
  query: string;
  category?: string;
  searchedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatar?: string;
  addresses: IAddress[];
  searchHistory: ISearchHistoryItem[];
  viewHistory: IViewHistoryItem[];
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'US' },
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
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    addresses: [AddressSchema],
    searchHistory: [
      {
        query: String,
        category: String,
        searchedAt: { type: Date, default: Date.now },
      },
    ],
    viewHistory: [
      {
        asin: String,
        title: String,
        imageUrl: String,
        price: Number,
        category: String,
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
