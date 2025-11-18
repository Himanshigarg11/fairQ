import React, { useState } from 'react';
import { bookTicket } from '../services/ticketService';

const TicketBookingForm = ({ onTicketBooked }) => {
  const [formData, setFormData] = useState({
    organization: '',
    serviceType: '',
    purpose: '',
    priority: 'Normal',
    isEmergency: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const organizations = [
    { value: 'Hospital', label: 'Hospital', services: ['General Checkup', 'Emergency', 'Specialist Consultation', 'Laboratory Tests', 'Pharmacy'] },
    { value: 'Bank', label: 'Bank', services: ['Account Opening', 'Loan Application', 'Cash Withdrawal/Deposit', 'Investment Consultation', 'Customer Support'] },
    { value: 'Government Office', label: 'Government Office', services: ['License Application', 'Certificate Request', 'Tax Filing', 'Permit Application', 'General Inquiry'] },
    { value: 'Restaurant', label: 'Restaurant', services: ['Dine-in', 'Takeaway Order', 'Catering Booking', 'Event Booking'] },
    { value: 'Airport', label: 'Airport', services: ['Check-in', 'Security Check', 'Immigration', 'Baggage Claim', 'Customer Service'] },
    { value: 'DMV', label: 'DMV', services: ['License Renewal', 'Vehicle Registration', 'Road Test', 'ID Card', 'Address Change'] },
    { value: 'Post Office', label: 'Post Office', services: ['Mail Delivery', 'Package Pickup', 'Money Order', 'Passport Application', 'P.O. Box Service'] },
    { value: 'Telecom Office', label: 'Telecom Office', services: ['New Connection', 'Bill Payment', 'Technical Support', 'Plan Change', 'Device Repair'] }
  ];

  const currentOrg = organizations.find(org => org.value === formData.organization);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (name === 'organization') {
      setFormData(prev => ({ ...prev, organization: value, serviceType: '' }));
    }
    
    if (name === 'isEmergency') {
      setFormData(prev => ({ 
        ...prev, 
        isEmergency: checked, 
        priority: checked ? 'Emergency' : 'Normal' 
      }));
    }

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await bookTicket(formData);
      setSuccess(`Ticket booked successfully! Ticket Number: ${response.data.ticket.ticketNumber}`);
      setFormData({
        organization: '',
        serviceType: '',
        purpose: '',
        priority: 'Normal',
        isEmergency: false
      });
      
      if (onTicketBooked) {
        onTicketBooked(response.data.ticket);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Queue Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Selection */}
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
            Select Organization *
          </label>
          <select
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Choose an organization...</option>
            {organizations.map((org) => (
              <option key={org.value} value={org.value}>
                {org.label}
              </option>
            ))}
          </select>
        </div>

        {/* Service Type Selection */}
        {formData.organization && (
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
              Service Type *
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose a service...</option>
              {currentOrg?.services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Purpose */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
            Purpose/Reason *
          </label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Please describe the purpose of your visit..."
          />
          <p className="mt-1 text-xs text-gray-500">{formData.purpose.length}/500 characters</p>
        </div>

        {/* Emergency Priority */}
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <input
            type="checkbox"
            id="isEmergency"
            name="isEmergency"
            checked={formData.isEmergency}
            onChange={handleChange}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <div className="flex-1">
            <label htmlFor="isEmergency" className="text-sm font-medium text-red-800">
              This is an Emergency
            </label>
            <p className="text-xs text-red-600">Emergency cases will be prioritized in the queue</p>
          </div>
        </div>

        {/* Priority Selection (if not emergency) */}
        {!formData.isEmergency && (
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Normal">Normal</option>
              <option value="Elderly">Elderly (65+)</option>
              <option value="Disabled">Disabled/Special Needs</option>
            </select>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Booking Ticket...' : 'Book Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketBookingForm;
