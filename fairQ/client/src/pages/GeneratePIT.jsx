import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function GeneratePIT() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");

  const [ticket, setTicket] = useState(null);
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [checklist, setChecklist] = useState({});
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Load ALL pending tickets
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await api.get("/tickets/my-tickets?status=Pending");

        const all = res.data.data.tickets || [];
        setTickets(all);

        // auto-select first ticket
        if (all.length > 0) {
          handleTicketSelect(all[0]._id);
        }
      } catch (err) {
        console.log(err);
      }
    };
    loadTickets();
  }, []);

  // 🔥 When user selects a ticket
  const handleTicketSelect = (id) => {
    setSelectedTicketId(id);

    const t = tickets.find((x) => x._id === id);
    setTicket(t);

    // load required docs
    setRequiredDocs(t.requiredDocuments || []);

    // load already uploaded docs
    const uploaded = {};
    t.documents.forEach((doc) => {
      uploaded[doc.fileName] = true;
    });
    setUploadedDocs(uploaded);

    // reset checklist
    setChecklist({});
  };

  // 🔥 File upload
  const handleFileUpload = async (e, docName) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);            // IMPORTANT FIX
    form.append("documentName", docName); // Send docName too

    try {
      await api.post(`/documents/upload/${ticket._id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadedDocs((prev) => ({
        ...prev,
        [docName]: true,
      }));
    } catch (err) {
      console.log("Upload Error:", err);
      alert("Failed to upload");
    }
  };

  // 🔥 Toggle checklist item
  const toggleCheckbox = (doc) => {
    setChecklist((prev) => ({
      ...prev,
      [doc]: !prev[doc],
    }));
  };

  // 🔥 Generate PIT
  const generatePIT = async () => {
    setLoading(true);
    try {
      const docsChecklist = Object.keys(checklist).filter(
        (doc) => checklist[doc]
      );

      const res = await api.post("/pit/generate", {
        ticketId: ticket._id,
        checklist: docsChecklist,
      });

      setQrCode(res.data.qrCode);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const allUploaded = requiredDocs.every((doc) => uploadedDocs[doc]);
  const allChecked = requiredDocs.every((doc) => checklist[doc]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Generate PIT (Pre-Identification Token)
      </h2>

      {/* 🔥 Ticket Selector */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Select Ticket</label>
        <select
          value={selectedTicketId}
          onChange={(e) => handleTicketSelect(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
        >
          <option value="">-- Select a Ticket --</option>

          {tickets.map((t) => (
            <option key={t._id} value={t._id}>
              {t.ticketNumber} — {t.organization}
            </option>
          ))}
        </select>
      </div>

      {!ticket ? (
        <p className="text-gray-600">No pending ticket found.</p>
      ) : (
        <>
          {/* Ticket Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Ticket Details</h3>
            <p>
              <b>Ticket:</b> {ticket.ticketNumber}
            </p>
            <p>
              <b>Organization:</b> {ticket.organization}
            </p>
            <p>
              <b>Service:</b> {ticket.serviceType}
            </p>
          </div>

          {/* Required Documents */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3">Required Documents</h3>

            {requiredDocs.map((docName) => (
              <div
                key={docName}
                className="flex items-center justify-between bg-gray-100 p-3 mb-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checklist[docName] || false}
                    onChange={() => toggleCheckbox(docName)}
                    className="w-5 h-5"
                    disabled={!uploadedDocs[docName]}
                  />
                  <span className="font-medium">{docName}</span>
                </div>

                <div>
                  {!uploadedDocs[docName] ? (
                    <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, docName)}
                      />
                    </label>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      Uploaded ✔
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePIT}
            disabled={!allUploaded || !allChecked || loading}
            className={`w-full py-3 text-lg font-semibold rounded-lg transition ${
              allUploaded && allChecked
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            {loading ? "Generating PIT..." : "Generate PIT Token"}
          </button>

          {/* QR Code */}
          {qrCode && (
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold mb-3">Your PIT QR Code</h3>
              <img src={qrCode} alt="PIT QR" className="h-56 mx-auto" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
