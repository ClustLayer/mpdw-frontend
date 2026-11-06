import { Ban, Circle, Globe, Pencil, Plus, X } from "lucide-react"
import { ACCIONES_UI } from "./matriz-constants"

export type FilaMatriz = {
  id_permiso: number
  modulo: string
  accion: string
  nombre: string
  permitido: boolean | null
}

export function agruparPorModulo(filas: FilaMatriz[]) {
  const map = new Map<string, FilaMatriz[]>()
  for (const f of filas) {
    map.set(f.modulo, [...(map.get(f.modulo) ?? []), f])
  }
  return [...map.entries()].map(([modulo, rows]) => ({
    modulo,
    filas: rows,
    activas: rows.filter((r) => r.permitido).map((r) => r.accion),
  }))
}

function iconoResumen(activas: string[]) {
  if (activas.includes("Sin acceso")) return <Ban size={18} className="text-brand" aria-hidden />
  if (activas.includes("Total") || activas.includes("T")) return <Globe size={18} className="text-cyan-dark" aria-hidden />
  if (!activas.length) return <Circle size={18} className="text-ink/25" aria-hidden />
  return (
    <span className="inline-flex gap-0.5">
      {activas.includes("Consultar") && <Circle size={14} className="text-plum" />}
      {activas.includes("Crear") && <Plus size={14} className="text-plum" />}
      {activas.includes("Editar") && <Pencil size={14} className="text-plum" />}
    </span>
  )
}

export function MatrizCarriles({
  filas,
  onChange,
}: {
  filas: FilaMatriz[]
  onChange: (next: FilaMatriz[]) => void
}) {
  const grupos = agruparPorModulo(filas)
  const toggleAccion = (modulo: string, accion: string, activar: boolean) => {
    onChange(
      filas.map((f) => {
        if (f.modulo !== modulo) return f
        if (accion === "Sin acceso" && activar) {
          return { ...f, permitido: f.accion === "Sin acceso" }
        }
        if (activar && accion !== "Sin acceso") {
          if (f.accion === "Sin acceso") return { ...f, permitido: false }
          if (f.accion === accion) return { ...f, permitido: true }
          return f
        }
        if (f.accion === accion) return { ...f, permitido: false }
        return f
      }),
    )
  }

  return (
    <div className="space-y-4">
      {grupos.map((g) => {
        const bloqueado = g.activas.includes("Sin acceso")
        return (
          <div key={g.modulo} className="rounded-2xl border-2 border-plum/10 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-extrabold text-plum">{g.modulo}</h3>
              <span aria-label="Resumen permisos">{iconoResumen(g.activas)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.activas.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 rounded-full border-2 border-plum/20 bg-plum-soft px-3 py-1 text-xs font-bold text-plum">
                  {a}
                  <button type="button" aria-label={`Quitar ${a}`} className="rounded p-0.5 hover:bg-white" onClick={() => toggleAccion(g.modulo, a, false)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ACCIONES_UI.filter((a) => !g.activas.includes(a)).map((a) => (
                <button
                  key={a}
                  type="button"
                  disabled={bloqueado && a !== "Sin acceso"}
                  className="rounded-lg border border-dashed border-plum/30 px-2 py-1 text-xs font-semibold text-plum hover:bg-paper disabled:opacity-40"
                  onClick={() => toggleAccion(g.modulo, a, true)}
                >
                  + {a}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
