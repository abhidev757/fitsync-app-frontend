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
  color = "#CCFF00", // Updated to Elite Hybrid Electric Lime
  children,
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center group">
      {/* Outer Glow Effect (Optional/Subtle) */}
      <div className="absolute inset-0 rounded-full blur-xl opacity-10 bg-[#CCFF00] transition-opacity group-hover:opacity-20 pointer-events-none"></div>
      
      <svg className="transform -rotate-90 relative z-10" width={size} height={size}>
        {/* Background Track */}
        <circle
          className="text-gray-900" // Deeper obsidian track
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Bar */}
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
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: `drop-shadow(0 0 4px ${color}66)`, // Subtle neon glow
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        {children}
      </div>
    </div>
  )
}

export default ProgressCircle