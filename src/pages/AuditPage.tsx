import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	Upload,
	AlertTriangle,
	CheckCircle,
	Download,
	Blocks as Blockchain,
	Shield,
	FileText,
	Clock,
	Copy,
	ExternalLink,
	Zap,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import MouseTracker from "../components/ui/MouseTracker";
import axios from "axios";
import { supabase } from "../db/supabase";
import { sendAuditEmail } from "../utils/email";

interface AuditResult {
	id: string;
	status: "pending" | "completed" | "failed";
	contractAddress?: string;
	issues: {
		severity: "critical" | "high" | "medium" | "low";
		title: string;
		description: string;
		line: number;
		recommendation: string;
		category: string;
	}[];
	summary: {
		totalIssues: number;
		criticalIssues: number;
		highIssues: number;
		mediumIssues: number;
		lowIssues: number;
		gasOptimizations: number;
		securityScore: number;
	};
	gasAnalysis: {
		estimatedGas: number;
		optimizationSuggestions: string[];
	};
}

interface ApiAuditResponse {
	id: string;
	wallet?: string;
	codeHash?: string;
	model?: string;
	auditJson: {
		severity: string;
		line: number;
		issue: string;
		recommendation: string;
	}[];
	gasOptimizations: {
		estimatedGas: number;
		suggestions: {
			line: number;
			description: string;
			estimatedSavings: number;
		}[];
	};
	ipfsCID?: string;
	txHash?: string;
	status: "pending" | "completed" | "error";
	email?: string;
	createdAt?: string;
	completedAt?: string;
	pdfUrl?: string;
}

const authData = localStorage.getItem("sb-siindibbfajlgqhkzumw-auth-token");
const accessToken = authData ? JSON.parse(authData).access_token : null;

