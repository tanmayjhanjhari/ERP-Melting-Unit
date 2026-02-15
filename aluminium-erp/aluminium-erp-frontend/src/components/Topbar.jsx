export default function Topbar() {
  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 border-b">
      <h1 className="text-xl font-semibold text-slate-800">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          Logged in as <b>Manager</b>
        </span>

        <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center">
          M
        </div>
      </div>
    </header>
  );
}
