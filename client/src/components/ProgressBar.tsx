
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}
export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, current / total * 100));
  return (
    <div className="w-full">
      {label &&
      <div className="flex justify-between mb-2 text-sm font-medium text-[#5A7A60]">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      }
      <div className="h-3 w-full bg-[#E8F0E9] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7C9A82] transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${percentage}%`
          }} />

      </div>
    </div>);

}