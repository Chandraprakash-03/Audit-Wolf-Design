import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const BoltBadge: React.FC = () => {
	const { theme } = useTheme();

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5, delay: 1 }}
			className="fixed bottom-4 right-4 z-40"
		>
			<a
				href="https://bolt.new"
				target="_blank"
				rel="noopener noreferrer"
				className="block w-16 h-16 md:w-20 md:h-20 pointer-events-auto"
			>
				<motion.div
					whileHover={{ scale: 1.05 }}
					transition={{ duration: 0.2 }}
					className="w-full h-full"
				>
					<img
						src={
							theme === "dark"
								? "/white_circle_360x360.png"
								: "/black_circle_360x360.png"
						}
						alt="Powered by Bolt"
						className="w-full h-full object-contain drop-shadow-lg"
					/>
				</motion.div>
			</a>
		</motion.div>
	);
};

export default BoltBadge;
