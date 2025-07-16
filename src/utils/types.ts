export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  amenities: string[];
  capacity: number;
  available: boolean;
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  specialRequests?: string;
}

export interface DemoBooking extends BookingData {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface PaymentData {
  bookingId: string;
  amount: number;
  paymentType: 'deposit' | 'balance' | 'full';
  paymentMethod: 'mpesa' | 'cash' | 'cheque' | 'bank_transfer';
  paymentReference?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_type: 'deposit' | 'balance' | 'full';
  payment_method: 'mpesa' | 'cash' | 'cheque' | 'bank_transfer';
  payment_reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// MongoDB specific types
export interface MongoRoom {
  _id: string;
  name: string;
  description: string;
  price: number;
  bed_only: number;
  bb: number;
  half_board: number;
  full_board: number;
  capacity: number;
  amenities: string[];
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MongoBooking {
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

export interface MongoPayment {
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

// Statistics types
export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface PaymentStats {
  totalRevenue: number;
  totalDeposits: number;
  totalBalance: number;
  completedPayments: number;
  pendingPayments: number;
}