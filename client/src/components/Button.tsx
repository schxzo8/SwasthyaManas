import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-sans";

  const variants = {
    primary:
      "bg-[#7C9A82] text-[#FAF7F2] hover:bg-[#5A7A60] focus:ring-[#7C9A82] shadow-md hover:shadow-lg",
    secondary:
      "bg-[#C4B5A0] text-[#2D3436] hover:bg-[#B0A08A] focus:ring-[#C4B5A0]",
    outline:
      "border-2 border-[#C4B5A0] text-[#5A7A60] hover:bg-[#FAF7F2] hover:border-[#7C9A82] hover:text-[#7C9A82]",
    ghost: "text-[#5A7A60] hover:bg-[#E8F0E9] hover:text-[#2D3436]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
