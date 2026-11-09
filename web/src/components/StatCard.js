export default function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center"><Icon className={color} size={16} /></div>
      </div>
      <p className="text-white text-3xl font-bold mt-3">{value}</p>
    </div>
  );
}
