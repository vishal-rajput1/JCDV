import Icon from './Icon'

function StatCard({
  label,
  value,
  hint,
  icon,
  color,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex justify-between">

        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${color} text-white`}
        >
          <Icon name={icon} />
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          ● Good
        </span>

      </div>

      <p className="mt-7 text-sm font-medium text-muted">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs text-muted">
        {hint}
      </p>

    </div>
  )
}

export default StatCard