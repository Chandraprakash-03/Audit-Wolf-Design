export async function sendAuditEmail({
	email,
	pdfUrl,
	auditId,
}: {
	email: string;
	pdfUrl: string;
	auditId: string;
}) {
	const res = await fetch("/api/send-audit-email", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			to: email,
			auditId,
			downloadUrl: pdfUrl,
		}),
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.error || "Email failed");
	}

	return true;
}
