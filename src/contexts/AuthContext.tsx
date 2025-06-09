import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { supabase } from "../db/supabase";

interface User {
	id: string;
	email: string;
	name?: string;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<boolean>;
	signup: (email: string, password: string, name: string) => Promise<boolean>;
	logout: () => void;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Get active user on mount
	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (user) {
				setUser({
					id: user.id,
					email: user.email!,
					name: user.user_metadata?.name || "",
				});
			}
			setIsLoading(false);
		};

		getUser();

		// Listen to auth changes
		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				const u = session?.user;
				if (u) {
					setUser({
						id: u.id,
						email: u.email!,
						name: u.user_metadata?.name || "",
					});
				} else {
					setUser(null);
				}
			}
		);

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	const login = async (email: string, password: string): Promise<boolean> => {
		setIsLoading(true);
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		setIsLoading(false);

		if (error || !data.user) return false;

		setUser({
			id: data.user.id,
			email: data.user.email!,
			name: data.user.user_metadata?.name || "",
		});
		return true;
	};

	const signup = async (
		email: string,
		password: string,
		name: string
	): Promise<boolean> => {
		setIsLoading(true);
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { name },
			},
		});
		setIsLoading(false);

		if (error || !data.user) return false;

		setUser({
			id: data.user.id,
			email: data.user.email!,
			name,
		});
		return true;
	};

	const logout = async () => {
		await supabase.auth.signOut();
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
};
