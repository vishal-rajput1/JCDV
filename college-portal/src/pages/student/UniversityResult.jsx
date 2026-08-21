import Icon from '../../components/Icon'

function UniversityResult() {

  return (
    <div className="mx-auto max-w-2xl py-12 text-center">

      {/* Icon */}
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-100 text-brand-700">

        <Icon
          name="book"
          className="h-9 w-9"
        />

      </div>

      {/* Heading */}
      <p className="mt-7 text-sm font-bold tracking-[.16em] text-brand-600">
        OFFICIAL UNIVERSITY PORTAL
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        University Final Result
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">
        Your final examination results are maintained by
        Chaudhary Devi Lal University. Use the official CDLU
        portal to view your latest authoritative result.
      </p>

      {/* Button */}
      <a
        href="https://onlinecdlu.ac.in/internet_copy_result.html"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-3 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700"
      >
        Check Official CDLU Result

        <Icon name="arrow" />
      </a>

      <p className="mt-5 text-xs text-muted">
        Opens the official CDLU result portal in a new tab.
      </p>

      {/* Information */}
      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">

        <h2 className="font-bold">
          Before you continue
        </h2>

        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">

          <li>
            • Keep your roll number ready.
          </li>

          <li>
            • Keep your registration number ready.
          </li>

          <li>
            • Your university result is fetched directly from the official CDLU portal.
          </li>

          <li>
            • This college portal does not modify the university result.
          </li>

        </ul>

      </div>

    </div>
  )
}

export default UniversityResult