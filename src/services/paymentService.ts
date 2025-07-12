import { connectToDatabase } from '../lib/mongodb';
import { Payment, IPayment } from '../models/Payment';
import { BookingService } from './bookingService';

export interface PaymentCreateData {
  booking_id: string;
  amount: number;
  payment_type: 'deposit' | 'balance' | 'full';
  payment_method: 'mpesa' | 'cash' | 'cheque' | 'bank_transfer';
  payment_reference?: string;
}

export class PaymentService {
  static async createPayment(paymentData: PaymentCreateData): Promise<IPayment> {
    await connectToDatabase();

    const payment = new Payment({
      ...paymentData,
      status: paymentData.payment_method === 'cash' ? 'pending' : 'completed',
      paid_at: paymentData.payment_method === 'cash' ? undefined : new Date()
    });

    const savedPayment = await payment.save();

    // Update booking payment status
    await this.updateBookingPaymentStatus(paymentData.booking_id);

    return savedPayment;
  }

  static async getPaymentsByBooking(bookingId: string): Promise<IPayment[]> {
    await connectToDatabase();
    return await Payment.find({ booking_id: bookingId }).sort({ created_at: -1 });
  }

  static async updatePaymentStatus(
    paymentId: string,
    status: 'pending' | 'completed' | 'failed' | 'refunded'
  ): Promise<IPayment | null> {
    await connectToDatabase();
    
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.paid_at = new Date();
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    );

    if (payment) {
      // Update booking payment status
      await this.updateBookingPaymentStatus(payment.booking_id);
    }

    return payment;
  }

  static async updateBookingPaymentStatus(bookingId: string): Promise<void> {
    await connectToDatabase();

    // Get booking details
    const booking = await BookingService.getBookingById(bookingId);
    if (!booking) return;

    // Calculate total paid amount
    const payments = await this.getPaymentsByBooking(bookingId);
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const depositRequired = BookingService.calculateDepositAmount(booking.total_amount);

    // Update booking payment status
    if (totalPaid >= booking.total_amount) {
      await BookingService.updatePaymentStatus(bookingId, 'fully_paid', true);
    } else if (totalPaid >= depositRequired) {
      await BookingService.updatePaymentStatus(bookingId, 'deposit_paid', true);
    } else {
      await BookingService.updatePaymentStatus(bookingId, 'pending_deposit', false);
    }
  }

  static async getPaymentById(paymentId: string): Promise<IPayment | null> {
    await connectToDatabase();
    return await Payment.findById(paymentId);
  }

  static async getAllPayments(): Promise<IPayment[]> {
    await connectToDatabase();
    return await Payment.find({}).sort({ created_at: -1 });
  }
}