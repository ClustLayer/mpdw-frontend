import { useCallback, useEffect, useState } from "react"
import { Loader2, Pencil, Plus, Search } from "lucide-react"
import { Empty, Modal, Pager, btnGhost, btnPrimary, input, useDebounced, useDo } from "../components/panel/kit"
import { toast } from "../features/en-desarrollo"
import { api, mensajeDe } from "../shared/api"

type Horario = { dia_semana: number; hora_apertura: string; hora_cierre: string; cerrado: boolean }
type Sede = {
  id_sede: number
  nombre: string
  direccion: string
  telefono: string
  whatsapp: string
  ciudad: string
  estado: boolean
  orden: number
  version_fila: number
  horarios: Horario[]
}

const DIAS = [
  { n: 1, label: "Lunes" },
  { n: 2, label: "Martes" },
  { n: 3, label: "Miércoles" },
  { n: 4, label: "Jueves" },
  { n: 5, label: "Viernes" },
  { n: 6, label: "Sábado" },
  { n: 7, label: "Domingo" },
]

function horariosVacios(): Horario[] {
  return DIAS.map((d) => ({ dia_semana: d.n, hora_apertura: "08:00", hora_cierre: "17:00", cerrado: d.n === 7 }))
}

export function PanelSedesPage() {
  const [q, setQ] = useState("")
  const debouncedQ = useDebounced(q, 300)
  const [estado, setEstado] = useState("todos")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Sede[]>([])
  const [total, setTotal] = useState(0)
  const [modal, setModal] = useState<"new" | number | null>(null)
  const filtroSelect = `${input} !mt-0 w-auto max-w-[12rem] shrink-0`
  const pageSize = 20

  const cargar = useCallback(async () => {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (debouncedQ.trim()) qs.set("q", debouncedQ.trim())
    if (estado !== "todos") qs.set("estado", estado)
    const r = await api(`/api/v1/sedes/gestion/?${qs}`)
    if (!r.ok) return
    const body = (await r.json()) as { items: Sede[]; total: number }
    setItems(body.items)
    setTotal(body.total)
  }, [debouncedQ, estado, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga remota
    void cargar()
  }, [cargar])

  return (
    <section className="mx-auto max-w-6xl">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-dark">Gestión de sedes</p>
        <h1 className="font-display text-4xl font-extrabold text-plum">Sedes</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink/60">Puntos de venta. Alimentan el sitio público y los pedidos por WhatsApp.</p>
      </header>
      <div className="mb-4 flex flex-nowrap items-center gap-3 overflow-x-auto">
        <label className="relative min-w-[12rem] flex-1">
          <span className="sr-only">Buscar sedes</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-plum/50" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar sedes…" className={`${input} !mt-0 pl-10`} />
        </label>
        <select aria-label="Filtro estado" value={estado} onChange={(e) => setEstado(e.target.value)} className={filtroSelect}>
          <option value="todos">Todas</option>
          <option value="activo">Activas</option>
          <option value="inactivo">Inactivas</option>
        </select>
        <button type="button" className={`${btnPrimary} shrink-0`} onClick={() => setModal("new")}>
          <Plus size={16} aria-hidden /> Nueva sede
        </button>
      </div>
      {items.length === 0 ? (
        <Empty text="No hay sedes registradas." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-plum/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-plum-soft text-xs uppercase tracking-wider text-plum">
              <tr>
                {["Orden", "Nombre", "Dirección", "WhatsApp", "Activa", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-plum/10">
              {items.map((s) => (
                <tr key={s.id_sede} className="hover:bg-paper">
                  <td className="px-4 py-3">{s.orden}</td>
                  <td className="px-4 py-3 font-semibold">{s.nombre}</td>
                  <td className="px-4 py-3 text-ink/70">{s.direccion}</td>
                  <td className="px-4 py-3">{s.whatsapp || "—"}</td>
                  <td className="px-4 py-3">{s.estado ? <span className="font-bold text-cyan-dark">Sí</span> : <span className="text-ink/40">No</span>}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button type="button" aria-label={`Editar ${s.nombre}`} className="rounded-lg p-2 text-plum hover:bg-plum-soft" onClick={() => setModal(s.id_sede)}>
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} total={total} totalPages={Math.max(1, Math.ceil(total / pageSize))} onPage={setPage} />
      <SedeModal open={modal !== null} id={modal === "new" ? null : modal} onClose={() => setModal(null)} onSaved={() => void cargar()} />
    </section>
  )
}

function SedeModal({ open, id, onClose, onSaved }: { open: boolean; id: number | null; onClose: () => void; onSaved: () => void }) {
  const isNew = id === null
  const [nombre, setNombre] = useState("")
  const [direccion, setDireccion] = useState("")
  const [telefono, setTelefono] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [ciudad, setCiudad] = useState("Cali")
  const [orden, setOrden] = useState(10)
  const [estado, setEstado] = useState(true)
  const [version, setVersion] = useState(1)
  const [horarios, setHorarios] = useState<Horario[]>(horariosVacios)
  const { run, pending } = useDo()

  useEffect(() => {
    if (!open) return
    if (isNew) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset modal al abrir
      setNombre("")
      setDireccion("")
      setTelefono("")
      setWhatsapp("")
      setCiudad("Cali")
      setOrden(10)
      setEstado(true)
      setHorarios(horariosVacios())
      return
    }
    void (async () => {
      const r = await api(`/api/v1/sedes/gestion/?page=1&page_size=500`)
      if (!r.ok) return
      const s = ((await r.json()) as { items: Sede[] }).items.find((x) => x.id_sede === id)
      if (!s) return
      setNombre(s.nombre)
      setDireccion(s.direccion)
      setTelefono(s.telefono)
      setWhatsapp(s.whatsapp)
      setCiudad(s.ciudad)
      setOrden(s.orden)
      setEstado(s.estado)
      setVersion(s.version_fila)
      setHorarios(s.horarios?.length ? s.horarios : horariosVacios())
    })()
  }, [open, id, isNew])

  const guardar = () =>
    run(async () => {
      const payload = {
        nombre,
        direccion,
        telefono,
        whatsapp,
        ciudad,
        orden,
        horarios,
        ...(isNew ? {} : { estado, version_fila: version }),
      }
      const r = await api(isNew ? "/api/v1/sedes/gestion/" : `/api/v1/sedes/gestion/${id}/`, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      })
      const msg = await mensajeDe(r)
      if (!r.ok) {
        toast(msg || (isNew ? "No fue posible crear la sede. Intente nuevamente." : "No fue posible actualizar la sede. Intente nuevamente."))
        return
      }
      toast(msg)
      onSaved()
      onClose()
    })

  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Crear sede" : "Editar sede"} wide>
      <label className="block text-sm font-semibold">Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} className={input} maxLength={255} /></label>
      <label className="block text-sm font-semibold">Dirección<input value={direccion} onChange={(e) => setDireccion(e.target.value)} className={input} maxLength={255} /></label>
      <label className="block text-sm font-semibold">Teléfono<input value={telefono} onChange={(e) => setTelefono(e.target.value)} className={input} /></label>
      <label className="block text-sm font-semibold">WhatsApp<input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={input} /></label>
      <label className="block text-sm font-semibold">Ciudad<input value={ciudad} onChange={(e) => setCiudad(e.target.value)} className={input} /></label>
      <label className="block text-sm font-semibold">Orden en sitio<input type="number" value={orden} onChange={(e) => setOrden(Number(e.target.value))} className={input} /></label>
      {!isNew && (
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={estado} onChange={(e) => setEstado(e.target.checked)} /> Sede activa
        </label>
      )}
      <fieldset className="mt-4 rounded-xl border-2 border-plum/10 p-4">
        <legend className="px-2 text-sm font-bold text-plum">Horarios por día</legend>
        <div className="space-y-3">
          {DIAS.map((d) => {
            const h = horarios.find((x) => x.dia_semana === d.n) ?? { dia_semana: d.n, hora_apertura: "08:00", hora_cierre: "17:00", cerrado: false }
            return (
              <div key={d.n} className="grid gap-2 sm:grid-cols-[6rem_1fr_1fr_auto] sm:items-center">
                <span className="text-sm font-semibold">{d.label}</span>
                <input type="time" value={h.hora_apertura} disabled={h.cerrado} onChange={(e) => setHorarios((prev) => prev.map((x) => (x.dia_semana === d.n ? { ...x, hora_apertura: e.target.value } : x)))} className={input} />
                <input type="time" value={h.hora_cierre} disabled={h.cerrado} onChange={(e) => setHorarios((prev) => prev.map((x) => (x.dia_semana === d.n ? { ...x, hora_cierre: e.target.value } : x)))} className={input} />
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={h.cerrado} onChange={(e) => setHorarios((prev) => prev.map((x) => (x.dia_semana === d.n ? { ...x, cerrado: e.target.checked } : x)))} /> Cerrado
                </label>
              </div>
            )
          })}
        </div>
      </fieldset>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className={btnGhost} onClick={onClose}>Cancelar</button>
        <button type="button" className={btnPrimary} disabled={pending} onClick={() => void guardar()}>
          {pending ? <Loader2 className="animate-spin" size={16} /> : isNew ? "Crear sede" : "Guardar cambios"}
        </button>
      </div>
    </Modal>
  )
}
