import React from "react";

const MyTickets = ({ tickets }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Tickets Found
        </h3>
        <p className="text-gray-600">No tickets match this filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket._id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {ticket.ticketNumber}
              </h3>
              <p className="text-sm text-gray-600">
                {ticket.organization} — {ticket.serviceType}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                ticket.status
              )}`}
            >
              {ticket.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Purpose</p>
              <p className="font-medium">{ticket.purpose}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Booked At</p>
              <p className="font-medium">{formatDate(ticket.bookedAt)}</p>
            </div>

            {/* ✅ SAFE QUEUE POSITION */}
            <div>
              <p className="text-sm text-gray-600">Queue Position</p>
              <p className="font-medium">
                {ticket.queuePosition !== undefined
                  ? `#${ticket.queuePosition}`
                  : "Not assigned yet"}
              </p>
            </div>
          </div>

          {ticket.priority === "Emergency" && (
            <span className="inline-block mt-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              EMERGENCY
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyTickets;
