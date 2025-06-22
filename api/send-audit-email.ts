export default async function handler(req: Request): Promise<Response> {
	if (req.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
		});
	}

	const { to, auditId, downloadUrl } = await req.json();

	if (!to || !downloadUrl) {
		return new Response(JSON.stringify({ error: "Missing fields" }), {
			status: 400,
		});
	}

	const payload = {
		sender: {
			name: "Audit Wolf",
			email: "auditwolf@gmail.com", // verified Gmail sender
		},
		to: [{ email: to }],
		subject: `Your Audit Report [Audit ID: ${auditId || "N/A"}]`,
		htmlContent: `
      <p>Hey 👋,</p>
      <p>Your smart contract audit is complete!</p>
      <p><a href="${downloadUrl}" target="_blank">📄 Download Audit Report</a></p>
      <br />
      <p>Thanks for using Audit Wolf 🐺</p>
    `,
	};

	try {
		const res = await fetch("https://api.brevo.com/v3/smtp/email", {
			method: "POST",
			headers: {
				"api-key": process.env.BREVO_API_KEY!,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const data = await res.json();

		if (!res.ok) {
			console.error("❌ Brevo Error:", data);
			return new Response(JSON.stringify({ error: "Failed to send email" }), {
				status: 500,
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
		});
	} catch (err: any) {
		console.error("❌ Email send failed:", err.message);
		return new Response(
			JSON.stringify({ error: `Send failed: ${err.message}` }),
			{ status: 500 }
		);
	}
}
