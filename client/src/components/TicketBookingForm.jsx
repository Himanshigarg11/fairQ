import React, { useState } from "react";
import { bookTicket } from "../services/ticketService";
import { TicketIcon, AlertTriangle, Loader2 } from "lucide-react";

const HOSPITALS = [
    "AIIMS Delhi",
  "Fortis Hospital",
  "Apollo Hospital",
  "Max Healthcare"
];



const TicketBookingForm = ({ onTicketBooked }) => {
  const [formData, setFormData] = useState({
  organization: "",
  hospitalName: "",
  serviceType: "",
  purpose: "",
  priority: "Normal",
  isEmergency: false,
});


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const organizations = [
    {
      value: "Hospital",
      label: "Hospital",
      services: [
        "General Checkup",
        "Emergency",
        "Specialist Consultation",
        "Laboratory Tests",
        "Pharmacy",
      ],
    },
    {
      value: "Bank",
      label: "Bank",
      services: [
        "Account Opening",
        "Loan Application",
        "Cash Withdrawal/Deposit",
        "Investment Consultation",
        "Customer Support",
      ],
    },
    {
      value: "Government Office",
      label: "Government Office",
      services: [
        "License Application",
        "Certificate Request",
        "Tax Filing",
        "Permit Application",
        "General Inquiry",
      ],
    },
    {
      value: "Restaurant",
      label: "Restaurant",
      services: [
        "Dine-in",
        "Takeaway Order",
        "Catering Booking",
        "Event Booking",
      ],
    },
    {
      value: "Airport",
      label: "Airport",
      services: [
        "Check-in",
        "Security Check",
        "Immigration",
        "Baggage Claim",
        "Customer Service",
      ],
    },
    {
      value: "DMV",
      label: "DMV",
      services: [
        "License Renewal",
        "Vehicle Registration",
        "Road Test",
        "ID Card",
        "Address Change",
      ],
    },
    {
      value: "Post Office",
      label: "Post Office",
      services: [
        "Mail Delivery",
        "Package Pickup",
        "Money Order",
        "Passport Application",
        "P.O. Box Service",
      ],
    },
    {
      value: "Telecom Office",
      label: "Telecom Office",
      services: [
        "New Connection",
        "Bill Payment",
        "Technical Support",
        "Plan Change",
        "Device Repair",
      ],
    },
  ];

  const currentOrg = organizations.find(
    (org) => org.value === formData.organization
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      let updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "organization") {
  updated = {
    ...updated,
    organization: value,
    serviceType: "",
    hospitalName: value === "Hospital" ? updated.hospitalName : "",
  };
}


      if (name === "isEmergency") {
        updated = {
          ...updated,
          isEmergency: checked,
          priority: checked ? "Emergency" : "Normal",
        };
      }

      return updated;
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await bookTicket(formData);
      setSuccess(
        `Ticket booked successfully! Ticket Number: ${response.data.ticket.ticketNumber}`
      );
      setFormData({
  organization: "",
  hospitalName: "",
  serviceType: "",
  purpose: "",
  priority: "Normal",
  isEmergency: false,
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
    <div className="bg-white/95 rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 flex items-center justify-center text-white shadow-md">
          <TicketIcon size={20} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            Book Queue Ticket
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Choose an organization, select your service, and describe your visit.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Selection */}
        <div>
          <label
            htmlFor="organization"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Select Organization<span className="text-red-500"> *</span>
          </label>
          <select
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Choose an organization...</option>
            {organizations.map((org) => (
              <option key={org.value} value={org.value}>
                {org.label}
              </option>
            ))}
          </select>

        </div>
        {formData.organization === "Hospital" && (  <div>
    <label className="block text-sm font-medium mb-1">
      Select Hospital *
    </label>
    <select
  name="hospitalName"
  value={formData.hospitalName}
  onChange={handleChange}
  className="w-full px-4 py-2 border rounded-lg"
  required
>

      <option value="">Choose Hospital</option>
      {HOSPITALS.map((h) => (
        <option key={h} value={h}>{h}</option>
      ))}
    </select>
  </div>
)}

        {/* Service Type Selection */}
        {formData.organization && (
          <div>
            <label
              htmlFor="serviceType"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Service Type<span className="text-red-500"> *</span>
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="purpose"
              className="block text-sm font-semibold text-slate-700"
            >
              Purpose/Reason<span className="text-red-500"> *</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {formData.purpose.length}/500
            </span>
          </div>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            placeholder="Briefly describe why you are visiting..."
          />
        </div>

        {/* Emergency Priority */}
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
          <input
            type="checkbox"
            id="isEmergency"
            name="isEmergency"
            checked={formData.isEmergency}
            onChange={handleChange}
            className="mt-1 w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
          />
          <div className="flex-1">
            <label
              htmlFor="isEmergency"
              className="text-sm font-semibold text-red-800 flex items-center gap-1"
            >
              <AlertTriangle size={14} />
              This is an Emergency
            </label>
            <p className="text-xs text-red-600 mt-0.5">
              Emergency cases are prioritized in the queue and may be processed
              ahead of others.
            </p>
          </div>
        </div>

        {/* Priority Selection (if not emergency) */}
        {!formData.isEmergency && (
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="Normal">Normal</option>
              <option value="Elderly">Elderly (65+)</option>
              <option value="Disabled">Disabled/Special Needs</option>
            </select>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-medium">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Booking Ticket..." : "Book Ticket"}
        </button>
      </form>
    </div>
  );
};

export default TicketBookingForm;
