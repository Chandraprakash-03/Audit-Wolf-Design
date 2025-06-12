import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Shield, ArrowRight } from "lucide-react";
import { supabase } from "../db/supabase";
import GlassCard from "../components/ui/GlassCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import MouseTracker from "../components/ui/MouseTracker";

const ForgotPasswordPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});

		setIsLoading(false);

		if (error) {
			setError(
				error.message || "Failed to send reset email. Please try again."
			);
		} else {
			setSuccess("Password reset email sent! Check your inbox.");
			setTimeout(() => navigate("/login"), 3000);
		}
	};

	return (
		<div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
			<MouseTracker />
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-950 dark:via-primary-950/20 dark:to-secondary-950/20">
				{[...Array(20)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 bg-primary-400/20 rounded-full"
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

			<div className="relative z-10 w-full max-w-md px-4">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					{/* Logo & Title */}
					<div className="text-center mb-8">
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.6 }}
							className="flex justify-center mb-6"
						>
							<div className="p-4 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-glow">
								<Shield className="h-8 w-8 text-white" />
							</div>
						</motion.div>
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
							Reset Password
						</h1>
						<p className="text-gray-600 dark:text-gray-300">
							Enter your email to receive a password reset link
						</p>
					</div>

					<GlassCard className="p-8">
						<form onSubmit={handleSubmit} className="space-y-6">
							{error && (
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm"
								>
									{error}
								</motion.div>
							)}
							{success && (
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl text-green-700 dark:text-green-300 text-sm"
								>
									{success}
								</motion.div>
							)}

							{/* Email */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
									Email Address
								</label>
								<div className="relative">
									<Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										placeholder="your@email.com"
										className="w-full pl-12 pr-4 py-4 glass rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
									/>
								</div>
							</div>

							{/* Submit Button */}
							<motion.button
								type="submit"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								disabled={isLoading}
								className="w-full flex items-center justify-center px-6 py-4 text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-glow-lg btn-hover"
							>
								{isLoading ? (
									<LoadingSpinner size="sm" />
								) : (
									<>
										Send Reset Link
										<ArrowRight className="ml-2 h-5 w-5" />
									</>
								)}
							</motion.button>
						</form>

						{/* Back to Login */}
						<div className="text-center mt-6">
							<Link
								to="/login"
								className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
							>
								Back to Sign In
							</Link>
						</div>
					</GlassCard>
				</motion.div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
