export default async function handler(req: Request): Promise<Response> {
	// Ensure method is POST
	if (req.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
			status: 405,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Parse body
	let body;
	try {
		body = await req.json();
	} catch (err) {
		return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { to, auditId, downloadUrl } = body;

	// Validate required fields
	if (!to || !downloadUrl) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(to)) {
		return new Response(JSON.stringify({ error: "Invalid email address" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Check credentials
	const EMAIL_USER = process.env.EMAIL_USER;
	const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

	if (!EMAIL_USER || !EMAIL_PASSWORD) {
		console.error("❌ Missing email credentials in environment variables");
		return new Response(
			JSON.stringify({ error: "Server configuration error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	try {
		// Dynamically import nodemailer (CommonJS in ESM context)
		const { default: nodemailer } = await import("nodemailer");

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASSWORD,
			},
		});

		const mailOptions = {
			from: `"Audit Wolf" <${EMAIL_USER}>`,
			to,
			subject: `Your Audit Report [Audit ID: ${auditId || "N/A"}]`,
			html: `
        <p>Hey 👋,</p>
        <p>Your smart contract audit is complete! You can download your report below:</p>
        <p><a href="${downloadUrl}" target="_blank">📄 Download Audit Report</a></p>
        <br />
        <p>Thank you for using Audit Wolf 🐺</p>
      `,
		};

		// Send email
		await transporter.sendMail(mailOptions);

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		console.error("❌ Email send failed:", err.message);
		return new Response(
			JSON.stringify({ error: `Failed to send email: ${err.message}` }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
