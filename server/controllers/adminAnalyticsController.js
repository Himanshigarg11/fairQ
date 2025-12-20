import Ticket from "../models/Ticket.js";

export const getTicketStats = async (req, res) => {
  try {
    const statusStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    const orgStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$organization",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        priorityStats,
        orgStats
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Analytics error" });
  }
};

export const getDailyTickets = async (req, res) => {
  try {
    const daily = await Ticket.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: daily });

  } catch (err) {
    res.status(500).json({ error: "Daily analytics error" });
  }
};

export const getAvgProcessingTime = async (req, res) => {
  try {
    const result = await Ticket.aggregate([
      {
        $match: {
          processedAt: { $ne: null },
          completedAt: { $ne: null }
        }
      },
      {
        $project: {
          duration: {
            $subtract: ["$completedAt", "$processedAt"]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$duration" }
        }
      }
    ]);

    res.json({
      success: true,
      avgTimeInMinutes: Math.round(result[0]?.avgTime / 60000 || 0)
    });

  } catch (err) {
    res.status(500).json({ error: "Processing time error" });
  }
};
