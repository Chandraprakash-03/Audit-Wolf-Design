export async function sendAuditEmail({
	email,
	pdfUrl,
	auditId,
}: {
	email: string;
	pdfUrl: string;
	auditId: string;
}) {
	const response = await fetch(`${import.meta.env.VITE_EMAIL_URL}/send-email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			to: email,
			subject: `Your Audit Report [Audit ID: ${auditId || "N/A"}]`,
			html: `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Audit Wolf - Audit Complete</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
	<table role="presentation" style="width: 100%; max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;" cellspacing="0" cellpadding="0">
		<tr>
			<td style="padding: 32px 24px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));">
				<h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px; text-align: center;">
					Audit Complete! 🐺
				</h1>
				<p style="font-size: 16px; color: #4B5563; margin: 0 0 24px; text-align: center;">
					Hey 👋, Your smart contract audit is complete!
				</p>
				<div style="text-align: center; margin: 32px 0;">
					<a href="${pdfUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #FFFFFF; background: linear-gradient(90deg, #4B5EAA, #6B7280); border-radius: 12px; text-decoration: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: background 0.3s ease;">
						📄 Download Audit Report
					</a>
				</div>
				<p style="font-size: 14px; color: #4B5563; text-align: center; margin: 24px 0 0;">
					Thanks for using <strong>Audit Wolf</strong> 🐺
				</p>
			</td>
		</tr>
	</table>
</body>
</html>
				`,
		}),
	});

	if (!response.ok) {
		const err = await response.text();
		console.error("❌ Email send failed:", err);
		throw new Error("Failed to send email");
	}

	return true;
}
