import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  asin: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface IStatusHistory {
  status: string;
  updatedAt: Date;
  note?: string;
}

export interface IPricing {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export type OrderStatus =
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId | string;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: {
    type: 'card' | 'cod';
    last4?: string;
    brand?: string;
  };
  pricing: IPricing;
  couponCode?: string;
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  estimatedDelivery: Date;
  placedAt: Date;
  updatedAt: Date;
  // Legacy compat fields
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  image?: string;
}

function generateOrderNumber(): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `AMZ-${new Date().getFullYear()}-${num}`;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    orderNumber: { type: String, default: generateOrderNumber, unique: true },
    items: [
      {
        asin: { type: String, required: true },
        title: { type: String, required: true },
        imageUrl: { type: String, default: '' },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'US' },
      phone: String,
    },
    paymentMethod: {
      type: { type: String, enum: ['card', 'cod'], required: true },
      last4: String,
      brand: String,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    couponCode: String,
    status: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    placedAt: { type: Date, default: Date.now },
    // Legacy compat
    subtotal: Number,
    shippingCost: Number,
    total: Number,
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
