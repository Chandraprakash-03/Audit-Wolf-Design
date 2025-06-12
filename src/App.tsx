import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Layout/Navbar";
import LandingPage from "./pages/LandingPage";
import AuditPage from "./pages/AuditPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ui/ProtectedRoute";

function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<Router>
					<div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-50 dark:from-gray-950 dark:via-primary-950/20 dark:to-secondary-950/20 transition-colors duration-300">
						<Navbar />

						<AnimatePresence mode="wait">
							<Routes>
								<Route path="/" element={<LandingPage />} />
								<Route path="/login" element={<LoginPage />} />
								<Route path="/signup" element={<SignupPage />} />
								<Route path="/reset-password" element={<ResetPasswordPage />} />
								<Route
									path="/forgot-password"
									element={<ForgotPasswordPage />}
								/>
								<Route
									path="/audit"
									element={
										<ProtectedRoute>
											<AuditPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/dashboard"
									element={
										<ProtectedRoute>
											<DashboardPage />
										</ProtectedRoute>
									}
								/>
								<Route path="*" element={<NotFoundPage />} />
							</Routes>
						</AnimatePresence>
						<SpeedInsights />
						<Analytics />
					</div>
				</Router>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
