import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWishlistItem {
  asin: string;
  title: string;
  imageUrl: string;
  price: number;
  category: string;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  updatedAt: Date;
}

const WishlistSchema: Schema<IWishlist> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        asin: { type: String, required: true },
        title: { type: String, required: true },
        imageUrl: { type: String, default: '' },
        price: { type: Number, default: 0 },
        category: { type: String, default: '' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;
