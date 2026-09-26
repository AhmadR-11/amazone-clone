import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().trim().length(6, 'Verification code must be 6 digits'),
});

export const ResendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ForgotPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().trim().length(6, 'Verification code must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

// ─── Address ──────────────────────────────────────────────────────────────
export const AddressSchema = z.object({
  fullName: z.string().min(2).max(100),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  country: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  isDefault: z.boolean().optional(),
});

// ─── Cart ─────────────────────────────────────────────────────────────────
export const CartItemSchema = z.object({
  asin: z.string().min(1, 'ASIN is required'),
  title: z.string().min(1),
  image: z.string().url(),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(99),
  color: z.string().optional(),
  size: z.string().optional(),
});

export const UpdateCartItemSchema = z.object({
  asin: z.string().min(1),
  quantity: z.number().int().min(0).max(99), // 0 = remove
  color: z.string().optional(),
  size: z.string().optional(),
});

// ─── Order ────────────────────────────────────────────────────────────────
export const PlaceOrderSchema = z.object({
  shippingAddress: AddressSchema,
  paymentMethod: z.object({
    type: z.enum(['card', 'cod']),
    last4: z.string().length(4).optional(),
    brand: z.string().optional(),
  }),
});

// ─── User History ─────────────────────────────────────────────────────────
export const ViewHistorySchema = z.object({
  type: z.literal('view'),
  asin: z.string().min(1),
  title: z.string().min(1),
  image: z.string().url(),
  price: z.number().positive(),
  category: z.string().min(1),
});

export const SearchHistorySchema = z.object({
  type: z.literal('search'),
  query: z.string().min(1),
  category: z.string().optional(),
});

export const UserHistorySchema = z.discriminatedUnion('type', [
  ViewHistorySchema,
  SearchHistorySchema,
]);

// ─── Profile Update ───────────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Types ────────────────────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof ResendOtpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type AddressInput = z.infer<typeof AddressSchema>;
export type CartItemInput = z.infer<typeof CartItemSchema>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;
export type UserHistoryInput = z.infer<typeof UserHistorySchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
