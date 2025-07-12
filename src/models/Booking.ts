import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  _id: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: Date;
  check_out_date: Date;
  number_of_guests: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  deposit_amount?: number;
  deposit_paid?: boolean;
  balance_amount?: number;
  payment_status?: 'pending_deposit' | 'deposit_paid' | 'fully_paid';
  created_at: Date;
  updated_at: Date;
}

const BookingSchema = new Schema<IBooking>({
  room_id: {
    type: String,
    required: true,
    ref: 'Room'
  },
  guest_name: {
    type: String,
    required: true,
    trim: true
  },
  guest_email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  guest_phone: {
    type: String,
    required: true,
    trim: true
  },
  check_in_date: {
    type: Date,
    required: true
  },
  check_out_date: {
    type: Date,
    required: true
  },
  number_of_guests: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  special_requests: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  deposit_amount: {
    type: Number,
    min: 0
  },
  deposit_paid: {
    type: Boolean,
    default: false
  },
  balance_amount: {
    type: Number,
    min: 0
  },
  payment_status: {
    type: String,
    enum: ['pending_deposit', 'deposit_paid', 'fully_paid'],
    default: 'pending_deposit'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
BookingSchema.index({ room_id: 1 });
BookingSchema.index({ guest_email: 1 });
BookingSchema.index({ check_in_date: 1, check_out_date: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ payment_status: 1 });

// Validation: check_out_date must be after check_in_date
BookingSchema.pre('save', function(next) {
  if (this.check_out_date <= this.check_in_date) {
    next(new Error('Check-out date must be after check-in date'));
  } else {
    next();
  }
});

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);