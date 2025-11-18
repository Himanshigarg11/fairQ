import React, { useState, useEffect } from 'react';
import { getMyTickets } from '../services/ticketService';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyTickets(filter === 'all' ? null : filter);
      setTickets(response.data.tickets);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 ml-3">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Tickets</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tickets Found</h3>
          <p className="text-gray-600">You haven't booked any tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.ticketNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {ticket.organization} - {ticket.serviceType}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Purpose:</p>
                      <p className="font-medium text-gray-900">{ticket.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Booked:</p>
                      <p className="font-medium text-gray-900">{formatDate(ticket.bookedAt)}</p>
                    </div>
                    {ticket.queuePosition && (
                      <div>
                        <p className="text-sm text-gray-600">Queue Position:</p>
                        <p className="font-medium text-gray-900">#{ticket.queuePosition}</p>
                      </div>
                    )}
                    {ticket.estimatedWaitTime && (
                      <div>
                        <p className="text-sm text-gray-600">Estimated Wait:</p>
                        <p className="font-medium text-gray-900">{ticket.estimatedWaitTime} minutes</p>
                      </div>
                    )}
                  </div>

                  {ticket.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Staff Notes:</p>
                      <p className="font-medium text-gray-900 italic">{ticket.notes}</p>
                    </div>
                  )}
                </div>

                <div className="ml-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  {ticket.priority === 'Emergency' && (
                    <div className="mt-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        EMERGENCY
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
