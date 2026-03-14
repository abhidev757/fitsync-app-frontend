import type React from "react"

interface ProgressCircleProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}

const ProgressCircle = ({
  percentage,
  size = 100,
  strokeWidth = 8,
  color = "#CCFF00",
  children,
}: ProgressCircleProps) => {
  // Ensure percentage is clamped between 0 and 100 for visual accuracy
  // though we allow it to look "full" if they exceed the goal.
  const displayPercentage = Math.min(Math.max(percentage, 0), 100)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayPercentage / 100) * circumference

  return (
    <div 
      className="relative inline-flex items-center justify-center group"
      style={{ width: size, height: size }}
    >
      {/* Tactical HUD Glow - pulses slightly on hover */}
      <div className="absolute inset-0 rounded-full blur-2xl opacity-5 bg-[#CCFF00] group-hover:opacity-15 transition-opacity duration-700 pointer-events-none"></div>
      
      <svg 
        className="transform -rotate-90 relative z-10 overflow-visible" 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Deep Obsidian Background Track */}
        <circle
          className="text-[#0D1117]"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Neon Pulse Layer (Subtle Under-glow) */}
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="opacity-20 blur-[2px]"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Primary Data Stream Bar */}
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: `drop-shadow(0 0 6px ${color}88)`,
          }}
        />
      </svg>

      {/* Center Intelligence Display */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        {children}
      </div>
    </div>
  )
}

export default ProgressCircle