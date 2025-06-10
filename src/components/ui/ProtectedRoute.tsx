import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	redirectPath = "/login",
}) => {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
			</div>
		);
	}

	if (!user) {
		// Preserve the attempted location for redirect after login
		return <Navigate to={redirectPath} replace state={{ from: location }} />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
