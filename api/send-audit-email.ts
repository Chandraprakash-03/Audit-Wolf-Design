import nodemailer from "nodemailer";

export default async function handler(req: Request) {
	if (req.method !== "POST") {
		return new Response("Method Not Allowed", { status: 405 });
	}

	const { to, auditId, downloadUrl } = await req.json();

	if (!to || !downloadUrl) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), {
			status: 400,
		});
	}

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.VITE_EMAIL_USER,
			pass: process.env.VITE_EMAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: `"Audit Wolf" <${process.env.VITE_EMAIL_USER}>`,
		to,
		subject: `Your Audit Report [Audit ID: ${auditId}]`,
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
		});
	} catch (err) {
		console.error("Email send failed:", err);
		return new Response(JSON.stringify({ error: "Failed to send email" }), {
			status: 500,
		});
	}
}
