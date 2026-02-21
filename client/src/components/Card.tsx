import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}
export function Card({
  children,
  className = '',
  onClick,
  hover = false
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl p-6 
        shadow-[0_4px_20px_rgba(45,52,54,0.05)] 
        border border-[#E8F0E9]
        ${hover || onClick ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(45,52,54,0.12)] cursor-pointer' : ''}
        ${className}
      `}>

      {children}
    </div>);

}