const AuditPage: React.FC = () => {
	const [formData, setFormData] = useState({
		walletAddress: "",
		solidityCode: "",
		email: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
	const [showResults, setShowResults] = useState(false);
	const [activeTab, setActiveTab] = useState<"issues" | "gas" | "summary">(
		"summary"
	);
	const [auditId, setAuditId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}audit`,
				{
					wallet: formData.walletAddress,
					code: formData.solidityCode,
					email: formData.email || localStorage.getItem("email"),
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			const { status, auditId } = response.data;
			if (status === "processing" && auditId) {
				setAuditId(auditId);
			} else {
				throw new Error("Invalid API response");
			}
		} catch (err) {
			setError("Failed to start audit: " + (err as Error).message);
			setIsSubmitting(false);
		}
	};

	const pollAuditStatus = async (id: string) => {
		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}status/${id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);
			return response.data.status;
		} catch (err) {
			console.error("Status polling failed:", err);
			return "error";
		}
	};

	const fetchAuditReport = async (id: string): Promise<AuditResult | null> => {
		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}report/${id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);
			const data: ApiAuditResponse = response.data;

			if (data.status !== "completed") {
				return null;
			}

			const issues = data.auditJson.map((issue) => ({
				severity: issue.severity as "critical" | "high" | "medium" | "low",
				title: issue.issue,
				description: issue.issue,
				line: issue.line,
				recommendation: issue.recommendation,
				category:
					issue.severity === "low" &&
					issue.recommendation.toLowerCase().includes("gas")
						? "Gas Optimization"
						: "Security",
			}));

			const summary = {
				totalIssues: issues.length,
				criticalIssues: issues.filter((i) => i.severity === "critical").length,
				highIssues: issues.filter((i) => i.severity === "high").length,
				mediumIssues: issues.filter((i) => i.severity === "medium").length,
				lowIssues: issues.filter((i) => i.severity === "low").length,
				gasOptimizations: data.gasOptimizations?.suggestions?.length || 0,
				securityScore: calculateSecurityScore(issues),
			};

			const gasAnalysis = {
				estimatedGas: data.gasOptimizations?.estimatedGas || 0,
				optimizationSuggestions:
					data.gasOptimizations?.suggestions?.map(
						(s) =>
							`${s.description} (Line ${
								s.line
							}, ~${s.estimatedSavings.toLocaleString()} gas saved)`
					) || [],
			};
			let pdfDownloadUrl: string | undefined = undefined;
			if (data.pdfUrl) {
				const { data: publicUrlData } = supabase.storage
					.from("audit-reports")
					.getPublicUrl(data.pdfUrl, { download: true });
				pdfDownloadUrl = publicUrlData.publicUrl;
				// alert(`✅ Download URL: ${pdfDownloadUrl}`);
				await sendAuditEmail({
					email: data.email || formData.email,
					pdfUrl: pdfDownloadUrl,
					auditId: data.id,
				});
			} else {
				console.error("❌ Error: pdfUrl is undefined.");
			}

			return {
				id: data.id,
				status: data.status,
				contractAddress: data.wallet,
				issues,
				summary,
				gasAnalysis,
			};
		} catch (err) {
			console.error("Report fetching failed:", err);
			setError("Failed to fetch audit report: " + (err as Error).message);
			return null;
		}
	};

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
				severityWeights[issue.severity as keyof typeof severityWeights] || 5;
		});
		return Math.max(0, score);
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (auditId && isSubmitting) {
			interval = setInterval(async () => {
				const status = await pollAuditStatus(auditId);
				if (status === "completed") {
					const report = await fetchAuditReport(auditId);
					if (report) {
						setAuditResult(report);
						setShowResults(true);
						setIsSubmitting(false);
						clearInterval(interval);
					}
				} else if (status === "error") {
					setError("Audit failed. Please try again.");
					setIsSubmitting(false);
					clearInterval(interval);
				}
			}, 5000);
		}

		return () => clearInterval(interval);
	}, [auditId, isSubmitting]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
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

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	const handleDownloadReport = async () => {
		if (!auditId) return;
		try {
			const response = await axios.get(
				`http://localhost:5000/api/report/${auditId}/pdf`,
				{
					responseType: "blob",
				}
			);
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `audit-${auditId}.pdf`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			setError("Failed to download PDF: " + (err as Error).message);
		}
	};

	return (
		<div className="min-h-screen pt-24 pb-12">
			<MouseTracker />
			{showResults && auditResult ? (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						{/* Header */}
						<div className="text-center mb-12">
							<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
								Audit Results
							</h1>
							<p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
								Comprehensive security analysis completed
							</p>

							{auditResult.contractAddress && (
								<div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
									<span>Contract:</span>
									<code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
										{auditResult.contractAddress}
									</code>
									<button
										onClick={() =>
											copyToClipboard(auditResult.contractAddress!)
										}
										className="p-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
									>
										<Copy className="h-4 w-4" />
									</button>
								</div>
							)}
						</div>

						{/* Error Display */}
						{error && (
							<div className="mb-8 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl">
								{error}
							</div>
						)}

						{/* Security Score */}
						<div className="mb-12">
							<GlassCard className="p-8 text-center">
								<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
									Security Score
								</h2>
								<div
									className={`text-6xl font-bold mb-4 ${getScoreColor(
										auditResult.summary.securityScore
									)}`}
								>
									{auditResult.summary.securityScore}/100
								</div>
								<p className="text-gray-600 dark:text-gray-300">
									{auditResult.summary.securityScore >= 80
										? "Excellent"
										: auditResult.summary.securityScore >= 60
										? "Good"
										: "Needs Improvement"}
								</p>
							</GlassCard>
						</div>

						{/* Summary Cards */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
							<GlassCard className="p-6 text-center">
								<div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
									{auditResult.summary.totalIssues}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Total Issues
								</div>
							</GlassCard>

							<GlassCard className="p-6 text-center">
								<div className="text-3xl font-bold text-red-600 mb-2">
									{auditResult.summary.criticalIssues}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Critical
								</div>
							</GlassCard>

							<GlassCard className="p-6 text-center">
								<div className="text-3xl font-bold text-orange-600 mb-2">
									{auditResult.summary.highIssues}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">
									High
								</div>
							</GlassCard>

							<GlassCard className="p-6 text-center">
								<div className="text-3xl font-bold text-blue-600 mb-2">
									{auditResult.summary.gasOptimizations}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Gas Optimizations
								</div>
							</GlassCard>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-wrap gap-4 justify-center mb-12">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleDownloadReport}
								className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors btn-hover"
							>
								<Download className="mr-2 h-5 w-5" />
								Download Report
							</motion.button>

							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="flex items-center px-6 py-3 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 transition-colors btn-hover"
							>
								<Blockchain className="mr-2 h-5 w-5" />
								Store on Blockchain
							</motion.button>

							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => {
									setShowResults(false);
									setAuditId(null);
									setAuditResult(null);
									setError(null);
								}}
								className="flex items-center px-6 py-3 glass rounded-xl hover:shadow-glow transition-all duration-300 
             text-gray-900 dark:text-white 
             border border-gray-300 dark:border-gray-600"
							>
								<Upload className="mr-2 h-5 w-5 text-gray-900 dark:text-white" />
								New Audit
							</motion.button>
						</div>

						{/* Tabs */}
						<div className="mb-8">
							<div className="flex space-x-1 glass rounded-xl p-1">
								{[
									{ id: "summary", label: "Summary", icon: FileText },
									{ id: "issues", label: "Issues", icon: AlertTriangle },
									{ id: "gas", label: "Gas Analysis", icon: Zap },
								].map((tab) => {
									const Icon = tab.icon;
									return (
										<button
											key={tab.id}
											onClick={() => setActiveTab(tab.id as any)}
											className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
												activeTab === tab.id
													? "bg-primary-600 text-white shadow-lg"
													: "text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
											}`}
										>
											<Icon className="h-4 w-4" />
											<span>{tab.label}</span>
										</button>
									);
								})}
							</div>
						</div>

						{/* Tab Content */}
						<div className="space-y-6">
							{activeTab === "summary" && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="grid grid-cols-1 lg:grid-cols-2 gap-8"
								>
									<GlassCard className="p-8">
										<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
											Issue Breakdown
										</h3>
										<div className="space-y-4">
											{[
												{
													label: "Critical",
													count: auditResult.summary.criticalIssues,
													color: "bg-red-500",
												},
												{
													label: "High",
													count: auditResult.summary.highIssues,
													color: "bg-orange-500",
												},
												{
													label: "Medium",
													count: auditResult.summary.mediumIssues,
													color: "bg-yellow-500",
												},
												{
													label: "Low",
													count: auditResult.summary.lowIssues,
													color: "bg-blue-500",
												},
											].map((item) => (
												<div
													key={item.label}
													className="flex items-center justify-between"
												>
													<div className="flex items-center space-x-3">
														<div
															className={`w-3 h-3 rounded-full ${item.color}`}
														/>
														<span className="text-gray-700 dark:text-gray-300">
															{item.label}
														</span>
													</div>
													<span className="font-semibold text-gray-900 dark:text-white">
														{item.count}
													</span>
												</div>
											))}
										</div>
									</GlassCard>

									<GlassCard className="p-8">
										<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
											Recommendations
										</h3>
										<div className="space-y-4">
											<div className="flex items-start space-x-3">
												<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
												<span className="text-gray-700 dark:text-gray-300">
													Address critical vulnerabilities immediately
												</span>
											</div>
											<div className="flex items-start space-x-3">
												<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
												<span className="text-gray-700 dark:text-gray-300">
													Implement proper access controls
												</span>
											</div>
											<div className="flex items-start space-x-3">
												<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
												<span className="text-gray-700 dark:text-gray-300">
													Optimize gas usage for better efficiency
												</span>
											</div>
										</div>
									</GlassCard>
								</motion.div>
							)}

							{activeTab === "issues" && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="space-y-6"
								>
									{auditResult.issues.map((issue, index) => (
										<motion.div
											key={index}
											initial={{ opacity: 0, x: -30 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.5, delay: index * 0.1 }}
										>
											<GlassCard className="p-8">
												<div className="flex items-start justify-between mb-6">
													<div className="flex items-center space-x-4">
														<span
															className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(
																issue.severity
															)}`}
														>
															{issue.severity.toUpperCase()}
														</span>
														<span className="text-sm text-gray-500 dark:text-gray-400">
															Line {issue.line}
														</span>
														<span className="text-sm text-gray-500 dark:text-gray-400">
															{issue.category}
														</span>
													</div>
												</div>

												<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
													{issue.title}
												</h3>

												<p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
													{issue.description}
												</p>

												<div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
													<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
														<Shield className="h-4 w-4 mr-2" />
														Recommendation:
													</h4>
													<p className="text-blue-700 dark:text-blue-300 leading-relaxed">
														{issue.recommendation}
													</p>
												</div>
											</GlassCard>
										</motion.div>
									))}
								</motion.div>
							)}

							{activeTab === "gas" && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="grid grid-cols-1 lg:grid-cols-2 gap-8"
								>
									<GlassCard className="p-8">
										<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
											Gas Usage
										</h3>
										<div className="text-center">
											<div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
												{auditResult.gasAnalysis.estimatedGas.toLocaleString()}
											</div>
											<div className="text-gray-600 dark:text-gray-400">
												Estimated Gas
											</div>
										</div>
									</GlassCard>

									<GlassCard className="p-8">
										<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
											Optimization Suggestions
										</h3>
										<div className="space-y-4">
											{auditResult.gasAnalysis.optimizationSuggestions.length >
											0 ? (
												auditResult.gasAnalysis.optimizationSuggestions.map(
													(suggestion, index) => (
														<div
															key={index}
															className="flex items-start space-x-3"
														>
															<div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
															<span className="text-gray-700 dark:text-gray-300">
																{suggestion}
															</span>
														</div>
													)
												)
											) : (
												<p className="text-gray-600 dark:text-gray-300">
													No gas optimization suggestions found.
												</p>
											)}
										</div>
									</GlassCard>
								</motion.div>
							)}
						</div>
					</motion.div>
				</div>
			) : (
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						<div className="text-center mb-12">
							<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
								Smart Contract Audit
							</h1>
							<p className="text-xl text-gray-600 dark:text-gray-300">
								Upload your Solidity contract for comprehensive AI-powered
								security analysis
							</p>
						</div>

						<GlassCard className="p-8 md:p-12">
							{isSubmitting ? (
								<div className="text-center py-16">
									<LoadingSpinner
										size="lg"
										text="Analyzing your smart contract..."
									/>
									<div className="mt-12 space-y-4">
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 1 }}
											className="text-sm text-gray-600 dark:text-gray-400"
										>
											🔍 Scanning for vulnerabilities...
										</motion.div>
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 2 }}
											className="text-sm text-gray-600 dark:text-gray-400"
										>
											🛡️ Checking security patterns...
										</motion.div>
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 3 }}
											className="text-sm text-gray-600 dark:text-gray-400"
										>
											📝 Generating comprehensive report...
										</motion.div>
									</div>
								</div>
							) : (
								<form onSubmit={handleSubmit} className="space-y-8">
									{/* Error Display */}
									{error && (
										<div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl">
											{error}
										</div>
									)}

									{/* Wallet Address */}
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
											Wallet Address (Optional)
										</label>
										<input
											type="text"
											name="walletAddress"
											value={formData.walletAddress}
											onChange={handleInputChange}
											placeholder="0x742d35Cc6482C06F25c85Dd7a630B95b9e1234567"
											className="w-full px-4 py-4 glass rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
										/>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
											Provide a wallet address to automatically detect and audit
											deployed contracts
										</p>
									</div>

									{/* Solidity Code */}
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
											Solidity Code *
										</label>
										<textarea
											name="solidityCode"
											value={formData.solidityCode}
											onChange={handleInputChange}
											required
											rows={16}
											placeholder={`pragma solidity ^0.8.0;

contract MyContract {
    // Paste your Solidity code here...
    
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}`}
											className="w-full px-4 py-4 glass rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-mono text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
										/>
									</div>

									{/* Email */}
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
											Email (Optional)
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											placeholder="your@email.com"
											className="w-full px-4 py-4 glass rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
										/>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
											Receive audit results and updates via email
										</p>
									</div>

									{/* Submit Button */}
									<motion.button
										type="submit"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										disabled={!formData.solidityCode.trim()}
										className="w-full flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-glow-lg btn-hover"
									>
										<Shield className="mr-2 h-5 w-5" />
										Run Security Audit
									</motion.button>

									<div className="text-center space-y-2 text-sm text-gray-500 dark:text-gray-400">
										<p>
											🔒 Your code is analyzed securely and never stored
											permanently
										</p>
										<p>⏱️ Average analysis time: 30-60 seconds</p>
										<p>🤖 AI-powered detection with 99.9% accuracy</p>
										<p>Auditing larger contracts may take longer time</p>
									</div>
								</form>
							)}
						</GlassCard>
					</motion.div>
				</div>
			)}
		</div>
	);
};

export default AuditPage;
