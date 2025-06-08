import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MousePosition {
	x: number;
	y: number;
}

interface TrailPoint extends MousePosition {
	id: number;
	timestamp: number;
	velocityX: number;
	velocityY: number;
}

const TRAIL_POINTS = 25;
const INTERPOLATION_POINTS = 5;

const MouseTracker: React.FC = () => {
	const [mousePosition, setMousePosition] = useState<MousePosition>({
		x: 0,
		y: 0,
	});
	const [trail, setTrail] = useState<TrailPoint[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const trailIdRef = useRef(0);
	const prevPosition = useRef({ x: 0, y: 0 });

	useEffect(() => {
		let animationFrame: number;

		const updateMousePosition = (e: MouseEvent) => {
			const newPosition = { x: e.clientX, y: e.clientY };
			setMousePosition(newPosition);
			setIsVisible(true);

			// Calculate velocity
			const velocityX = newPosition.x - prevPosition.current.x;
			const velocityY = newPosition.y - prevPosition.current.y;

			// Create interpolated points between previous and current position
			const interpolatedPoints: TrailPoint[] = [];
			for (let i = 1; i <= INTERPOLATION_POINTS; i++) {
				const fraction = i / INTERPOLATION_POINTS;
				const interpolatedX = prevPosition.current.x + velocityX * fraction;
				const interpolatedY = prevPosition.current.y + velocityY * fraction;

				interpolatedPoints.push({
					x: interpolatedX,
					y: interpolatedY,
					id: trailIdRef.current++,
					timestamp: Date.now() - (1 - fraction) * 16, // Offset timestamp for smooth fade
					velocityX: velocityX * fraction,
					velocityY: velocityY * fraction,
				});
			}

			setTrail((prevTrail) => {
				const updatedTrail = [...interpolatedPoints, ...prevTrail];
				return updatedTrail.slice(0, TRAIL_POINTS);
			});

			prevPosition.current = newPosition;
		};

		const handleMouseLeave = () => {
			setIsVisible(false);
		};

		const cleanupTrail = () => {
			const now = Date.now();
			setTrail((prevTrail) =>
				prevTrail.filter((point) => now - point.timestamp < 1000)
			);
			animationFrame = requestAnimationFrame(cleanupTrail);
		};

		window.addEventListener("mousemove", updateMousePosition);
		window.addEventListener("mouseleave", handleMouseLeave);
		animationFrame = requestAnimationFrame(cleanupTrail);

		return () => {
			window.removeEventListener("mousemove", updateMousePosition);
			window.removeEventListener("mouseleave", handleMouseLeave);
			cancelAnimationFrame(animationFrame);
		};
	}, []);

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 pointer-events-none z-50">
			{/* Main cursor glow */}
			<motion.div
				className="absolute w-8 h-8 rounded-full pointer-events-none"
				style={{
					left: mousePosition.x - 16,
					top: mousePosition.y - 16,
					background:
						"radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(139, 92, 246, 0.4) 30%, rgba(236, 72, 153, 0.2) 60%, transparent 100%)",
					filter: "blur(8px)",
				}}
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.6, 0.8, 0.6],
				}}
				transition={{
					duration: 2,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Inner cursor */}
			<motion.div
				className="absolute w-3 h-3 rounded-full pointer-events-none"
				style={{
					left: mousePosition.x - 6,
					top: mousePosition.y - 6,
					background:
						"radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(99, 102, 241, 0.8) 100%)",
					boxShadow: "0 0 20px rgba(99, 102, 241, 0.6)",
				}}
			/>

			{/* Trail points */}
			{trail.map((point, index) => {
				const age = (Date.now() - point.timestamp) / 1000;
				const opacity = Math.max(0, 1 - age * 2); // Faster fade out

				// Dynamic scale based on velocity and trail position
				const velocity = Math.sqrt(point.velocityX ** 2 + point.velocityY ** 2);
				const baseScale = Math.min(1 + velocity * 0.02, 2.5);
				const positionScale = 1 - index / TRAIL_POINTS;
				const scale = baseScale * positionScale * Math.max(0.1, 1 - age);

				// Dynamic color based on velocity and position
				const hue = (point.x + point.y + velocity * 3 + Date.now() * 0.1) % 360;
				const saturation = Math.min(80 + velocity, 100);
				const lightness = Math.max(60 - velocity, 40);

				return (
					<motion.div
						key={point.id}
						className="absolute rounded-full pointer-events-none"
						style={{
							left: point.x - 4,
							top: point.y - 4,
							width: 8,
							height: 8,
							background: `radial-gradient(circle, 
                    hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity}) 0%,
                    hsla(${(hue + 30) % 360}, ${saturation}%, ${
								lightness - 10
							}%, ${opacity * 0.5}) 50%,
                    transparent 100%)`,
							filter: `blur(${4 + velocity * 0.2}px)`,
							transform: `rotate(${Math.atan2(
								point.velocityY,
								point.velocityX
							)}rad)`,
						}}
						initial={{ scale: 0, opacity: 0 }}
						animate={{
							scale: scale,
							opacity: opacity,
						}}
						transition={{
							duration: 0.15,
							ease: "easeOut",
						}}
					/>
				);
			})}

			{/* Enhanced ambient glow effect */}
			{(() => {
				// Use the latest trail point's hue if available, otherwise fallback to a default
				const latestPoint = trail[0];
				const ambientHue = latestPoint
					? (latestPoint.x +
							latestPoint.y +
							Math.sqrt(
								latestPoint.velocityX ** 2 + latestPoint.velocityY ** 2
							) *
								3 +
							Date.now() * 0.1) %
					  360
					: 270; // fallback hue

				return (
					<motion.div
						className="absolute w-40 h-40 rounded-full pointer-events-none"
						style={{
							left: mousePosition.x - 80,
							top: mousePosition.y - 80,
							background: `radial-gradient(circle, 
							hsla(${(ambientHue + 0) % 360}, 70%, 70%, 0.15) 0%, 
							hsla(${(ambientHue + 60) % 360}, 80%, 60%, 0.1) 40%, 
							transparent 70%)`,
							filter: "blur(24px)",
						}}
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.4, 0.6, 0.4],
						}}
						transition={{
							duration: 2.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				);
			})()}
		</div>
	);
};

export default MouseTracker;
