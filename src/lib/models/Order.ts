import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  asin: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface IShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: {
    type: 'card' | 'cod';
    last4?: string;
    brand?: string;
  };
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal: number;
  shippingCost: number;
  total: number;
  placedAt: Date;
  estimatedDelivery: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        asin: { type: String, required: true },
        title: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        color: String,
        size: String,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: { type: String, enum: ['card', 'cod'], required: true },
      last4: String,
      brand: String,
    },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    placedAt: { type: Date, default: Date.now },
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
