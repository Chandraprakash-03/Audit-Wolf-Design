import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
	FileText,
	AlertTriangle,
	Zap,
	ArrowLeft,
	Download,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import GlassCard from "../components/ui/GlassCard";
import MouseTracker from "../components/ui/MouseTracker";
import LoadingSpinner from "../components/ui/LoadingSpinner";

interface Vulnerability {
	line: number;
	issue: string;
	severity: string;
	recommendation: string;
}

interface GasOptimization {
	line: number;
	description: string;
	estimatedSavings: number;
}

interface AuditReport {
	id: string;
	wallet: string;
	status: string;
	createdAt: string;
	completedAt?: string;
	auditJson: Vulnerability[] | null;
	gasOptimizations: {
		suggestions: GasOptimization[];
		estimatedGas: number;
	} | null;
}

const AuditReportPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { user } = useAuth();
	const [report, setReport] = useState<AuditReport | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!id) {
			setError("Please sign in to view this report.");
			setIsLoading(false);
			return;
		}

		const fetchReport = async () => {
			setIsLoading(true);
			setError("");

			try {
				const response = await fetch(
					`https://siindibbfajlgqhkzumw.supabase.co/functions/v1/audit-report/${id}`
				);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${await response.text()}`);
				}

				const data = await response.json();
				setReport(data);
			} catch (err: any) {
				setError(err.message || "Failed to fetch report. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchReport();
	}, [id]);

	const getSeverityColor = (severity: string) => {
		switch (severity.toLowerCase()) {
			case "critical":
				return "text-red-600 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800";
			case "high":
				return "text-orange-600 bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
			case "medium":
				return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
			case "low":
				return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
			default:
				return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
		}
	};

	const handleDownloadReport = async () => {
		if (!id) return;
		try {
			const response = await fetch(`/api/audit/report/${id}/pdf`);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${await response.text()}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `audit-${id}.pdf`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch (err: any) {
			setError(err.message || "Failed to download report. Please try again.");
		}
	};

	return (
		<div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
			<MouseTracker />
			<div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-950 dark:via-primary-950/20 dark:to-secondary-950/20">
				{[...Array(20)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 bg-secondary-400/20 rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							y: [0, -50, 0],
							opacity: [0.2, 0.6, 0.2],
						}}
						transition={{
							duration: 3 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2,
						}}
					/>
				))}
			</div>

			<div className="relative z-10 w-full max-w-4xl px-4">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<Link
							to="/dashboard"
							className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
						>
							<ArrowLeft className="h-5 w-5 mr-2" />
							Back to Dashboard
						</Link>
						{report?.status === "completed" && (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleDownloadReport}
								className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300"
							>
								<Download className="h-5 w-5 mr-2" />
								Download PDF
							</motion.button>
						)}
					</div>

					{/* Error Message */}
					{error && (
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm mb-6"
						>
							{error}
						</motion.div>
					)}

					{/* Loading State */}
					{isLoading && (
						<GlassCard className="p-16 text-center">
							<LoadingSpinner size="lg" />
							<p className="text-gray-600 dark:text-gray-300 mt-4">
								Loading audit report...
							</p>
						</GlassCard>
					)}

					{/* Report Content */}
					{!isLoading && report && (
						<GlassCard className="p-8">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
								Audit Report:{" "}
								{report.wallet || `Audit-${report.id.slice(0, 8)}`}
							</h1>

							<div className="space-y-8">
								{/* Vulnerabilities */}
								<div>
									<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
										<AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
										Vulnerabilities
									</h2>
									{report.auditJson && report.auditJson.length > 0 ? (
										<div className="space-y-4">
											{report.auditJson.map((vuln, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.1 }}
													className="p-4 rounded-xl border bg-white/50 dark:bg-gray-800/50"
												>
													<div className="flex items-center justify-between mb-2">
														<span
															className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
																vuln.severity
															)}`}
														>
															{vuln.severity}
														</span>
														<span className="text-sm text-gray-500 dark:text-gray-400">
															Line {vuln.line}
														</span>
													</div>
													<h3 className="text-lg font-medium text-gray-900 dark:text-white">
														{vuln.issue}
													</h3>
													<p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
														<strong>Recommendation:</strong>{" "}
														{vuln.recommendation}
													</p>
												</motion.div>
											))}
										</div>
									) : (
										<p className="text-gray-600 dark:text-gray-300">
											No vulnerabilities found.
										</p>
									)}
								</div>

								{/* Gas Optimizations */}
								<div>
									<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
										<Zap className="h-6 w-6 text-blue-600 mr-2" />
										Gas Optimizations
									</h2>
									{report.gasOptimizations &&
									report.gasOptimizations.suggestions.length > 0 ? (
										<div className="space-y-4">
											{report.gasOptimizations.suggestions.map((opt, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.1 }}
													className="p-4 rounded-xl border bg-white/50 dark:bg-gray-800/50"
												>
													<div className="flex items-center justify-between mb-2">
														<span className="text-sm text-gray-500 dark:text-gray-400">
															Line {opt.line}
														</span>
														<span className="text-sm text-blue-600 dark:text-blue-400">
															~{opt.estimatedSavings} gas
														</span>
													</div>
													<p className="text-sm text-gray-600 dark:text-gray-300">
														{opt.description}
													</p>
												</motion.div>
											))}
											<p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
												<strong>Estimated Total Gas:</strong>{" "}
												{report.gasOptimizations.estimatedGas.toLocaleString()}
											</p>
										</div>
									) : (
										<p className="text-gray-600 dark:text-gray-300">
											No gas optimizations suggested.
										</p>
									)}
								</div>
							</div>
						</GlassCard>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default AuditReportPage;
