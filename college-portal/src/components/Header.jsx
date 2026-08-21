import Icon from './Icon'

function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-10">
      
      <p className="hidden text-sm text-muted lg:block">
        Wednesday, 19 August 2026
      </p>

      <div className="ml-auto flex items-center gap-4">

        {/* Notification */}
        <button className="relative rounded-full p-2 text-slate-500">
          <Icon name="bell" />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Profile */}
        <div className="flex items-center gap-3">

          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            VR
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold">
              Vishal Rajput
            </p>

            <p className="text-xs text-muted">
              Student
            </p>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header