import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
	Shield,
	Zap,
	FileText,
	Cloud,
	ArrowRight,
	CheckCircle,
	Star,
	Code,
	Lock,
	Cpu,
	Github,
	Twitter,
	Linkedin,
	Play,
	Sparkles,
	TrendingUp,
	Users,
	Award,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import MouseTracker from "../components/ui/MouseTracker";
import InteractiveCard from "../components/ui/InteractiveCard";

const LandingPage: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const heroRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

	const features = [
		{
			icon: <Cpu className="h-8 w-8" />,
			title: "AI-Powered Analysis",
			description:
				"Advanced machine learning algorithms detect vulnerabilities with 99.9% accuracy, analyzing patterns across millions of smart contracts.",
			gradient: "from-blue-500 to-cyan-500",
		},
		{
			icon: <Shield className="h-8 w-8" />,
			title: "Real-time Security",
			description:
				"Instant vulnerability detection with comprehensive threat analysis and automated security recommendations.",
			gradient: "from-purple-500 to-pink-500",
		},
		{
			icon: <Zap className="h-8 w-8" />,
			title: "Gas Optimization",
			description:
				"Intelligent gas usage analysis with actionable optimization suggestions to reduce transaction costs.",
			gradient: "from-orange-500 to-red-500",
		},
		{
			icon: <FileText className="h-8 w-8" />,
			title: "Detailed Reports",
			description:
				"Professional audit reports with severity ratings, fix recommendations, and compliance verification.",
			gradient: "from-green-500 to-emerald-500",
		},
	];

	const steps = [
		{
			step: "01",
			title: "Upload Contract",
			description:
				"Paste your Solidity code or connect your wallet for automatic contract detection.",
			icon: <Code className="h-8 w-8" />,
			color: "from-blue-500 to-cyan-500",
		},
		{
			step: "02",
			title: "AI Analysis",
			description:
				"Our advanced AI engine performs comprehensive security analysis in real-time.",
			icon: <Cpu className="h-8 w-8" />,
			color: "from-purple-500 to-pink-500",
		},
		{
			step: "03",
			title: "Get Results",
			description:
				"Receive detailed reports with actionable insights and security recommendations.",
			icon: <FileText className="h-8 w-8" />,
			color: "from-green-500 to-emerald-500",
		},
	];

	const testimonials = [
		{
			name: "Alex Chen",
			role: "Lead Developer at DeFiProtocol",
			content:
				"Audit Wolf caught critical vulnerabilities that other tools missed. It saved our protocol from potential exploits worth millions. The AI analysis is incredibly thorough.",
			rating: 5,
			avatar: "AC",
			company: "DeFiProtocol",
		},
		{
			name: "Sarah Kim",
			role: "Security Auditor at BlockSec",
			content:
				"The speed and accuracy are unmatched. What used to take days now takes minutes. Audit Wolf has revolutionized our security workflow.",
			rating: 5,
			avatar: "SK",
			company: "BlockSec",
		},
		{
			name: "Michael Roberts",
			role: "CTO at Web3Ventures",
			content:
				"Fast, reliable, and comprehensive. The gas optimization suggestions alone have saved us thousands in transaction costs.",
			rating: 5,
			avatar: "MR",
			company: "Web3Ventures",
		},
	];

	const stats = [
		{
			value: "10M+",
			label: "Lines Analyzed",
			icon: <Code className="h-5 w-5" />,
		},
		{
			value: "50K+",
			label: "Contracts Audited",
			icon: <Shield className="h-5 w-5" />,
		},
		{
			value: "99.9%",
			label: "Accuracy Rate",
			icon: <Award className="h-5 w-5" />,
		},
		{
			value: "500+",
			label: "Teams Trust Us",
			icon: <Users className="h-5 w-5" />,
		},
	];

	return (
		<div ref={containerRef} className="min-h-screen overflow-hidden relative">
			{/* Mouse Tracker */}
			<MouseTracker />

			{/* Hero Section */}
			<section
				ref={heroRef}
				className="relative min-h-screen flex items-center justify-center overflow-hidden"
			>
				{/* Clean Gradient Background */}
				<div className="absolute inset-0">
					<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/10 dark:to-purple-950/5" />

					{/* Subtle Animated Blobs */}
					<motion.div
						className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
						animate={{
							x: [0, 50, 0],
							y: [0, -30, 0],
							scale: [1, 1.1, 1],
						}}
						transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
						animate={{
							x: [0, -40, 0],
							y: [0, 20, 0],
							scale: [1, 0.9, 1],
						}}
						transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
					/>

					{/* Minimal Floating Particles */}
					{[...Array(20)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
							}}
							animate={{
								y: [0, -50, 0],
								opacity: [0, 0.6, 0],
							}}
							transition={{
								duration: 8 + Math.random() * 4,
								repeat: Infinity,
								delay: Math.random() * 5,
								ease: "easeInOut",
							}}
						/>
					))}
				</div>

				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						{/* Clean Badge */}
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="mb-8"
						>
							<div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-6 group hover:scale-105 transition-all duration-300">
								<Sparkles className="h-4 w-4 text-blue-600 mr-2" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									AI-Powered Smart Contract Security
								</span>
								<ArrowRight className="h-4 w-4 ml-2 text-blue-600 group-hover:translate-x-1 transition-transform" />
							</div>
						</motion.div>

						{/* Clean Typography */}
						<motion.h1
							className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.9] tracking-tight"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.3 }}
						>
							<span className="text-gray-900 dark:text-white">Secure Your</span>
							<br />
							<span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
								Smart Contracts
							</span>
						</motion.h1>

						{/* Clean Subtitle */}
						<motion.p
							className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							AI-powered smart contract auditor that provides comprehensive
							security analysis and generates detailed reports in{" "}
							<span className="text-blue-600 dark:text-blue-400 font-semibold">
								minutes, not days
							</span>
							.
						</motion.p>

						{/* Clean CTA Buttons */}
						<motion.div
							className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.5 }}
						>
							<InteractiveCard intensity={1.5}>
								<Link
									to="/audit"
									className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
								>
									<Shield className="mr-2 h-5 w-5" />
									Run Your First Audit
									<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</Link>
							</InteractiveCard>

							<InteractiveCard>
								<Link
									to="/dashboard"
									className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
								>
									<Play className="mr-2 h-5 w-5" />
									View Dashboard
								</Link>
							</InteractiveCard>
						</motion.div>

						{/* Clean Stats */}
						<motion.div
							className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							{stats.map((stat, index) => (
								<InteractiveCard key={index}>
									<div className="text-center group p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30">
										<div className="flex items-center justify-center mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
											{stat.icon}
										</div>
										<div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
											{stat.value}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											{stat.label}
										</div>
									</div>
								</InteractiveCard>
							))}
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-32 relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-20"
					>
						<div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-6">
							<Zap className="h-4 w-4 text-purple-600 mr-2" />
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Powerful Features
							</span>
						</div>
						<h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
							Everything you need to
							<br />
							<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								secure smart contracts
							</span>
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
							Advanced AI analysis, real-time security monitoring, and
							comprehensive reporting in one powerful platform.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<InteractiveCard className="h-full">
									<div className="p-8 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg">
										<div
											className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
										>
											<div className="text-white">{feature.icon}</div>
										</div>
										<h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
											{feature.title}
										</h3>
										<p className="text-gray-600 dark:text-gray-300 leading-relaxed">
											{feature.description}
										</p>
									</div>
								</InteractiveCard>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-32 relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-20"
					>
						<div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-6">
							<TrendingUp className="h-4 w-4 text-green-600 mr-2" />
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								How It Works
							</span>
						</div>
						<h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
							Security analysis in
							<br />
							<span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
								three simple steps
							</span>
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
							Get comprehensive security analysis without complex setup. From
							upload to report in minutes.
						</p>
					</motion.div>

					<div className="relative">
						{/* Clean Connection Lines */}
						<div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent transform -translate-y-1/2" />

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
							{steps.map((step, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 50 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: index * 0.2 }}
									viewport={{ once: true }}
									className="relative"
								>
									<InteractiveCard className="h-full">
										<div className="p-8 text-center h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg">
											{/* Step Number */}
											<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
												<div
													className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
												>
													{index + 1}
												</div>
											</div>

											{/* Icon */}
											<motion.div
												className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
												whileHover={{ rotate: 5 }}
											>
												<div className="text-white">{step.icon}</div>
											</motion.div>

											<h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
												{step.title}
											</h3>
											<p className="text-gray-600 dark:text-gray-300 leading-relaxed">
												{step.description}
											</p>
										</div>
									</InteractiveCard>

									{/* Clean Arrow */}
									{index < steps.length - 1 && (
										<div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
											<motion.div
												animate={{ x: [0, 5, 0] }}
												transition={{ duration: 2, repeat: Infinity }}
												className="w-12 h-12 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg flex items-center justify-center"
											>
												<ArrowRight className="h-5 w-5 text-blue-600" />
											</motion.div>
										</div>
									)}
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-32 relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-20"
					>
						<div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-6">
							<Users className="h-4 w-4 text-yellow-600 mr-2" />
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Testimonials
							</span>
						</div>
						<h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
							Trusted by thousands of
							<br />
							<span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
								Web3 developers
							</span>
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
							Join the community of developers and security teams who trust
							Audit Wolf to secure their smart contracts.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<InteractiveCard className="h-full">
									<div className="p-8 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg">
										{/* Stars */}
										<div className="flex mb-6">
											{[...Array(testimonial.rating)].map((_, i) => (
												<Star
													key={i}
													className="h-5 w-5 text-yellow-500 fill-current"
												/>
											))}
										</div>

										{/* Quote */}
										<p className="text-gray-600 dark:text-gray-300 mb-8 italic leading-relaxed text-lg">
											"{testimonial.content}"
										</p>

										{/* Author */}
										<div className="flex items-center">
											<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-4 group-hover:scale-110 transition-transform">
												{testimonial.avatar}
											</div>
											<div>
												<p className="font-semibold text-gray-900 dark:text-white">
													{testimonial.name}
												</p>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{testimonial.role}
												</p>
												<p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
													{testimonial.company}
												</p>
											</div>
										</div>
									</div>
								</InteractiveCard>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-32 relative">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<InteractiveCard intensity={1.2}>
							<div className="p-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl relative overflow-hidden">
								<div className="relative z-10">
									<motion.div
										animate={{ rotate: [0, 360] }}
										transition={{
											duration: 20,
											repeat: Infinity,
											ease: "linear",
										}}
										className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-8 shadow-lg"
									>
										<Shield className="h-8 w-8 text-white" />
									</motion.div>

									<h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
										Ready to secure your
										<br />
										<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
											smart contracts?
										</span>
									</h2>
									<p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
										Join thousands of developers who trust Audit Wolf to keep
										their smart contracts secure and optimized.
									</p>

									<InteractiveCard intensity={2}>
										<Link
											to="/audit"
											className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
										>
											<Shield className="mr-2 h-5 w-5" />
											Start Your First Audit
											<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
										</Link>
									</InteractiveCard>
								</div>
							</div>
						</InteractiveCard>
					</motion.div>
				</div>
			</section>

			{/* Clean Footer */}
			<footer className="relative border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						{/* Logo & Description */}
						<div className="col-span-1 md:col-span-2">
							<div className="flex items-center space-x-3 mb-6">
								<motion.div
									whileHover={{ rotate: 360 }}
									transition={{ duration: 0.6 }}
									className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
								>
									<Shield className="h-6 w-6 text-white" />
								</motion.div>
								<span className="text-2xl font-bold text-gray-900 dark:text-white">
									Audit Wolf
								</span>
							</div>
							<p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md leading-relaxed">
								AI-powered smart contract auditor that provides comprehensive
								security analysis and reports for Solidity contracts. Secure
								your DeFi projects with confidence.
							</p>
							<div className="flex space-x-4">
								{[
									{ icon: <Twitter className="h-5 w-5" />, href: "#" },
									{ icon: <Github className="h-5 w-5" />, href: "#" },
									{ icon: <Linkedin className="h-5 w-5" />, href: "#" },
								].map((social, index) => (
									<InteractiveCard key={index}>
										<a
											href={social.href}
											className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-lg"
										>
											{social.icon}
										</a>
									</InteractiveCard>
								))}
							</div>
						</div>

						{/* Product Links */}
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white mb-6">
								Product
							</h3>
							<ul className="space-y-3">
								{[
									{ label: "Run Audit", href: "/audit" },
									{ label: "Dashboard", href: "/dashboard" },
									{ label: "API Reference", href: "#" },
									{ label: "Documentation", href: "#" },
								].map((link, index) => (
									<li key={index}>
										<Link
											to={link.href}
											className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Support Links */}
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white mb-6">
								Support
							</h3>
							<ul className="space-y-3">
								{[
									{ label: "Help Center", href: "#" },
									{ label: "Contact Us", href: "#" },
									{ label: "Privacy Policy", href: "#" },
									{ label: "Terms of Service", href: "#" },
								].map((link, index) => (
									<li key={index}>
										<a
											href={link.href}
											className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-8 mt-12">
						<div className="flex flex-col md:flex-row justify-between items-center">
							<p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-0">
								© 2025 Audit Wolf. All rights reserved. Built with security in
								mind.
							</p>
							<div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
								<span>Made with</span>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ duration: 1, repeat: Infinity }}
								>
									❤️
								</motion.div>
								<span>for Web3 security</span>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
