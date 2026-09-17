import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  category: string;
  subcategory?: string;
  pricePKR: number;
  originalPricePKR?: number;
  priceUSD?: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  isChoice?: boolean;
  sustainabilityFeature?: string;
  boughtInPastMonth?: string;
  inStock: boolean;
  image: string;
  thumbnails: string[];
  colors?: { name: string; code: string; image: string; pricePKR: number }[];
  sizes?: string[];
  details?: { [key: string]: string };
  aboutBulletPoints?: string[];
  seller?: string;
  shipsFrom?: string;
  description: string;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    pricePKR: { type: Number, required: true },
    originalPricePKR: { type: Number },
    priceUSD: { type: Number },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 100 },
    badge: { type: String },
    isChoice: { type: Boolean, default: false },
    sustainabilityFeature: { type: String },
    boughtInPastMonth: { type: String },
    inStock: { type: Boolean, default: true },
    image: { type: String, required: true },
    thumbnails: [{ type: String }],
    colors: [
      {
        name: String,
        code: String,
        image: String,
        pricePKR: Number,
      },
    ],
    sizes: [{ type: String }],
    details: { type: Map, of: String },
    aboutBulletPoints: [{ type: String }],
    seller: { type: String, default: 'Amazon Direct' },
    shipsFrom: { type: String, default: 'Amazon' },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
