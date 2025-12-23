import { sendEmail } from "../config/emailTransporter.js";

export const sendTicketBookedEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "🎟️ Your FairQ Ticket is Booked",
    html: `
      <h2>Ticket Booked Successfully</h2>
      <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
      <p><strong>Service:</strong> ${ticket.serviceType}</p>
      <p><strong>Queue Position:</strong> ${ticket.queuePosition}</p>
      <p><strong>Estimated Wait:</strong> ${ticket.estimatedWaitTime} mins</p>
    `,
  });
};

export const sendProcessingStartedEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "⏳ Your FairQ Ticket Is Being Processed",
    html: `
      <h2>Service Started</h2>
      <p>Your ticket <strong>${ticket.ticketNumber}</strong> is now being processed.</p>
    `,
  });
};

export const sendCompletedEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "✅ Your FairQ Ticket Has Been Completed",
    html: `
      <h2>Service Completed</h2>
      <p>Your ticket <strong>${ticket.ticketNumber}</strong> has been completed.</p>
    `,
  });
};

export const sendTurnAlertEmail = async (ticket, user, currentTicketNumber) => {
  await sendEmail({
    to: user.email,
    subject: "🔔 Your Turn Is Coming Soon!",
    html: `
      <p>Current ticket: ${currentTicketNumber}</p>
      <p>Your ticket: ${ticket.ticketNumber}</p>
    `,
  });
};
