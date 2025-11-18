// Simple email service simulation
export const sendTicketBookedEmail = (ticket) => {
  console.log(`
📧 EMAIL NOTIFICATION
To: ${ticket.customer.email}
Subject: Ticket Booked Successfully - ${ticket.ticketNumber}

Dear ${ticket.customer.firstName},

Your queue ticket has been booked successfully!

Ticket Details:
- Ticket Number: ${ticket.ticketNumber}
- Organization: ${ticket.organization}
- Service: ${ticket.serviceType}
- Status: ${ticket.status}
- Queue Position: #${ticket.queuePosition}
- Estimated Wait Time: ${ticket.estimatedWaitTime} minutes

Thank you for using FairQ!
  `);
};

export const sendStatusUpdateEmail = (ticket) => {
  console.log(`
📧 STATUS UPDATE EMAIL
To: ${ticket.customer.email}
Subject: Ticket Status Updated - ${ticket.ticketNumber}

Dear ${ticket.customer.firstName},

Your ticket status has been updated to: ${ticket.status}

Ticket Number: ${ticket.ticketNumber}
Organization: ${ticket.organization}

Thank you for using FairQ!
  `);
};
