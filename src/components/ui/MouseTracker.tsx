import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
} from "react";
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

interface Particle {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	size: number;
	hue: number;
	brightness: number;
	timestamp: number;
}

// Optimized constants - balanced for performance vs visuals
const TRAIL_POINTS = 15;
const INTERPOLATION_POINTS = 2;
const MAX_PARTICLES = 45;
const PARTICLE_SPAWN_RATE = 0.4;
const MIN_VELOCITY_FOR_BURST = 12;
const BURST_COOLDOWN = 120;
const UPDATE_THROTTLE = 16; // ~60fps max
const PARTICLE_UPDATE_THROTTLE = 32; // ~30fps for particles

const MouseTracker: React.FC = () => {
	const [mousePosition, setMousePosition] = useState<MousePosition>({
		x: 0,
		y: 0,
	});
	const [trail, setTrail] = useState<TrailPoint[]>([]);
	const [particles, setParticles] = useState<Particle[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const [isOverInteractive, setIsOverInteractive] = useState(false);

	const trailIdRef = useRef(0);
	const particleIdRef = useRef(0);
	const prevPosition = useRef({ x: 0, y: 0 });
	const lastBurstTime = useRef(0);
	const lastUpdateTime = useRef(0);
	const lastParticleUpdate = useRef(0);

	// Check if mouse is over interactive elements
	const checkInteractiveElement = useCallback((target: Element | null) => {
		if (!target) return false;

		// Check if element or any parent is interactive
		let element = target as Element;
		while (element && element !== document.body) {
			const tagName = element.tagName.toLowerCase();
			const role = element.getAttribute("role");
			const isClickable =
				element.hasAttribute("onclick") ||
				element.classList.contains("cursor-pointer") ||
				window.getComputedStyle(element).cursor === "pointer";

			if (
				tagName === "a" ||
				tagName === "button" ||
				tagName === "input" ||
				tagName === "textarea" ||
				tagName === "select" ||
				role === "button" ||
				isClickable
			) {
				return true;
			}
			element = element.parentElement as Element;
		}
		return false;
	}, []);

	// Memoized particle creation to avoid recreation
	const createParticleBurst = useCallback(
		(x: number, y: number, velocity: number, baseHue: number) => {
			const burstIntensity = Math.min(velocity * 0.06, 1.6);
			const particleCount = Math.floor(burstIntensity * 3 + 2);

			const newParticles: Particle[] = [];

			for (let i = 0; i < particleCount; i++) {
				const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
				const speed = (Math.random() * 2 + 0.8) * burstIntensity;
				const life = Math.random() * 35 + 20;

				newParticles.push({
					id: particleIdRef.current++,
					x: x + (Math.random() - 0.5) * 7,
					y: y + (Math.random() - 0.5) * 7,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					life: life,
					maxLife: life,
					size: Math.random() * 2.5 + 1.5,
					hue: (baseHue + Math.random() * 40 - 20) % 360,
					brightness: Math.random() * 18 + 62,
					timestamp: Date.now(),
				});
			}

			return newParticles;
		},
		[]
	);

	// Throttled particle update
	const updateParticles = useCallback(() => {
		const now = Date.now();
		if (now - lastParticleUpdate.current < PARTICLE_UPDATE_THROTTLE) return;
		lastParticleUpdate.current = now;

		setParticles((prevParticles) => {
			if (prevParticles.length === 0) return prevParticles;

			return prevParticles
				.map((particle) => ({
					...particle,
					x: particle.x + particle.vx,
					y: particle.y + particle.vy,
					vx: particle.vx * 0.96,
					vy: particle.vy * 0.96 + 0.08,
					life: particle.life - 1.3,
				}))
				.filter((particle) => particle.life > 0);
		});
	}, []);

	// Memoized trail cleanup
	const cleanupTrail = useCallback(() => {
		const now = Date.now();
		setTrail((prevTrail) =>
			prevTrail.filter((point) => now - point.timestamp < 600)
		);
	}, []);

	useEffect(() => {
		let animationFrame: number;
		let particleAnimationFrame: number;

		const updateMousePosition = (e: MouseEvent) => {
			const now = Date.now();

			// Check if mouse is over interactive element
			const isInteractive = checkInteractiveElement(e.target as Element);
			setIsOverInteractive(isInteractive);

			// Throttle updates
			if (now - lastUpdateTime.current < UPDATE_THROTTLE) return;
			lastUpdateTime.current = now;

			const newPosition = { x: e.clientX, y: e.clientY };
			setMousePosition(newPosition);
			setIsVisible(true);

			// Skip particle effects if over interactive elements
			if (isInteractive) return;

			const velocityX = newPosition.x - prevPosition.current.x;
			const velocityY = newPosition.y - prevPosition.current.y;
			const velocity = Math.sqrt(velocityX ** 2 + velocityY ** 2);

			// Optimized particle burst logic
			const timeSinceLastBurst = now - lastBurstTime.current;

			if (
				velocity > MIN_VELOCITY_FOR_BURST &&
				timeSinceLastBurst > BURST_COOLDOWN &&
				Math.random() < PARTICLE_SPAWN_RATE
			) {
				const baseHue =
					(newPosition.x + newPosition.y + velocity * 2 + now * 0.05) % 360;
				const burstParticles = createParticleBurst(
					newPosition.x,
					newPosition.y,
					velocity,
					baseHue
				);

				setParticles((prevParticles) => {
					const combined = [...prevParticles, ...burstParticles];
					return combined.slice(-MAX_PARTICLES);
				});

				lastBurstTime.current = now;
			}

			// Reduced interpolation
			const interpolatedPoints: TrailPoint[] = [];
			for (let i = 1; i <= INTERPOLATION_POINTS; i++) {
				const fraction = i / INTERPOLATION_POINTS;
				interpolatedPoints.push({
					x: prevPosition.current.x + velocityX * fraction,
					y: prevPosition.current.y + velocityY * fraction,
					id: trailIdRef.current++,
					timestamp: now - (1 - fraction) * 16,
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
			setIsOverInteractive(false);
		};

		const animate = () => {
			cleanupTrail();
			animationFrame = requestAnimationFrame(animate);
		};

		const animateParticles = () => {
			updateParticles();
			particleAnimationFrame = requestAnimationFrame(animateParticles);
		};

		window.addEventListener("mousemove", updateMousePosition, {
			passive: true,
		});
		window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
		animationFrame = requestAnimationFrame(animate);
		particleAnimationFrame = requestAnimationFrame(animateParticles);

		return () => {
			window.removeEventListener("mousemove", updateMousePosition);
			window.removeEventListener("mouseleave", handleMouseLeave);
			cancelAnimationFrame(animationFrame);
			cancelAnimationFrame(particleAnimationFrame);
		};
	}, [
		createParticleBurst,
		updateParticles,
		cleanupTrail,
		checkInteractiveElement,
	]);

	// Memoized particle styles to prevent recalculation
	const particleElements = useMemo(
		() =>
			particles.map((particle) => {
				const lifeRatio = particle.life / particle.maxLife;
				const opacity = Math.pow(lifeRatio, 0.65) * 0.7;
				const scale = (1 - Math.pow(1 - lifeRatio, 2)) * particle.size;

				const saturation = 80;
				const lightness = 65;

				return (
					<motion.div
						key={particle.id}
						className="absolute rounded-full pointer-events-none will-change-transform"
						style={{
							left: particle.x - particle.size / 2,
							top: particle.y - particle.size / 2,
							width: particle.size,
							height: particle.size,
							background: `radial-gradient(circle, 
							hsla(${particle.hue}, ${saturation}%, ${lightness}%, ${opacity}) 0%,
							hsla(${(particle.hue + 15) % 360}, ${saturation - 10}%, ${lightness - 15}%, ${
								opacity * 0.6
							}) 50%,
							transparent 100%)`,
							filter: `blur(${Math.max(0.5, particle.size * 0.15)}px)`,
							boxShadow: `0 0 ${particle.size * 1.5}px hsla(${
								particle.hue
							}, ${saturation}%, ${lightness}%, ${opacity * 0.3})`,
						}}
						animate={{
							scale: scale,
							opacity: opacity,
						}}
						transition={{
							duration: 0.08,
							ease: "easeOut",
						}}
					/>
				);
			}),
		[particles]
	);

	// Memoized trail elements
	const trailElements = useMemo(
		() =>
			trail
				.map((point, index) => {
					const age = (Date.now() - point.timestamp) / 1000;
					const opacity = Math.max(0, 1 - age * 2.8);

					if (opacity < 0.05) return null;

					const velocity = Math.sqrt(
						point.velocityX ** 2 + point.velocityY ** 2
					);
					const baseScale = Math.min(1 + velocity * 0.012, 1.8);
					const positionScale = 1 - index / TRAIL_POINTS;
					const scale = baseScale * positionScale * Math.max(0.1, 1 - age);

					const hue =
						(point.x + point.y + velocity * 2 + Date.now() * 0.05) % 360;
					const saturation = Math.min(70 + velocity * 0.4, 85);
					const lightness = Math.max(60 - velocity * 0.2, 45);

					return (
						<motion.div
							key={point.id}
							className="absolute rounded-full pointer-events-none will-change-transform"
							style={{
								left: point.x - 2.5,
								top: point.y - 2.5,
								width: 5,
								height: 5,
								background: `radial-gradient(circle, 
							hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity}) 0%,
							hsla(${(hue + 15) % 360}, ${saturation}%, ${lightness - 8}%, ${
									opacity * 0.4
								}) 60%,
							transparent 100%)`,
								filter: `blur(${2.5 + velocity * 0.08}px)`,
							}}
							initial={{ scale: 0, opacity: 0 }}
							animate={{
								scale: scale,
								opacity: opacity,
							}}
							transition={{
								duration: 0.1,
								ease: "easeOut",
							}}
						/>
					);
				})
				.filter(Boolean),
		[trail]
	);

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 pointer-events-none z-50">
			{/* Only show particles and trail when not over interactive elements */}
			{!isOverInteractive && (
				<>
					{/* Optimized Particle System */}
					{particleElements}

					{/* Optimized Trail */}
					{trailElements}
				</>
			)}

			{/* Simplified cursor glow - always visible but reduced when over interactive elements */}
			<motion.div
				className="absolute w-6 h-6 rounded-full pointer-events-none will-change-transform"
				style={{
					left: mousePosition.x - 12,
					top: mousePosition.y - 12,
					background: isOverInteractive
						? "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)"
						: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.25) 40%, transparent 70%)",
					filter: "blur(5px)",
					opacity: isOverInteractive ? 0.5 : 1,
				}}
				animate={{
					scale: isOverInteractive ? [0.8, 0.9, 0.8] : [1, 1.08, 1],
					opacity: isOverInteractive ? [0.3, 0.5, 0.3] : [0.4, 0.6, 0.4],
				}}
				transition={{
					duration: 2.2,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Inner cursor (Tilted Triangle) - hidden when over interactive elements */}
			{!isOverInteractive && (
				<motion.div
					className="absolute pointer-events-none will-change-transform"
					style={{
						left: mousePosition.x - 8,
						top: mousePosition.y - 14,
						width: 18,
						height: 20,
						clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
						background:
							"linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(99, 102, 241, 0.8))",
						boxShadow: "0 0 14px rgba(99, 102, 241, 0.5)",
						transform: "rotate(-25deg)",
					}}
				/>
			)}

			{/* Primary ambient glow - reduced when over interactive elements */}
			<motion.div
				className="absolute w-28 h-28 rounded-full pointer-events-none will-change-transform"
				style={{
					left: mousePosition.x - 56,
					top: mousePosition.y - 56,
					background: `radial-gradient(circle, 
						hsla(270, 55%, 60%, ${isOverInteractive ? 0.04 : 0.08}) 0%, 
						hsla(300, 65%, 50%, ${isOverInteractive ? 0.02 : 0.04}) 50%, 
						transparent 80%)`,
					filter: "blur(18px)",
				}}
				animate={{
					scale: isOverInteractive ? [0.8, 0.9, 0.8] : [1, 1.1, 1],
					opacity: isOverInteractive ? [0.15, 0.25, 0.15] : [0.25, 0.4, 0.25],
				}}
				transition={{
					duration: 2.8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Secondary ambient glow - reduced when over interactive elements */}
			<motion.div
				className="absolute w-40 h-40 rounded-full pointer-events-none will-change-transform"
				style={{
					left: mousePosition.x - 80,
					top: mousePosition.y - 80,
					background: `radial-gradient(circle, 
						hsla(240, 60%, 70%, ${isOverInteractive ? 0.03 : 0.06}) 0%, 
						hsla(270, 70%, 60%, ${isOverInteractive ? 0.015 : 0.03}) 60%, 
						transparent 90%)`,
					filter: "blur(24px)",
				}}
				animate={{
					scale: isOverInteractive ? [0.8, 0.95, 0.8] : [1, 1.15, 1],
					opacity: isOverInteractive ? [0.1, 0.2, 0.1] : [0.15, 0.3, 0.15],
				}}
				transition={{
					duration: 3.5,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		</div>
	);
};

export default MouseTracker;
