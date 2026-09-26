import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  asin: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema: Schema<ICart> = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: [
      {
        asin: { type: String, required: true },
        title: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        color: String,
        size: String,
      },
    ],
  },
  { timestamps: true }
);

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
