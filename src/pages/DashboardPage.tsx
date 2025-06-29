import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
	FileText,
	Clock,
	CheckCircle,
	AlertTriangle,
	Download,
	Eye,
	Plus,
	Filter,
	Calendar,
	Shield,
	Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import GlassCard from "../components/ui/GlassCard";
import MouseTracker from "../components/ui/MouseTracker";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { supabase } from "../db/supabase";

interface Audit {
	id: string;
	contractName: string;
	status: "pending" | "completed" | "failed" | "error";
	createdAt: string;
	completedAt?: string;
	issuesFound: number;
	severity: "low" | "medium" | "high" | "critical";
	securityScore?: number; // Changed back to optional
	gasOptimizations?: number;
	reportUrl?: string;
}

const authData = localStorage.getItem("sb-siindibbfajlgqhkzumw-auth-token");
const accessToken = authData ? JSON.parse(authData).access_token : null;

const DashboardPage: React.FC = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [filter, setFilter] = useState<
		"all" | "pending" | "completed" | "failed" | "error"
	>("all");
	const [audits, setAudits] = useState<Audit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const calculateSecurityScore = (issues: any[]) => {
		const severityWeights = {
			critical: 30,
			high: 20,
			medium: 10,
			low: 5,
		};
		let score = 100;
		issues.forEach((issue) => {
			score -=
				severityWeights[
					issue.severity.toLowerCase() as keyof typeof severityWeights
				] || 5;
		});
		return Math.max(0, score);
	};

	useEffect(() => {
		if (!user?.email) {
			setError("Please sign in to view your audits.");
			setIsLoading(false);
			return;
		}

		const fetchAudits = async () => {
			setIsLoading(true);
			setError("");

			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/user-audit/${user.email}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				if (response.status === 204) {
					setAudits([]);
					return;
				}

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${await response.text()}`);
				}

				const data = await response.json();
				const mappedAudits: Audit[] = data.data.map((audit: any) => ({
					id: audit.id,
					contractName: audit.wallet || `Audit-${audit.id.slice(0, 8)}`,
					status: audit.status as "pending" | "completed" | "failed" | "error",
					createdAt: audit.createdAt,
					completedAt: audit.completedAt,
					issuesFound: audit.auditJson ? audit.auditJson.length : 0,
					severity: audit.auditJson
						? audit.auditJson.reduce((max: string, issue: any) => {
								const severityOrder = ["critical", "high", "medium", "low"];
								return severityOrder.indexOf(issue.severity.toLowerCase()) <
									severityOrder.indexOf(max.toLowerCase())
									? issue.severity.toLowerCase()
									: max.toLowerCase();
						  }, "low")
						: "low",
					securityScore:
						audit.status === "completed" && audit.auditJson
							? calculateSecurityScore(audit.auditJson)
							: undefined,
					gasOptimizations: audit.gasOptimizations
						? audit.gasOptimizations.suggestions.length
						: 0,
					reportUrl:
						audit.status === "completed"
							? `/api/audit/report/${audit.id}`
							: undefined,
				}));

				setAudits(mappedAudits);
			} catch (err: any) {
				setError(err.message || "Failed to fetch audits. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchAudits();
	}, [user?.email]);

	const handleViewReport = (auditId: string) => {
		navigate(`/audit-report/${auditId}`);
	};

	const handleDownloadReport = async (auditId: string) => {
		try {
			const fullPath = `${auditId}.pdf`;
			const { data: publicUrlData } = supabase.storage
				.from("audit-reports")
				.getPublicUrl(fullPath, { download: true });

			const url = publicUrlData?.publicUrl;
			if (!url) throw new Error("Public URL not found");

			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `audit-${auditId}.pdf`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (err) {
			setError("Failed to download PDF: " + (err as Error).message);
		}
	};

	const filteredAudits = audits.filter((audit) =>
		filter === "all" ? true : audit.status === filter
	);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <Clock className="h-5 w-5 text-yellow-500" />;
			case "completed":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "failed":
			case "error":
				return <AlertTriangle className="h-5 w-5 text-red-500" />;
			default:
				return null;
		}
	};

	const getSeverityColor = (severity: string) => {
		switch (severity) {
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

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-600";
		if (score >= 60) return "text-yellow-600";
		return "text-red-600";
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const stats = {
		total: audits.length,
		completed: audits.filter((a) => a.status === "completed").length,
		pending: audits.filter((a) => a.status === "pending").length,
		critical: audits.filter((a) => a.severity === "critical").length,
		avgScore: audits.filter(
			(a) => a.status === "completed" && a.securityScore !== undefined
		).length
			? Math.round(
					audits
						.filter(
							(a) => a.status === "completed" && a.securityScore !== undefined
						)
						.reduce((acc, a) => acc + (a.securityScore || 0), 0) /
						audits.filter(
							(a) => a.status === "completed" && a.securityScore !== undefined
						).length
			  )
			: 0,
	};

	return (
		<div className="min-h-screen pt-24 pb-12">
			<MouseTracker />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					{/* Header */}
					<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
						<div>
							<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
								Dashboard
							</h1>
							<p className="text-xl text-gray-600 dark:text-gray-300">
								Welcome back, {user?.name}
							</p>
						</div>

						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="mt-6 lg:mt-0"
						>
							<Link
								to="/audit"
								className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-glow-lg btn-hover"
							>
								<Plus className="mr-2 h-5 w-5" />
								New Audit
							</Link>
						</motion.div>
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
								Loading your audits...
							</p>
						</GlassCard>
					)}

					{!isLoading && (
						<>
							{/* Stats Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
								<GlassCard className="p-6 text-center">
									<div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
										{stats.total}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
										<FileText className="h-4 w-4 mr-1" />
										Total Audits
									</div>
								</GlassCard>

								<GlassCard className="p-6 text-center">
									<div className="text-3xl font-bold text-green-600 mb-2">
										{stats.completed}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
										<CheckCircle className="h-4 w-4 mr-1" />
										Completed
									</div>
								</GlassCard>

								<GlassCard className="p-6 text-center">
									<div className="text-3xl font-bold text-yellow-600 mb-2">
										{stats.pending}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
										<Clock className="h-4 w-4 mr-1" />
										Pending
									</div>
								</GlassCard>

								<GlassCard className="p-6 text-center">
									<div className="text-3xl font-bold text-red-600 mb-2">
										{stats.critical}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
										<AlertTriangle className="h-4 w-4 mr-1" />
										Critical Issues
									</div>
								</GlassCard>

								<GlassCard className="p-6 text-center">
									<div
										className={`text-3xl font-bold mb-2 ${getScoreColor(
											stats.avgScore
										)}`}
									>
										{stats.avgScore}/100
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
										<Shield className="h-4 w-4 mr-1" />
										Avg Score
									</div>
								</GlassCard>
							</div>

							{/* Filters */}
							<div className="flex flex-wrap gap-4 mb-8">
								<div className="flex items-center space-x-2">
									<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Filter:
									</span>
								</div>

								{["all", "pending", "completed", "failed", "error"].map(
									(status) => (
										<motion.button
											key={status}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={() => setFilter(status as any)}
											className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
												filter === status
													? "bg-primary-600 text-white shadow-lg"
													: "glass hover:shadow-glow text-gray-600 dark:text-gray-400"
											}`}
										>
											{status.charAt(0).toUpperCase() + status.slice(1)}
										</motion.button>
									)
								)}
							</div>

							{/* Audits List */}
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
									Recent Audits
								</h2>

								{filteredAudits.length === 0 ? (
									<GlassCard className="p-16 text-center">
										<FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
										<h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
											No audits found
										</h3>
										<p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
											{filter === "all"
												? "You haven't run any audits yet. Start securing your smart contracts today!"
												: `No ${filter} audits found. Try adjusting your filter.`}
										</p>
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Link
												to="/audit"
												className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 btn-hover"
											>
												<Plus className="mr-2 h-5 w-5" />
												Run Your First Audit
											</Link>
										</motion.div>
									</GlassCard>
								) : (
									filteredAudits.map((audit, index) => (
										<motion.div
											key={audit.id}
											initial={{ opacity: 0, x: -30 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.5, delay: index * 0.1 }}
										>
											<GlassCard className="p-6 hover:shadow-glow-lg transition-all duration-300">
												<div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
													<div className="flex items-center space-x-4">
														<div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
															<FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
														</div>
														<div>
															<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
																{audit.contractName}
															</h3>
															<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
																<div className="flex items-center space-x-1">
																	<Calendar className="h-4 w-4" />
																	<span>{formatDate(audit.createdAt)}</span>
																</div>
																{audit.completedAt && (
																	<span>
																		Completed in{" "}
																		{Math.round(
																			(new Date(audit.completedAt).getTime() -
																				new Date(audit.createdAt).getTime()) /
																				1000
																		)}
																		s
																	</span>
																)}
															</div>
														</div>
													</div>
													<div className="flex flex-wrap items-center gap-4">
														<div className="flex items-center space-x-2">
															{getStatusIcon(audit.status)}
															<span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
																{audit.status}
															</span>
														</div>
														{audit.status === "completed" &&
															audit.securityScore !== undefined && (
																<div className="flex items-center space-x-2">
																	<Shield className="h-4 w-4 text-gray-500" />
																	<span
																		className={`text-sm font-medium ${getScoreColor(
																			audit.securityScore
																		)}`}
																	>
																		{audit.securityScore}/100
																	</span>
																</div>
															)}
														{audit.status === "completed" && (
															<span
																className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
																	audit.severity
																)}`}
															>
																{audit.issuesFound}{" "}
																{audit.issuesFound === 1 ? "Issue" : "Issues"}
															</span>
														)}
														{audit.status === "completed" &&
															audit.gasOptimizations &&
															audit.gasOptimizations > 0 && (
																<div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
																	<Zap className="h-4 w-4" />
																	<span>
																		{audit.gasOptimizations} optimizations
																	</span>
																</div>
															)}
														{audit.status === "completed" && (
															<div className="flex space-x-2">
																<motion.button
																	whileHover={{ scale: 1.05 }}
																	whileTap={{ scale: 0.95 }}
																	onClick={() => handleViewReport(audit.id)}
																	className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
																	title="View Report"
																>
																	<Eye className="h-5 w-5" />
																</motion.button>
																<motion.button
																	whileHover={{ scale: 1.05 }}
																	whileTap={{ scale: 0.95 }}
																	onClick={() => handleDownloadReport(audit.id)}
																	className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
																	title="Download Report"
																>
																	<Download className="h-5 w-5" />
																</motion.button>
															</div>
														)}
													</div>
												</div>
											</GlassCard>
										</motion.div>
									))
								)}
							</div>
						</>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default DashboardPage;
