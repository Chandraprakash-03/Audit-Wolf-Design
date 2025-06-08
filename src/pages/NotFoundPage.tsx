import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Shield, Search } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import MouseTracker from "../components/ui/MouseTracker";

const NotFoundPage: React.FC = () => {
	return (
		<div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
			<MouseTracker />
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-950 dark:via-primary-950/20 dark:to-secondary-950/20">
				{[...Array(15)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 bg-primary-400/20 rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							y: [0, -30, 0],
							opacity: [0.2, 0.5, 0.2],
						}}
						transition={{
							duration: 4 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2,
						}}
					/>
				))}
			</div>

			<div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<GlassCard className="p-12 md:p-16">
						{/* Animated 404 */}
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="mb-8"
						>
							<div className="text-8xl md:text-9xl font-bold gradient-text mb-4">
								404
							</div>

							{/* Floating Search Icon */}
							<motion.div
								animate={{
									y: [0, -10, 0],
									rotate: [0, 5, -5, 0],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="inline-block"
							>
								<Search className="h-16 w-16 text-primary-400/50 mx-auto" />
							</motion.div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							<h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
								Page Not Found
							</h1>

							<p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-md mx-auto leading-relaxed">
								The page you're looking for seems to have vanished into the
								blockchain. Let's get you back to securing smart contracts.
							</p>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="btn-hover"
								>
									<Link
										to="/"
										className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-glow-lg"
									>
										<Home className="mr-2 h-5 w-5" />
										Go Home
									</Link>
								</motion.div>

								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="btn-hover"
								>
									<button
										onClick={() => window.history.back()}
										className="inline-flex items-center px-6 py-3 glass rounded-xl hover:shadow-glow transition-all duration-300 text-gray-700 dark:text-gray-300"
									>
										<ArrowLeft className="mr-2 h-5 w-5" />
										Go Back
									</button>
								</motion.div>
							</div>

							{/* Help Section */}
							<div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
								<div className="flex items-center justify-center space-x-2 mb-6">
									<Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Need help securing your contracts?
									</span>
								</div>

								<div className="flex flex-wrap justify-center gap-6 text-sm">
									<Link
										to="/audit"
										className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium"
									>
										Run an Audit
									</Link>
									<Link
										to="/dashboard"
										className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium"
									>
										View Dashboard
									</Link>
									<a
										href="#"
										className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium"
									>
										Contact Support
									</a>
								</div>
							</div>
						</motion.div>
					</GlassCard>
				</motion.div>
			</div>
		</div>
	);
};

export default NotFoundPage;
