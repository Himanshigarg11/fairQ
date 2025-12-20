import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { TicketIcon, FileText, CheckCircle2, Loader2, QrCode } from "lucide-react";

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

  // Load ALL pending tickets
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await api.get("/tickets/my-tickets?status=Pending");

        const all = res.data.data.tickets || [];
        setTickets(all);

        // Auto-select FIRST ticket safely
        if (all.length > 0) {
          const first = all[0];

          setSelectedTicketId(first._id);
          setTicket(first);
          setRequiredDocs(first.requiredDocuments || []);

          const uploaded = {};
          first.documents.forEach((doc) => {
            uploaded[doc.fileName] = true;
          });
          setUploadedDocs(uploaded);
          setChecklist({});
        }
      } catch (err) {
        console.log(err);
      }
    };
    loadTickets();
  }, []);

  // When user selects a ticket
  const handleTicketSelect = (id) => {
    setSelectedTicketId(id);

    const t = tickets.find((x) => x._id === id);
    if (!t) return;

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
    setQrCode(null);
  };

  // File upload
  const handleFileUpload = async (e, docName) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("documentName", docName);

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

  // Toggle checklist item
  const toggleCheckbox = (doc) => {
    setChecklist((prev) => ({
      ...prev,
      [doc]: !prev[doc],
    }));
  };

  // Generate PIT
  const generatePIT = async () => {
    if (!ticket) return;
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-emerald-50 py-8 px-4">
      <div className="w-full max-w-3xl bg-white/95 shadow-xl rounded-2xl border border-slate-200 p-6 md:p-8 relative overflow-hidden">
        {/* subtle background accent */}
        <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <TicketIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                Generate PIT
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Pre‑Identification Token to speed up verification at{" "}
                <span className="font-semibold text-slate-800">
                  {user?.firstName}
                </span>
                ’s next visit.
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Selector */}
        <div className="mb-6 relative z-10">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Select Pending Ticket
          </label>
          <select
            value={selectedTicketId}
            onChange={(e) => handleTicketSelect(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
          <p className="text-sm text-slate-500 relative z-10">
            No pending ticket found. Book a new ticket from your customer
            dashboard.
          </p>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Ticket Details */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80">
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-sky-600" />
                Ticket Details
              </h3>
              <div className="grid text-xs md:text-sm text-slate-700 gap-1">
                <p>
                  <span className="font-semibold text-slate-800">Ticket:</span>{" "}
                  {ticket.ticketNumber}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    Organization:
                  </span>{" "}
                  {ticket.organization}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Service:</span>{" "}
                  {ticket.serviceType}
                </p>
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <FileText size={16} className="text-amber-600" />
                Required Documents
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Upload all documents and tick the checklist to confirm you will
                carry originals.
              </p>

              {requiredDocs.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No documents required for this ticket.
                </p>
              ) : (
                <div className="space-y-3">
                  {requiredDocs.map((docName) => (
                    <div
                      key={docName}
                      className="flex items-center justify-between bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checklist[docName] || false}
                          onChange={() => toggleCheckbox(docName)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                          disabled={!uploadedDocs[docName]}
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {docName}
                        </span>
                        {!uploadedDocs[docName] && (
                          <span className="text-[11px] text-slate-400">
                            Upload file to enable checklist
                          </span>
                        )}
                      </div>

                      <div>
                        {!uploadedDocs[docName] ? (
                          <label className="cursor-pointer inline-flex items-center gap-1 bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-700 transition-colors">
                            Upload
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, docName)}
                            />
                          </label>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 size={14} />
                            Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePIT}
              disabled={!allUploaded || !allChecked || loading}
              className={`w-full py-3 text-sm md:text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                allUploaded && allChecked && !loading
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-300 text-slate-50 cursor-not-allowed"
              }`}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Generating PIT..." : "Generate PIT Token"}
            </button>

            {/* QR Code */}
            {qrCode && (
              <div className="mt-6 text-center">
                <h3 className="text-sm md:text-lg font-semibold text-slate-900 mb-2 flex items-center justify-center gap-2">
                  <QrCode size={18} className="text-slate-700" />
                  Your PIT QR Code
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Show this code at the counter for faster verification.
                </p>
                <img
                  src={qrCode}
                  alt="PIT QR"
                  className="h-56 mx-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
