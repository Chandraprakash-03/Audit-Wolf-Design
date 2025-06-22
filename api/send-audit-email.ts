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
		// Dynamically import nodemailer
		const { default: nodemailer } = await import("nodemailer");

		// Create transporter with more specific configuration
		const transporter = nodemailer.createTransporter({
			host: "smtp.gmail.com",
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASSWORD,
			},
			// Add connection timeout and socket timeout
			connectionTimeout: 10000, // 10 seconds
			socketTimeout: 10000, // 10 seconds
			// Pool connections for better performance
			pool: true,
			maxConnections: 1,
			maxMessages: 1,
		});

		// Verify connection before sending
		console.log("🔍 Verifying SMTP connection...");
		await transporter.verify();
		console.log("✅ SMTP connection verified");

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

		// Reduce timeout to 25 seconds (well under Vercel's 60s limit)
		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error("Email send timeout after 25s")), 25000)
		);

		console.log("📤 Sending email to:", to);

		// Race between sending email and timeout
		await Promise.race([transporter.sendMail(mailOptions), timeoutPromise]);

		console.log("✅ Email sent successfully");

		// Close the transporter connection
		transporter.close();

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		console.error("❌ Email send failed:", err.message);

		// Return more specific error messages
		let errorMessage = "Failed to send email";
		if (err.message.includes("timeout")) {
			errorMessage = "Email service timeout - please try again";
		} else if (err.message.includes("auth")) {
			errorMessage = "Email authentication failed";
		} else if (err.message.includes("connection")) {
			errorMessage = "Unable to connect to email service";
		}

		return new Response(
			JSON.stringify({
				error: errorMessage,
				details:
					process.env.NODE_ENV === "development" ? err.message : undefined,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
