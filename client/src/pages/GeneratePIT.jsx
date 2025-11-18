import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { generatePIT } from "../services/pitService.js";
import { getMyTickets } from "../services/ticketService";
// Required documents list
const requiredDocs = [
  "Aadhar Card",
  "Appointment Confirmation PDF",
  "Service Request Form",
  "Any supporting documents"
];

export default function GeneratePIT() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [checklist, setChecklist] = useState({
    idProof: false,
    documentsReady: false,
    appointmentConfirmed: false,
  });
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Fetch user tickets on mount
useEffect(() => {
  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await getMyTickets("Pending");

      console.log("RAW response:", res);

      let list = [];

      // Backend format: { success, data: { tickets: [...] } }
      if (Array.isArray(res?.data?.tickets)) {
        list = res.data.tickets;

      // Backend format: { tickets: [...] }
      } else if (Array.isArray(res?.tickets)) {
        list = res.tickets;

      // Backend format: { data: [...] }
      } else if (Array.isArray(res?.data)) {
        list = res.data;

      // Backend returns array directly
      } else if (Array.isArray(res)) {
        list = res;

      } else {
        console.log("❌ No ticket array found in response");
      }

      console.log("FINAL TICKET LIST:", list);

      setTickets(list);
    } catch (err) {
      console.error("Ticket fetch error:", err);
      setMessage("Could not load tickets. Try refreshing.");
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  loadTickets();
}, []);




  const handleChecklistChange = (e) => {
    setChecklist({ ...checklist, [e.target.name]: e.target.checked });
    setMessage("");
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleGeneratePIT = async () => {
    setMessage("");
    setQrCode("");
    if (!selectedTicket) {
      return setMessage("Please select a ticket.");
    }
    if (!allChecked) {
      return setMessage("Please complete all checklist items.");
    }

    try {
      setGenerating(true);
      const res = await generatePIT(selectedTicket, Object.keys(checklist));
      // service returns { data: { qrDataUrl: ... } } or { data: { qrCode: ... } } depending on your service
      const qr = res?.data?.qrDataUrl || res?.data?.qrCode || res?.qrDataUrl || res?.qrCode;
      if (!qr) {
        setMessage("Server returned no QR. Check server logs.");
      } else {
        setQrCode(qr);
        setMessage("PIT Generated Successfully!");
      }
    } catch (err) {
      console.error("PIT generation error:", err);
      const errMsg = err?.response?.data?.error || err.message || "Failed to generate PIT.";
      setMessage(errMsg);
    } finally {
      setGenerating(false);
    }
  };

  const selectedTicketObj = tickets.find((t) => t._id === selectedTicket);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-12">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Generate PIT</h1>

        {/* Ticket selector area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Ticket
          </label>

          {loadingTickets ? (
            <div className="p-4 bg-gray-50 rounded border border-gray-100 flex items-center">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-orange-500 mr-4" />
              <div>Loading your tickets…</div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-4 bg-yellow-50 rounded border border-yellow-100 text-yellow-800">
              No active tickets found. Please book a ticket first.
            </div>
          ) : (
            <select
              value={selectedTicket}
              onChange={(e) => setSelectedTicket(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">-- Select a Ticket --</option>
              {tickets.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.ticketNumber} — {t.serviceType || t.organization}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selected ticket preview */}
        {selectedTicketObj && (
          <div className="mb-6 border border-gray-100 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">{selectedTicketObj.ticketNumber}</div>
                <div className="text-sm text-gray-600">{selectedTicketObj.organization} — {selectedTicketObj.serviceType}</div>
                <div className="mt-2 text-sm">
                  <span className="block"><strong>Purpose:</strong> {selectedTicketObj.purpose}</span>
                  <span className="block"><strong>Position:</strong> #{selectedTicketObj.queuePosition}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${selectedTicketObj.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {selectedTicketObj.status}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checklist */}
      <h2 className="text-lg font-semibold mb-3">Checklist</h2>

{/* REQUIRED DOCUMENTS LIST */}
<div className="mb-5 bg-gray-50 p-4 rounded border">
  <h3 className="text-md font-semibold mb-2">Required Documents</h3>

  <ul className="list-disc pl-6 text-gray-700">
    {requiredDocs.map((doc, index) => (
      <li key={index}>{doc}</li>
    ))}
  </ul>
</div>

{/* CHECKLIST BOXES */}
const requiredDocs = [
  "Aadhar Card",
  "Appointment Confirmation PDF",
  "Service Request Form",
  "Any supporting documents"
];

<div className="space-y-3 mb-5">
  <label className="flex items-center space-x-3">
    <input type="checkbox" name="idProof" checked={checklist.idProof} onChange={handleChecklistChange} />
    <span>I have valid ID proof</span>
  </label>

  <label className="flex items-center space-x-3">
    <input type="checkbox" name="documentsReady" checked={checklist.documentsReady} onChange={handleChecklistChange} />
    <span>I have uploaded all required documents</span>
  </label>

  <label className="flex items-center space-x-3">
    <input type="checkbox" name="appointmentConfirmed" checked={checklist.appointmentConfirmed} onChange={handleChecklistChange} />
    <span>My appointment is confirmed</span>
  </label>
</div>


        {/* Action row */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGeneratePIT}
            disabled={!selectedTicket || !allChecked || generating}
            className={`inline-flex items-center px-4 py-2 rounded text-white ${(!selectedTicket || !allChecked || generating) ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {generating ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Generating…
              </span>
            ) : (
              "Generate PIT"
            )}
          </button>

          <div className="text-sm text-gray-700">{message}</div>
        </div>

        {/* QR */}
        {qrCode && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Your PIT QR Code</h3>
            <div className="p-4 rounded border inline-block bg-white">
              <img src={qrCode} alt="PIT QR" style={{ maxWidth: 320 }} />
            </div>
            <p className="mt-2 text-sm text-gray-500">Show this QR at arrival — valid for 2 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
}
