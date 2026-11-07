export default function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{title}</p>
        <Icon className={color} size={20} />
      </div>
      <p className="text-white text-3xl font-bold mt-3">{value}</p>
    </div>
  );
}