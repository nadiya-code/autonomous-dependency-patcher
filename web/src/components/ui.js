export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-6">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64 mt-4" />
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-10 text-center">
      {Icon && <Icon className="mx-auto text-slate-600" size={32} />}
      <p className="text-white font-medium mt-3">{title}</p>
      {text && <p className="text-slate-500 text-sm mt-1">{text}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function ErrorBox({ message }) {
  return <p className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 text-sm">{message}</p>;
}

export const severityBadge = {
  CRITICAL: "bg-red-500/10 text-red-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-400",
  LOW: "bg-blue-500/10 text-blue-400",
  UNKNOWN: "bg-slate-500/10 text-slate-400",
};
