import transporter from "../config/emailTransporter.js";

/**
 * Generic email sender
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};

/**
 * 1️⃣ Ticket Booked Email
 */
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
      <p>We’ll notify you as your turn approaches.</p>
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
      <p>Please be ready with required documents.</p>
      <p>Thank you for waiting.</p>
    `,
  });
};
export const sendTurnAlertEmail = async (ticket, user, currentTicketNumber) => {
  await sendEmail({
    to: user.email,
    subject: "🔔 Your Turn Is Coming Soon!",
    html: `
      <h2>Almost Your Turn ⏰</h2>
      <p><strong>Current Ticket Being Served:</strong> ${currentTicketNumber}</p>
      <p><strong>Your Ticket:</strong> ${ticket.ticketNumber}</p>
      <p><strong>People Before You:</strong> ${ticket.queuePosition - 1}</p>
      <p><strong>Estimated Wait:</strong> ${ticket.estimatedWaitTime} mins</p>
      <p>Please be ready.</p>
    `,
  });
};
/**
 * 4️⃣ Ticket Completed Email
 */
export const sendCompletedEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "✅ Your FairQ Ticket Has Been Completed",
    html: `
      <h2>Service Completed</h2>
      <p>Your ticket <strong>${ticket.ticketNumber}</strong> has been completed successfully.</p>
      <p>Thank you for using FairQ.</p>
      <p>We hope you had a smooth experience.</p>
    `,
  });
};

export const sendArrivalWindowEmail = async (ticket, user) => {
  await sendEmail({
    to: user.email,
    subject: "🕒 Your Arrival Time for FairQ",
    html: `
      <h2>Your Arrival Window Is Ready</h2>
      <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
      <p>Please arrive between:</p>
      <h3>
        ${new Date(ticket.arrivalWindow.start).toLocaleTimeString()} –
        ${new Date(ticket.arrivalWindow.end).toLocaleTimeString()}
      </h3>
      <p>This helps reduce waiting and crowding.</p>
      <p>Thank you for using FairQ.</p>
    `,
  });
};


export default sendEmail;
