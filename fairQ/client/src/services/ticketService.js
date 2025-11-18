import api from '../api/api';

export const bookTicket = async (ticketData) => {
  try {
    const response = await api.post('/tickets/book', ticketData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to book ticket');
  }
};

export const getMyTickets = async (status) => {
  try {
    const url = status ? `/tickets/my-tickets?status=${status}` : '/tickets/my-tickets';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get tickets');
  }
};

export const getAllTickets = async (filters) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.organization) params.append('organization', filters.organization);
    
    const response = await api.get(`/tickets?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get tickets');
  }
};

export const updateTicketStatus = async (ticketId, status, notes) => {
  try {
    const response = await api.put(`/tickets/${ticketId}/status`, { status, notes });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update ticket status');
  }
};

export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get ticket');
  }
};

export const getTicketStats = async () => {
  try {
    const response = await api.get('/tickets/admin/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get ticket statistics');
  }
};
