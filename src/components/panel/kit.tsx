import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { toast } from "../../features/en-desarrollo"

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-labelledby={headingId}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl border-2 border-plum bg-white p-0 text-ink shadow-[8px_8px_0_0_var(--color-plum)] backdrop:bg-plum/50 backdrop:backdrop-blur-sm`}
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id={headingId} className="font-display text-2xl font-extrabold text-plum">
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1.5 hover:bg-plum-soft">
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

const btn = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 focus-visible:outline-2"
export const btnPrimary = `${btn} bg-brand text-white shadow-[3px_3px_0_0_var(--color-plum)] hover:-translate-y-0.5 hover:bg-brand-dark`
export const btnGhost = `${btn} border-2 border-plum/20 text-plum hover:bg-plum-soft`

export function FieldLabel({
  label,
  required,
  tip,
  children,
  className = "",
}: {
  label: string
  required?: boolean
  tip?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block text-sm font-semibold ${className}`} data-tip={tip}>
      {label}
      {required && (
        <span className="text-brand" aria-hidden>
          {" "}
          *
        </span>
      )}
      {children}
    </label>
  )
}

export function DayClosedToggle({
  closed,
  onChange,
  dayLabel,
}: {
  closed: boolean
  onChange: (closed: boolean) => void
  dayLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={closed}
      aria-label={`${dayLabel}: ${closed ? "cerrado" : "abierto"}`}
      data-tip={closed ? "Marcar día como abierto" : "Marcar día como cerrado"}
      onClick={() => onChange(!closed)}
      className={`inline-flex min-w-[5.5rem] items-center justify-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
        closed
          ? "border-ink/15 bg-ink/5 text-ink/50"
          : "border-cyan-dark/40 bg-cyan/10 text-cyan-dark shadow-[2px_2px_0_0_var(--color-plum)]"
      }`}
    >
      <span className={`size-2 rounded-full ${closed ? "bg-ink/25" : "bg-cyan-dark"}`} aria-hidden />
      {closed ? "Cerrado" : "Abierto"}
    </button>
  )
}

export function Confirm({
  open,
  title,
  text,
  busy,
  onYes,
  onNo,
  yes = "Confirmar",
  danger,
}: {
  open: boolean
  title: string
  text: string
  busy?: boolean
  onYes: () => void
  onNo: () => void
  yes?: string
  danger?: boolean
}) {
  return (
    <Modal open={open} onClose={onNo} title={title}>
      <p className="text-sm text-ink/70">{text}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onNo} className={btnGhost}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={onYes}
          disabled={busy}
          className={danger ? `${btn} bg-brand text-white hover:opacity-90` : btnPrimary}
        >
          {busy && <Loader2 size={16} className="animate-spin" aria-hidden />} {yes}
        </button>
      </div>
    </Modal>
  )
}

export const input =
  "mt-1.5 w-full rounded-xl border-2 border-plum/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-cyan disabled:bg-ink/5"

export function Badge({ value }: { value: string }) {
  const tono =
    value === "Administrador" || value === "Activo"
      ? "bg-cyan/15 text-cyan-dark"
      : value === "Bloqueado" || value === "Inactivo"
        ? "bg-brand/10 text-brand-dark"
        : "bg-plum-soft text-plum"
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${tono}`}>{value}</span>
}

export function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(t)
  }, [value, ms])
  return debounced
}

export function useDo() {
  const [pending, setPending] = useState(false)
  const run = useCallback(async (accion: () => Promise<void>, despues?: () => void) => {
    setPending(true)
    try {
      await accion()
      despues?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      if (msg) toast(msg)
    } finally {
      setPending(false)
    }
  }, [])
  return { run, pending }
}

export function Pager({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  onPage: (n: number) => void
}) {
  if (total === 0) return null
  const cell = "inline-flex size-9 items-center justify-center rounded-lg text-sm font-bold transition"
  return (
    <nav aria-label="Paginación" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-ink/55">
        {total} registro{total === 1 ? "" : "s"} · página {page} de {totalPages}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Página anterior" className={`${cell} border-2 border-plum/15 text-plum hover:bg-plum-soft disabled:opacity-30`}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Página siguiente" className={`${cell} border-2 border-plum/15 text-plum hover:bg-plum-soft disabled:opacity-30`}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  )
}

export const Panel = ({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="rounded-2xl border-2 border-plum/10 bg-white p-5">
    {(title || action) && (
      <div className="mb-4 flex items-center justify-between gap-3">
        {title && <h2 className="font-display text-lg font-extrabold text-plum">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
)

export const Empty = ({ text }: { text: string }) => (
  <p className="rounded-xl border-2 border-dashed border-plum/15 p-8 text-center text-sm text-ink/55">{text}</p>
)
