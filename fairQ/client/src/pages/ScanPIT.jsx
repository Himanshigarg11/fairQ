import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../api/api";

export default function ScanPIT() {
  const scannerRef = useRef(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [error, setError] = useState("");

  const validatePIT = async (token) => {
    try {
      const res = await api.post("/pit/validate", { token });

      if (res.data.valid) {
        setTicketInfo(res.data.ticket);
        setError("");
        console.log("UPDATED TICKET:", res.data.ticket);
      } else {
        setTicketInfo(null);
        setError(res.data.error);
      }
    } catch (err) {
      setTicketInfo(null);
      setError(err.response?.data?.error || "Error validating QR");
    }
  };

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "pit-scanner",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        validatePIT(decodedText);
        scanner.clear(); // Stop scanner after successful scan
      },
      () => console.log("Scanning...")
    );

    return () => scanner.clear().catch(() => {});
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Scan PIT QR</h1>

      <div id="pit-scanner" ref={scannerRef}></div>

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {ticketInfo && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="font-bold text-lg text-green-700">PIT Verified ✔</h2>
          <p><strong>Ticket ID:</strong> {ticketInfo._id}</p>
          <p><strong>Ticket Number:</strong> {ticketInfo.ticketNumber}</p>

          <p>
            <strong>Status:</strong>
            <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded">
              {ticketInfo.status}
            </span>
          </p>

          <p><strong>Organization:</strong> {ticketInfo.organization}</p>
          <p><strong>Service:</strong> {ticketInfo.serviceType}</p>
          <p><strong>Customer:</strong> {ticketInfo.customer.firstName}</p>

          <div className="mt-3 bg-green-200 text-green-800 p-2 rounded">
            Ticket Status Updated Successfully!
          </div>
        </div>
      )}
    </div>
  );
}