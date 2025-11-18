import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyTickets } from '../../services/ticketService';
import TicketBookingForm from '../../components/TicketBookingForm';
import MyTickets from '../../components/MyTickets';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    activeTickets: 0,
    completedTickets: 0,
    totalTickets: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getMyTickets();
      const tickets = response.data.tickets;
      
      setStats({
        activeTickets: tickets.filter(t => ['Pending', 'Processing'].includes(t.status)).length,
        completedTickets: tickets.filter(t => t.status === 'Completed').length,
        totalTickets: tickets.length
      });
      
      setRecentTickets(tickets.slice(0, 3));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketBooked = () => {
    fetchStats();
    setActiveTab('tickets');
  };

  const statCards = [
    { title: 'Active Tickets', value: stats.activeTickets, color: 'bg-yellow-500' },
    { title: 'Completed', value: stats.completedTickets, color: 'bg-green-500' },
    { title: 'Total Tickets', value: stats.totalTickets, color: 'bg-blue-500' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
              </div>
            </div>
            <Link
              to="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'book', label: 'Book Ticket' },
              { id: 'tickets', label: 'My Tickets' },
              { id: 'generatePIT', label: 'Generate PIT' }
               
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action */}
            <div className="bg-orange-500 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready to Book?</h3>
                  <p className="opacity-90">Book your next queue ticket and save time</p>
                </div>
                <button 
                  onClick={() => setActiveTab('book')}
                  className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Recent Tickets */}
            {recentTickets.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Tickets</h3>
                  <button 
                    onClick={() => setActiveTab('tickets')}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <div key={ticket._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{ticket.ticketNumber}</p>
                        <p className="text-sm text-gray-600">{ticket.organization} - {ticket.serviceType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Book Ticket Tab */}
        {activeTab === 'book' && (
          <TicketBookingForm onTicketBooked={handleTicketBooked} />
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <MyTickets />
        )}
        {/* Generate PIT Tab */}
      {activeTab === 'generatePIT' && (
      <div className="bg-white p-6 rounded-lg shadow">
       <h2 className="text-2xl font-bold mb-4">Generate PIT</h2>
    <Link
      to="/customer/generate-pit"
      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
    >
      Open PIT Generator
    </Link>
  </div>
)}

      </div>
    </div>
  );
};

export default CustomerDashboard;
