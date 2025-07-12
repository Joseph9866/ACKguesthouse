import { useState } from 'react';
import { PaymentService, PaymentCreateData } from '../services/paymentService';
import { testMongoConnection } from '../lib/mongodb';
import type { PaymentData, Payment } from '../utils/types';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (paymentData: PaymentData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Test MongoDB connection
      const connectionTest = await testMongoConnection();
      
      if (!connectionTest) {
        console.log('MongoDB not available, simulating payment creation:', paymentData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store payment in localStorage for demo
        const existingPayments = JSON.parse(localStorage.getItem('demo_payments') || '[]');
        const newPayment = {
          id: Date.now().toString(),
          ...paymentData,
          status: 'completed', // Auto-complete for demo
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        existingPayments.push(newPayment);
        localStorage.setItem('demo_payments', JSON.stringify(existingPayments));
        
        console.log('Demo payment stored locally:', newPayment);
        return true;
      }

      // Real MongoDB payment logic
      console.log('Creating payment with MongoDB...');

      const mongoPaymentData: PaymentCreateData = {
        booking_id: paymentData.bookingId,
        amount: paymentData.amount,
        payment_type: paymentData.paymentType,
        payment_method: paymentData.paymentMethod,
        payment_reference: paymentData.paymentReference
      };

      console.log('Creating payment:', mongoPaymentData);

      const payment = await PaymentService.createPayment(mongoPaymentData);

      if (!payment) {
        throw new Error('Failed to create payment');
      }

      console.log('Payment created successfully in MongoDB:', payment._id);
      return true;
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentsByBooking = async (bookingId: string): Promise<Payment[]> => {
    try {
      setLoading(true);
      setError(null);

      // Test MongoDB connection
      const connectionTest = await testMongoConnection();
      
      if (!connectionTest) {
        console.log('Getting demo payments from localStorage...');
        const demoPayments = JSON.parse(localStorage.getItem('demo_payments') || '[]');
        return demoPayments.filter((payment: any) => payment.bookingId === bookingId);
      }

      // Real MongoDB query
      const payments = await PaymentService.getPaymentsByBooking(bookingId);
      
      // Convert MongoDB documents to expected format
      return payments.map(payment => ({
        id: payment._id.toString(),
        booking_id: payment.booking_id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        payment_method: payment.payment_method,
        payment_reference: payment.payment_reference,
        status: payment.status,
        paid_at: payment.paid_at?.toISOString(),
        created_at: payment.created_at.toISOString(),
        updated_at: payment.updated_at.toISOString()
      }));
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: 'completed' | 'failed' | 'refunded'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Test MongoDB connection
      const connectionTest = await testMongoConnection();
      
      if (!connectionTest) {
        console.log('Updating demo payment status...');
        const demoPayments = JSON.parse(localStorage.getItem('demo_payments') || '[]');
        const updatedPayments = demoPayments.map((payment: any) => 
          payment.id === paymentId 
            ? { ...payment, status, paid_at: status === 'completed' ? new Date().toISOString() : payment.paid_at }
            : payment
        );
        localStorage.setItem('demo_payments', JSON.stringify(updatedPayments));
        return true;
      }

      // Real MongoDB update
      const payment = await PaymentService.updatePaymentStatus(paymentId, status);
      return !!payment;
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    getPaymentsByBooking,
    updatePaymentStatus,
    loading,
    error
  };
};