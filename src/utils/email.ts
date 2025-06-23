export async function sendAuditEmail({
	email,
	pdfUrl,
	auditId,
}: {
	email: string;
	pdfUrl: string;
	auditId: string;
}) {
	const response = await fetch(
		"https://email-microservice-oyan.onrender.com/send-email",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				to: email,
				subject: `Your Audit Report [Audit ID: ${auditId || "N/A"}]`,
				html: `
          <p>Hey 👋,</p>
          <p>Your smart contract audit is complete!</p>
          <p><a href="${pdfUrl}" target="_blank">📄 Download Audit Report</a></p>
          <br />
          <p>Thanks for using Audit Wolf 🐺</p>
        `,
			}),
		}
	);

	if (!response.ok) {
		const err = await response.text();
		console.error("❌ Email send failed:", err);
		throw new Error("Failed to send email");
	}

	return true;
}
