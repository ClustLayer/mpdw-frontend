import { useEffect, useRef } from "react"
import { X } from "lucide-react"

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
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
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-2 border-plum bg-white p-0 text-ink shadow-[8px_8px_0_0_var(--color-plum)] backdrop:bg-plum/50 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="modal-title" className="font-display text-2xl font-extrabold text-plum">
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
