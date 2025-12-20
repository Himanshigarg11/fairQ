import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyTickets } from "../../services/ticketService";
import TicketBookingForm from "../../components/TicketBookingForm";
import MyTickets from "../../components/MyTickets";
import {
  TicketIcon,
  Clock,
  CheckCircle,
  ListChecks,
  ArrowRight,
  Filter,
} from "lucide-react";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [tickets, setTickets] = useState([]);

  const [stats, setStats] = useState({
    activeTickets: 0,
    completedTickets: 0,
    totalTickets: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ticketFilter, setTicketFilter] = useState("all");

  useEffect(() => {
    fetchStats();
  }, []);

  // 🔁 Real-time polling: refresh tickets & stats every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 10000); // 10 seconds; adjust if you want slower/faster updates
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getMyTickets();
      const dataTickets = response.data.tickets || [];

      setTickets(dataTickets);

      const activeTickets = dataTickets.filter((t) =>
        ["Pending", "Processing"].includes(t.status)
      );
      const completedTickets = dataTickets.filter(
        (t) => t.status === "Completed"
      );

      setStats({
        activeTickets: activeTickets.length,
        completedTickets: completedTickets.length,
        totalTickets: dataTickets.length,
      });

      setRecentTickets(dataTickets.slice(0, 3));
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketBooked = () => {
    fetchStats();
    setTicketFilter("active");
    setActiveTab("tickets");
  };

  const statCards = [
    {
      id: "active",
      title: "Active Tickets",
      value: stats.activeTickets,
      colorFrom: "from-amber-400",
      colorTo: "to-orange-500",
      icon: <Clock size={18} />,
      description: "Pending and processing tickets.",
    },
    {
      id: "completed",
      title: "Completed",
      value: stats.completedTickets,
      colorFrom: "from-emerald-400",
      colorTo: "to-emerald-500",
      icon: <CheckCircle size={18} />,
      description: "Tickets already served.",
    },
    {
      id: "all",
      title: "Total Tickets",
      value: stats.totalTickets,
      colorFrom: "from-sky-400",
      colorTo: "to-blue-500",
      icon: <ListChecks size={18} />,
      description: "All tickets you have created.",
    },
  ];

  const getFilteredTickets = () => {
    if (ticketFilter === "active") {
      return tickets.filter(
        (t) => t.status === "Pending" || t.status === "Processing"
      );
    }

    if (ticketFilter === "completed") {
      return tickets.filter((t) => t.status === "Completed");
    }

    return tickets;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Processing":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-emerald-50 relative overflow-hidden font-['Inter',_system-ui,_sans-serif]">
      {/* soft blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-16 h-72 w-72 bg-sky-300/30 blur-3xl rounded-full" />
        <div className="absolute top-32 -right-24 h-80 w-80 bg-orange-300/30 blur-3xl rounded-full" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 bg-emerald-300/25 blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <header className="bg-white/85 shadow-sm border-b border-slate-100 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <TicketIcon size={22} />
            </div>
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Customer Portal
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Customer Dashboard
              </h1>
              <p className="text-sm text-slate-600">
                Welcome back,{" "}
                <span className="font-semibold text-slate-900">
                  {user?.firstName}
                </span>
                . Manage and track your queue tickets in real time.
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-transform hover:-translate-y-0.5"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/90 border-b border-slate-100 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "book", label: "Book Ticket" },
              { id: "tickets", label: "My Tickets" },
              { id: "generatePIT", label: "Generate PIT" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-orange-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statCards.map((stat) => (
                <button
                  key={stat.id}
                  onClick={() => {
                    setTicketFilter(stat.id);
                    setActiveTab("tickets");
                  }}
                  className={`bg-white/95 p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between text-left ${
                    ticketFilter === stat.id && activeTab === "tickets"
                      ? "ring-2 ring-orange-300 border-orange-300"
                      : ""
                  }`}
                >
                  <div>
                    <p className="text-xs text-slate-500 font-semibold tracking-[0.16em] uppercase">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {loading ? "..." : stat.value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.colorFrom} ${stat.colorTo} flex items-center justify-center text-white shadow-md`}
                  >
                    {stat.icon}
                  </div>
                </button>
              ))}
            </section>

            {/* Quick Action */}
            <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 rounded-2xl p-6 text-white shadow-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    Ready to skip the queue?
                  </h3>
                  <p className="text-sm text-orange-100">
                    Book your next ticket online and arrive just in time.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("book")}
                  className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-sm"
                >
                  Book Now
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>

            {/* Recent Tickets */}
            {recentTickets.length > 0 && (
              <section className="bg-white/95 rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent Tickets
                  </h3>
                  <button
                    onClick={() => {
                      setTicketFilter("all");
                      setActiveTab("tickets");
                    }}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                  >
                    View All
                    <ArrowRight size={14} />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {ticket.ticketNumber}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {ticket.organization} — {ticket.serviceType}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Book Ticket Tab */}
        {activeTab === "book" && (
          <section>
            <TicketBookingForm onTicketBooked={handleTicketBooked} />
          </section>
        )}

        {/* My Tickets Tab */}
        {activeTab === "tickets" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Filter size={14} className="text-slate-400" />
                <span className="font-semibold">Filter tickets</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "active", label: "Active (Pending + Processing)" },
                  { id: "completed", label: "Completed" },
                  { id: "all", label: "All Tickets" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTicketFilter(f.id)}
                    className={`px-3 py-1.5 text-xs rounded-full border text-slate-600 hover:bg-slate-50 transition-colors ${
                      ticketFilter === f.id
                        ? "border-orange-500 text-orange-600 bg-orange-50"
                        : "border-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <MyTickets tickets={getFilteredTickets()} />
          </section>
        )}

        {/* Generate PIT Tab */}
        {activeTab === "generatePIT" && (
          <section className="bg-white/95 p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              Generate PIT
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Generate your Priority Identification Token (PIT) to speed up
              scanning at the counter.
            </p>
            <Link
              to="/customer/generate-pit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Open PIT Generator
              <ArrowRight size={16} />
            </Link>
          </section>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
