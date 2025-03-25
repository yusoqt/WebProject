'use client';

import { useState, useEffect } from 'react';
import { getAllRcps } from '@/services/rcp.service';
import { Booking } from '@/types/booking';
import { FormEvent } from 'react';

interface Provider {
  _id: string;
  name: string;
  address: string;
}

interface NewBooking {
  providerId: string;
  date: string;
}

interface BookingFormProps {
  onSubmit: (booking: NewBooking) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  booking: Booking | null;
}

export default function BookingForm({ onSubmit, onCancel, isSubmitting = false, booking }: BookingFormProps) {
  const [date, setDate] = useState('');
  const [providerId, setProviderId] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await getAllRcps();
        console.log('Providers response:', response); // Debug log

        if (response.success) {
          const providersData = Array.isArray(response.data) 
            ? response.data 
            : response.data?.data || [];
            
          setProviders(providersData);
        } else {
          setError('Failed to load providers');
          console.error('Failed to load providers:', response.error);
        }
      } catch (err) {
        console.error('Error loading providers:', err);
        setError('Error loading providers');
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  useEffect(() => {
    if (booking) {
      console.log('Setting form with booking:', booking);
      setDate(booking.date);
      setProviderId(booking.providerId || booking.rentalCarProvider?._id || '');
    }
  }, [booking]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!date || !providerId) {
      setError('Please select both date and provider');
      return;
    }

    try {
      await onSubmit({ date, providerId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  if (loading) return <div>Loading providers...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block mb-1">Rental Date</label>
        <input 
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Car Rental Provider</label>
        <select
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select a provider</option>
          {providers.map((provider) => (
            <option key={provider._id} value={provider._id}>
              {provider.name} - {provider.address}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Booking...' : 'Book Car'}
        </button>
      </div>
    </form>
  );
}