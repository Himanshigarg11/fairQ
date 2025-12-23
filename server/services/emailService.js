import { sendEmail } from "../config/emailTransporter.js";

/**
 * 1️⃣ Ticket Booked
 */
export const sendTicketBookedEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "🎟️ Your FairQ Ticket is Booked",
    html: `
      <h2>Ticket Booked Successfully</h2>
      <p><b>Ticket:</b> ${ticket.ticketNumber}</p>
      <p><b>Service:</b> ${ticket.serviceType}</p>
      <p><b>Queue Position:</b> ${ticket.queuePosition}</p>
    `,
  });
};

/**
 * 2️⃣ Processing Started
 */
export const sendProcessingStartedEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "⏳ Your FairQ Ticket Is Being Processed",
    html: `
      <h2>Processing Started</h2>
      <p>Your ticket <b>${ticket.ticketNumber}</b> is now being processed.</p>
    `,
  });
};

/**
 * 3️⃣ Turn Alert
 */
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

/**
 * 4️⃣ Arrival Window  ✅ THIS WAS MISSING
 */
export const sendArrivalWindowEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "🕒 Your Arrival Window",
    html: `
      <h2>Arrival Window</h2>
      <p>Ticket: ${ticket.ticketNumber}</p>
      <p>
        ${new Date(ticket.arrivalWindow.start).toLocaleTimeString()} –
        ${new Date(ticket.arrivalWindow.end).toLocaleTimeString()}
      </p>
    `,
  });
};

/**
 * 5️⃣ Completed
 */
export const sendCompletedEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "✅ Ticket Completed",
    html: `
      <h2>Completed</h2>
      <p>Your ticket ${ticket.ticketNumber} has been completed.</p>
    `,
  });
};
