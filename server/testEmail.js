import transporter from "./config/emailTransporter.js";

async function sendTestEmail() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: "✅ FairQ Email Test Successful",
      html: `
        <h2>Email system is working 🎉</h2>
        <p>This email was sent from localhost.</p>
      `,
    });

    console.log("✅ Test email sent successfully");
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
}

sendTestEmail();
