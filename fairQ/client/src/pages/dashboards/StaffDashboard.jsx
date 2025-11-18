import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAllTickets,
  updateTicketStatus,
} from "../../services/ticketService";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [success, setSuccess] = useState(""); // Add success message state

  const fetchTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTickets({ status: filter });
      setTickets(response.data.tickets);
      setError(""); // Clear any previous errors
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [filter, fetchTickets]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleStatusUpdate = async (ticketId, newStatus, notes = "") => {
    try {
      setUpdating(ticketId);
      setError("");

      // Find the current ticket to get its info for success message
      const currentTicket = tickets.find((t) => t._id === ticketId);

      await updateTicketStatus(ticketId, newStatus, notes);

      // Set success message
      const statusText =
        newStatus === "Processing" ? "started processing" : "completed";
      setSuccess(
        `Ticket ${currentTicket?.ticketNumber} has been ${statusText} successfully!`
      );

      // Auto-switch filter to show the updated ticket
      if (newStatus === "Processing") {
        setFilter("Processing");
      } else if (newStatus === "Completed") {
        setFilter("Completed");
      }

      // If filter doesn't change, refresh current view
      if (
        (newStatus === "Processing" && filter === "Processing") ||
        (newStatus === "Completed" && filter === "Completed")
      ) {
        fetchTickets();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Emergency":
        return {
          label: "EMERGENCY",
          color: "bg-red-500 text-white animate-pulse",
        };
      case "Elderly":
        return { label: "ELDERLY", color: "bg-purple-500 text-white" };
      case "Disabled":
        return { label: "SPECIAL NEEDS", color: "bg-indigo-500 text-white" };
      default:
        return { label: "NORMAL", color: "bg-gray-500 text-white" };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    pending: tickets.filter((t) => t.status === "Pending").length,
    processing: tickets.filter((t) => t.status === "Processing").length,
    completed: tickets.filter((t) => t.status === "Completed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Staff Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, {user?.firstName}!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/staff/scan-pit"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Scan PIT
              </Link>

              <Link
                to="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-all cursor-pointer ${
              filter === "Pending" ? "ring-2 ring-yellow-500" : ""
            }`}
            onClick={() => setFilter("Pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Pending Tickets
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg"></div>
            </div>
          </div>

          <div
            className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-all cursor-pointer ${
              filter === "Processing" ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setFilter("Processing")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Processing</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.processing}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg"></div>
            </div>
          </div>

          <div
            className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-all cursor-pointer ${
              filter === "Completed" ? "ring-2 ring-green-500" : ""
            }`}
            onClick={() => setFilter("Completed")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Completed Today
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Ticket Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Ticket Management
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Showing {filter} Tickets)
              </span>
            </h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Pending">Pending Tickets</option>
              <option value="Processing">Processing Tickets</option>
              <option value="Completed">Completed Tickets</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 ml-3">
                Loading {filter.toLowerCase()} tickets...
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {filter === "Pending"
                  ? "⏳"
                  : filter === "Processing"
                  ? "🔄"
                  : "✅"}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {filter} Tickets
              </h3>
              <p className="text-gray-600">
                {filter === "Pending"
                  ? "No tickets waiting to be processed."
                  : filter === "Processing"
                  ? "No tickets currently being processed."
                  : "No tickets completed yet today."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    {/* Ticket Header */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ticket.ticketNumber}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            getPriorityBadge(ticket.priority).color
                          }`}
                        >
                          {getPriorityBadge(ticket.priority).label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {ticket.organization} - {ticket.serviceType}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {/* Customer & Ticket Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Customer
                      </p>
                      <p className="font-medium text-gray-900">
                        {ticket.customer.firstName} {ticket.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ticket.customer.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Purpose
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {ticket.purpose}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Booked
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(ticket.bookedAt)}
                      </p>
                    </div>
                    {ticket.queuePosition && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Queue Position
                        </p>
                        <p className="font-medium text-gray-900">
                          #{ticket.queuePosition}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Staff Notes */}
                  {ticket.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Staff Notes
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {ticket.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {ticket.status === "Pending" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(ticket._id, "Processing")
                        }
                        disabled={updating === ticket._id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === ticket._id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                            <span>Starting...</span>
                          </div>
                        ) : (
                          "Start Processing"
                        )}
                      </button>
                    )}

                    {ticket.status === "Processing" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(ticket._id, "Completed")
                        }
                        disabled={updating === ticket._id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === ticket._id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                            <span>Completing...</span>
                          </div>
                        ) : (
                          "Mark Complete"
                        )}
                      </button>
                    )}

                    {ticket.status === "Completed" && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xs">✓</span>
                        </div>
                        <span className="text-sm font-medium">Completed</span>
                        {ticket.completedAt && (
                          <span className="text-sm text-gray-500">
                            on {formatDate(ticket.completedAt)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timeline for completed tickets */}
                  {ticket.status === "Completed" &&
                    (ticket.processedAt || ticket.completedAt) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          Timeline
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span>Booked: {formatDate(ticket.bookedAt)}</span>
                          {ticket.processedAt && (
                            <span>
                              Started: {formatDate(ticket.processedAt)}
                            </span>
                          )}
                          {ticket.completedAt && (
                            <span>
                              Completed: {formatDate(ticket.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        {tickets.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {tickets.length} {filter.toLowerCase()} tickets
              </span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="mt-8 flex items-center space-x-4">
          <button
            onClick={() => setFilter("Pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "Pending"
                ? "bg-yellow-500 text-white"
                : "bg-white text-yellow-600 border border-yellow-500 hover:bg-yellow-50"
            }`}
          >
            View Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter("Processing")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "Processing"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-600 border border-blue-500 hover:bg-blue-50"
            }`}
          >
            View Processing ({stats.processing})
          </button>
          <button
            onClick={() => setFilter("Completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "Completed"
                ? "bg-green-500 text-white"
                : "bg-white text-green-600 border border-green-500 hover:bg-green-50"
            }`}
          >
            View Completed ({stats.completed})
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;