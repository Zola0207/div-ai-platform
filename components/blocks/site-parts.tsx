import { initials, type LayoutProps } from './site-types';

export function HoursRow({ day, time }: { day: string; time: string }) {
  return <div className="flex justify-between gap-3 border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0"><span className="text-slate-600">{day}</span><span className="font-bold text-slate-800">{time}</span></div>;
}

export function LogoMark({ draft, size = 'md', rounded = 'rounded-lg' }: { draft: LayoutProps['draft']; size?: 'sm' | 'md' | 'lg'; rounded?: string }) {
  const box = size === 'lg' ? 'h-16 w-16 text-lg' : size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-7 w-7 text-[10px]';
  if (draft.logoUrl) {
    return <img src={draft.logoUrl} alt={draft.businessName} className={`${box} ${rounded} bg-white object-contain`} />;
  }
  return (
    <span
      className={`flex ${box} ${rounded} items-center justify-center font-black text-white`}
      style={{ backgroundColor: draft.accentColor }}
    >
      {initials(draft.businessName)}
    </span>
  );
}
