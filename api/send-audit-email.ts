export default async function handler(req) {
	const nodemailer = await import("nodemailer");
	// Ensure JSON response for non-POST methods
	if (req.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
			status: 405,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Parse request body safely
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
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
		return new Response(JSON.stringify({ error: "Invalid email address" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Check environment variables
	if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
		console.error("Missing email credentials");
		return new Response(
			JSON.stringify({ error: "Server configuration error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	// Set up Nodemailer
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: `"Audit Wolf" <${process.env.EMAIL_USER}>`,
		to,
		subject: `Your Audit Report [Audit ID: ${auditId || "N/A"}]`,
		html: `
      <p>Hey,</p>
      <p>Your smart contract audit is complete! You can download the report below:</p>
      <p><a href="${downloadUrl}" target="_blank">📄 Download Audit Report</a></p>
      <br />
      <p>Thanks for using Audit Wolf 🐺</p>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error("Email send failed:", err.message);
		return new Response(
			JSON.stringify({ error: `Failed to send email: ${err.message}` }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
