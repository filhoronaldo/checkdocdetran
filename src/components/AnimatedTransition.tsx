
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedTransitionProps {
  children: ReactNode;
  className?: string;
  animation?: "fade" | "slide-up" | "slide-down" | "scale" | "bounce";
  delay?: number;
}

export default function AnimatedTransition({
  children,
  className = "",
  animation = "fade",
  delay = 0,
}: AnimatedTransitionProps) {
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3, delay }
    },
    "slide-up": {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: { duration: 0.4, delay }
    },
    "slide-down": {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.4, delay }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.3, delay }
    },
    bounce: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration: 0.5,
          delay,
          type: "spring",
          stiffness: 150,
          damping: 15
        } 
      },
      exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    }
  };

  return (
    <motion.div
      className={className}
      {...animations[animation]}
      layout
    >
      {children}
    </motion.div>
  );
}
