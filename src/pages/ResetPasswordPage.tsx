import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "../db/supabase";
import GlassCard from "../components/ui/GlassCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import MouseTracker from "../components/ui/MouseTracker";

const ResetPasswordPage: React.FC = () => {
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();
	const location = useLocation();

	// Check URL for access_token on mount
	useEffect(() => {
		const params = new URLSearchParams(location.hash.replace("#", ""));
		const token = params.get("access_token");

		if (!token) {
			setError(
				"Invalid or missing reset token. Please request a new reset link."
			);
		}
	}, [location]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters long");
			setIsLoading(false);
			return;
		}

		const { error } = await supabase.auth.updateUser({
			password: formData.password,
		});

		setIsLoading(false);

		if (error) {
			setError(error.message || "Failed to reset password. Please try again.");
		} else {
			setSuccess("Password reset successfully! Redirecting to login...");
			setTimeout(() => navigate("/login"), 3000);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
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
							Set New Password
						</h1>
						<p className="text-gray-600 dark:text-gray-300">
							Enter your new password to continue
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

							{/* New Password */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									New Password
								</label>
								<div className="relative">
									<Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										required
										placeholder="••••••••"
										className="w-full pl-12 pr-12 py-4 glass rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
								</div>
							</div>

							{/* Confirm Password */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
									Confirm New Password
								</label>
								<div className="relative">
									<Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
									<input
										type={showConfirmPassword ? "text" : "password"}
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleInputChange}
										required
										placeholder="••••••••"
										className="w-full pl-12 pr-12 py-4 glass rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
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
										Reset Password
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

export default ResetPasswordPage;
