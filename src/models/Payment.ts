import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  booking_id: string;
  amount: number;
  payment_type: 'deposit' | 'balance' | 'full';
  payment_method: 'mpesa' | 'cash' | 'cheque' | 'bank_transfer';
  payment_reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const PaymentSchema = new Schema<IPayment>({
  booking_id: {
    type: String,
    required: true,
    ref: 'Booking'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_type: {
    type: String,
    enum: ['deposit', 'balance', 'full'],
    required: true
  },
  payment_method: {
    type: String,
    enum: ['mpesa', 'cash', 'cheque', 'bank_transfer'],
    required: true
  },
  payment_reference: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paid_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
PaymentSchema.index({ booking_id: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ payment_type: 1 });
PaymentSchema.index({ payment_method: 1 });

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);