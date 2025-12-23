import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAllTickets,
  updateTicketStatus,
} from "../../services/ticketService";
import {
  Clock,
  CheckCircle,
  Loader,
  Users,
  QrCode,
  Filter,
  TicketIcon,
} from "lucide-react";
import { socket } from "../../socket";

/* Priority helpers (unchanged logic) */
const normalizePriority = (priority) => {
  if (!priority) return "Normal";
  if (priority.emergency) return "Emergency";
  if (priority.elderly) return "Elderly";
  return "Normal";
};

const priorityRank = {
  Emergency: 1,
  Elderly: 2,
  Normal: 3,
};

const StaffDashboard = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [success, setSuccess] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

useEffect(() => {
  const handleNewTicket = (newTicket) => {
  if (
    newTicket.status === filter &&
    newTicket.organization === user?.organization &&
    newTicket.organizationUnit === user?.organizationUnit
  ) {
    setTickets((prev) => [newTicket, ...prev]);
  }

  setAllTickets((prev) => {
    if (prev.some((t) => t._id === newTicket._id)) return prev;
    return [newTicket, ...prev];
  });
};


  socket.on("newTicketBooked", handleNewTicket);

  return () => {
    socket.off("newTicketBooked", handleNewTicket);
  };
}, [filter,user]);


  useEffect(() => {
 const handleTicketUpdated = (updatedTicket) => {
  if (
    updatedTicket.organization !== user?.organization ||
    updatedTicket.organizationUnit !== user?.organizationUnit
  ) {
    return;
  }

  setTickets((prev) =>
    prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
  );

  setAllTickets((prev) =>
    prev.map((t) =>
      t._id === updatedTicket._id ? updatedTicket : t
    )
  );
};


  socket.on("staffTicketUpdated", handleTicketUpdated);

  return () => {
    socket.off("staffTicketUpdated", handleTicketUpdated);
  };
}, [user]);


  // Live clock
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load tickets by status
  const fetchTickets = useCallback(async () => {
    if (!user?.organization || !user?.organizationUnit) return;

    try {
      setLoading(true);
     const res = await getAllTickets({
  status: filter,
  organization: user.organization,
  organizationUnit: user.organizationUnit,
});


      setTickets(res.data.tickets || []);

setAllTickets((prev) => {
  const map = new Map(prev.map((t) => [t._id, t]));
  (res.data.tickets || []).forEach((t) => map.set(t._id, t));
  return Array.from(map.values());
});

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Auto-hide success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(t);
  }, [success]);

  // Real-time status update
  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTicketStatus(id, status);
      setSuccess(`Ticket updated to ${status}`);

      setTickets((prev) =>
        prev
          .map((t) =>
            t._id === id
              ? {
                  ...t,
                  status,
                }
              : t
          )
          .filter((t) => t.status === filter)
      );

      setAllTickets((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                status,
              }
            : t
        )
      );

      setFilter(status);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter + sort
  const visibleTickets = tickets.sort(
    (a, b) =>
      priorityRank[normalizePriority(a.priority)] -
      priorityRank[normalizePriority(b.priority)]
  );

  // Stats
  const stats = {
    pending: allTickets.filter((t) => t.status === "Pending").length,
    processing: allTickets.filter((t) => t.status === "Processing").length,
    completed: allTickets.filter((t) => t.status === "Completed").length,
  };

  const getPriorityBadge = (priority) => {
    const p = normalizePriority(priority);
    if (p === "Emergency")
      return "bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse font-semibold shadow-sm";
    if (p === "Elderly")
      return "bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium shadow-sm";
    return "bg-slate-600 text-white";
  };

  const getStatusChip = (status) => {
    if (status === "Pending")
      return "bg-amber-50 text-amber-700 border border-amber-200";
    if (status === "Processing")
      return "bg-sky-50 text-sky-700 border border-sky-200";
    if (status === "Completed")
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    return "bg-gray-50 text-gray-700 border border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-emerald-50 relative overflow-hidden font-['Inter',_system-ui,_sans-serif]">
      {/* Soft background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-16 h-72 w-72 bg-sky-300/30 blur-3xl rounded-full" />
        <div className="absolute top-32 -right-24 h-80 w-80 bg-amber-300/30 blur-3xl rounded-full" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 bg-emerald-300/25 blur-3xl rounded-full" />
      </div>

      {/* HEADER */}
      <header className="bg-white/80 border-b border-slate-100 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 border border-blue-100 tracking-wide">
              <Users size={14} />
              STAFF WORKSPACE
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <TicketIcon size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Staff Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                 Managing {user?.organization || "Not Assigned"}:{" "}
<span className="font-medium text-slate-700">
  {user?.organizationUnit || "Not Assigned"}
</span>

                </p>

                <p className="text-sm text-slate-600">
                  Welcome,{" "}
                  <span className="font-semibold text-slate-900">
                    {user?.firstName}
                  </span>
                  . Monitor and control live queue activity.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/staff/scan-pit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:brightness-105 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-transform hover:-translate-y-0.5"
            >
              <QrCode size={18} />
              Scan PIT
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-transform hover:-translate-y-0.5"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* STATS */}
        <section className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => setFilter("Pending")}
            className={`group flex items-center justify-between rounded-2xl border px-5 py-4 shadow-sm bg-white/95 hover:shadow-xl transition-all duration-200 ${
              filter === "Pending"
                ? "border-amber-400 ring-2 ring-amber-200"
                : "border-slate-200"
            }`}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 flex items-center gap-1">
                <Clock size={14} />
                Pending
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stats.pending}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tickets waiting to be picked.
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
              <Clock size={22} />
            </div>
          </button>

          <button
            onClick={() => setFilter("Processing")}
            className={`group flex items-center justify-between rounded-2xl border px-5 py-4 shadow-sm bg-white/95 hover:shadow-xl transition-all duration-200 ${
              filter === "Processing"
                ? "border-sky-400 ring-2 ring-sky-200"
                : "border-slate-200"
            }`}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 flex items-center gap-1">
                <Loader size={14} className="animate-spin-slow" />
                Processing
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stats.processing}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tickets currently in progress.
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 group-hover:bg-sky-200 transition-colors">
              <Loader size={22} className="animate-spin-slow" />
            </div>
          </button>

          <button
            onClick={() => setFilter("Completed")}
            className={`group flex items-center justify-between rounded-2xl border px-5 py-4 shadow-sm bg-white/95 hover:shadow-xl transition-all duration-200 ${
              filter === "Completed"
                ? "border-emerald-400 ring-2 ring-emerald-200"
                : "border-slate-200"
            }`}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 flex items-center gap-1">
                <CheckCircle size={14} />
                Completed
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stats.completed}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tickets closed successfully.
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-200 transition-colors">
              <CheckCircle size={22} />
            </div>
          </button>
        </section>

        {/* SUCCESS BANNER */}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2 shadow-sm animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle size={18} className="text-emerald-500" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* FILTER BAR */}
        <section className="rounded-2xl bg-white/95 border border-slate-200 shadow-sm px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center gap-2 text-sm text-slate-600">
            <Filter size={16} />
            <span className="font-semibold">Filters</span>
            <span className="text-xs text-slate-400">
              Narrow by organization and status.
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-300 bg-white px-3 py-2 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option>Pending</option>
              <option>Processing</option>
              <option>Completed</option>
            </select>
          </div>
        </section>

        {/* LIST */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-sky-500" size={28} />
          </div>
        ) : visibleTickets.length === 0 ? (
          <div className="text-center text-slate-500 py-12 bg-white/95 rounded-2xl border border-dashed border-slate-200">
            <Users size={40} className="mx-auto mb-3 text-slate-400" />
            <p className="font-medium">No tickets found</p>
            <p className="text-xs mt-1">
              Try changing the status or organization filters.
            </p>
          </div>
        ) : (
          <section className="space-y-5">
            {visibleTickets.map((t) => (
              <article
                key={t._id}
                className="bg-white/95 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-200 hover:shadow-xl transition-all duration-200 p-5"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                        {t.ticketNumber}
                      </h3>
                      <span
                        className={`text-[11px] px-2 py-1 rounded-full ${getPriorityBadge(
                          t.priority
                        )}`}
                      >
                        {normalizePriority(t.priority)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">
                      {t.organization} — {t.serviceType}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Customer:{" "}
                      <span className="font-medium text-slate-800">
                        {t.customer?.firstName} {t.customer?.lastName}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-[11px] px-3 py-1 rounded-full font-medium ${getStatusChip(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                    {t.queuePosition && (
                      <span className="text-xs text-slate-500">
                        Queue:{" "}
                        <span className="font-semibold text-slate-800">
                          #{t.queuePosition}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {t.status === "Pending" && (
                    <button
                      onClick={() => handleStatusUpdate(t._id, "Processing")}
                      className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      <Loader size={16} className="animate-spin-slow" />
                      Start Processing
                    </button>
                  )}
                  {t.status === "Processing" && (
                    <button
                      onClick={() => handleStatusUpdate(t._id, "Completed")}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      <CheckCircle size={16} />
                      Mark Completed
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Footer helper */}
        <footer className="mt-6 text-[11px] text-slate-400 text-right flex items-center justify-end gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/70 border border-slate-200 shadow-sm">
            <Clock size={12} className="text-slate-500" />
            <span>Updated at {currentTime.toLocaleTimeString()}</span>
          </span>
        </footer>
      </main>
    </div>
  );
};

export default StaffDashboard;
