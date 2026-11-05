import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Pencil, Plus, Search } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import {
  Badge,
  Confirm,
  Empty,
  Modal,
  Pager,
  btnGhost,
  btnPrimary,
  input,
  useDebounced,
  useDo,
} from "../components/panel/kit"
import { MSG } from "../features/usuarios/messages"
import { formularioUsuarioCompleto } from "../features/usuarios/logic"
import { toast } from "../features/en-desarrollo"
import { api, mensajeDe } from "../shared/api"

type Fila = {
  id_usuario: number
  nombre_completo: string
  documento: string
  email: string
  rol: string
  estado: string
  ultimo_acceso: string | null
  sede_principal: string
}

type RolOpt = { id_rol: number; nombre: string }
type SedeOpt = { id_sede: number; nombre: string }

export function PanelUsuariosPage() {
  const [params, setParams] = useSearchParams()
  const qParam = params.get("q") ?? ""
  const [q, setQ] = useState(qParam)
  const debouncedQ = useDebounced(q, 300)
  const [estado, setEstado] = useState(params.get("estado") ?? "todos")
  const [idRol, setIdRol] = useState(params.get("id_rol") ?? "")
  const [page, setPage] = useState(Number(params.get("page") || 1))
  const [items, setItems] = useState<Fila[]>([])
  const [total, setTotal] = useState(0)
  const [mensaje, setMensaje] = useState("")
  const [error, setError] = useState("")
  const [roles, setRoles] = useState<RolOpt[]>([])
  const [sedes, setSedes] = useState<SedeOpt[]>([])
  const [modal, setModal] = useState<"new" | number | null>(null)
  const [confirmEstado, setConfirmEstado] = useState<{ id: number; accion: string; nombre: string } | null>(null)
  const [elegirEstado, setElegirEstado] = useState<{ id: number; nombre: string; estado: string } | null>(null)
  const { run, pending } = useDo()

  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const syncParams = useCallback(() => {
    const next = new URLSearchParams()
    if (debouncedQ.trim()) next.set("q", debouncedQ.trim())
    if (estado !== "todos") next.set("estado", estado)
    if (idRol) next.set("id_rol", idRol)
    if (page > 1) next.set("page", String(page))
    setParams(next, { replace: true })
  }, [debouncedQ, estado, idRol, page, setParams])

  const cargar = useCallback(async () => {
    setError("")
    const qs = new URLSearchParams()
    if (debouncedQ.trim()) qs.set("q", debouncedQ.trim())
    if (estado !== "todos") qs.set("estado", estado)
    if (idRol) qs.set("id_rol", idRol)
    qs.set("page", String(page))
    qs.set("page_size", String(pageSize))
    const resp = await api(`/api/v1/usuarios/?${qs.toString()}`)
    if (!resp.ok) {
      setError(MSG.listadoError)
      setItems([])
      setTotal(0)
      return
    }
    const data = (await resp.json()) as { items: Fila[]; total: number; mensaje: string }
    setItems(data.items)
    setTotal(data.total)
    setMensaje(data.mensaje)
  }, [debouncedQ, estado, idRol, page])

  useEffect(() => {
    syncParams()
  }, [syncParams])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga remota al cambiar filtros
    void cargar()
  }, [cargar])

  useEffect(() => {
    void (async () => {
      const [r, s] = await Promise.all([api("/api/v1/usuarios/roles"), api("/api/v1/branches/")])
      if (r.ok) {
        const body = (await r.json()) as { items: RolOpt[] }
        setRoles(body.items)
      }
      if (s.ok) {
        const body = (await s.json()) as SedeOpt[]
        setSedes(body.filter((x) => x.id_sede))
      }
    })()
  }, [])

  const irEditar = (id: number) => setModal(id)

  return (
    <section>
      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-cyan-dark">Administración de usuarios</p>
      <h1 className="font-display text-3xl font-extrabold text-plum">Usuarios</h1>
      <p className="mt-2 max-w-3xl text-sm text-ink/60">Personal con acceso al sistema. Los usuarios se crean aquí; no hay registro público.</p>

      <div className="mb-4 mt-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-52 flex-1">
          <span className="sr-only">Buscar</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-plum/50" aria-hidden />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Buscar usuarios…" className={`${input} !mt-0 pl-10`} />
        </label>
        <select aria-label="Filtro por rol" value={idRol} onChange={(e) => { setIdRol(e.target.value); setPage(1) }} className={`${input} !mt-0 w-44`}>
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.id_rol} value={String(r.id_rol)}>{r.nombre}</option>
          ))}
        </select>
        <select aria-label="Filtro por estado" value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1) }} className={`${input} !mt-0 w-40`}>
          <option value="todos">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
        <button type="button" className={btnPrimary} onClick={() => setModal("new")}>
          <Plus size={16} aria-hidden /> Nuevo usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border-2 border-brand p-4 text-sm" role="alert">
          <p>{error}</p>
          <button type="button" className="mt-2 font-bold text-plum" onClick={() => void cargar()}>Reintentar</button>
        </div>
      )}

      {!error && items.length === 0 ? (
        <Empty text={debouncedQ || estado !== "todos" || idRol ? MSG.listadoVacio : "Aún no hay usuarios registrados."} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-plum/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-plum-soft text-xs uppercase tracking-wider text-plum">
              <tr>
                {["Nombre completo", "Documento", "Correo", "Rol", "Estado", "Último acceso", "Acciones"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-plum/10">
              {items.map((u) => (
                <tr key={u.id_usuario} className="transition hover:bg-paper">
                  <td className="px-4 py-3 font-semibold">{u.nombre_completo}</td>
                  <td className="px-4 py-3">{u.documento}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3"><Badge value={u.rol} /></td>
                  <td className="px-4 py-3"><Badge value={u.estado} /></td>
                  <td className="px-4 py-3">{u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString() : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button type="button" aria-label={`Editar ${u.nombre_completo}`} className="rounded-lg p-2 text-plum hover:bg-plum-soft" onClick={() => irEditar(u.id_usuario)}>
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="ml-1 rounded-lg px-2 py-1 text-xs font-bold text-cyan-dark hover:bg-plum-soft"
                      onClick={() => setElegirEstado({ id: u.id_usuario, nombre: u.nombre_completo, estado: u.estado })}
                    >
                      Cambiar estado
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mensaje && !error && <p className="mt-3 text-sm text-ink/60" aria-live="polite">{mensaje}</p>}
      <Pager page={page} totalPages={totalPages} total={total} onPage={setPage} />

      <UsuarioFormModal
        open={modal !== null}
        id={modal === "new" ? null : modal}
        roles={roles}
        sedes={sedes}
        onClose={() => setModal(null)}
        onSaved={() => { setModal(null); void cargar() }}
      />

      <Modal open={!!elegirEstado} onClose={() => setElegirEstado(null)} title="Cambiar estado">
        {elegirEstado && (
          <>
            <p className="mb-4 text-sm text-ink/70">Usuario: {elegirEstado.nombre}</p>
            <div className="flex flex-wrap gap-2">
              {accionesParaEstado(elegirEstado.estado).map((accion) => (
                <button
                  key={accion}
                  type="button"
                  className={btnPrimary}
                  onClick={() => {
                    setElegirEstado(null)
                    setConfirmEstado({ id: elegirEstado.id, accion, nombre: elegirEstado.nombre })
                  }}
                >
                  {etiquetaAccion(accion)}
                </button>
              ))}
            </div>
          </>
        )}
      </Modal>

      <Confirm
        open={!!confirmEstado}
        title="Cambiar estado"
        text={MSG.estadoConfirm}
        busy={pending}
        onNo={() => setConfirmEstado(null)}
        onYes={() =>
          run(async () => {
            if (!confirmEstado) return
            const resp = await api(`/api/v1/usuarios/${confirmEstado.id}/estado`, {
              method: "POST",
              body: JSON.stringify({ accion: confirmEstado.accion }),
            })
            const msg = await mensajeDe(resp)
            if (!resp.ok) throw new Error(msg || MSG.estadoError)
            toast(msg || MSG.estadoOk)
            setConfirmEstado(null)
            await cargar()
          })
        }
      />
    </section>
  )
}

function UsuarioFormModal({
  open,
  id,
  roles,
  sedes,
  onClose,
  onSaved,
}: {
  open: boolean
  id: number | null
  roles: RolOpt[]
  sedes: SedeOpt[]
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = id === null
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [documento, setDocumento] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [idRol, setIdRol] = useState("")
  const [idSede, setIdSede] = useState("")
  const [version, setVersion] = useState(1)
  const [rolInicial, setRolInicial] = useState("")
  const [puedeTemp, setPuedeTemp] = useState(false)
  const [confirmRol, setConfirmRol] = useState(false)
  const [confirmTemp, setConfirmTemp] = useState(false)
  const [tempClave, setTempClave] = useState<string | null>(null)
  const [error, setError] = useState("")
  const { run, pending } = useDo()

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset al abrir modal
    setError("")
    if (isNew) {
      setNombre(""); setApellido(""); setDocumento(""); setTelefono(""); setEmail("")
      setIdRol(roles[0] ? String(roles[0].id_rol) : "")
      setIdSede(sedes[0] ? String(sedes[0].id_sede) : "")
      return
    }
    void (async () => {
      const resp = await api(`/api/v1/usuarios/${id}`)
      if (!resp.ok) return
      const u = (await resp.json()) as Record<string, unknown>
      setNombre(String(u.nombre ?? ""))
      setApellido(String(u.apellido ?? ""))
      setDocumento(String(u.documento ?? ""))
      setTelefono(String(u.telefono ?? ""))
      setEmail(String(u.email ?? ""))
      const rol = String(u.id_rol ?? "")
      setIdRol(rol)
      setRolInicial(rol)
      const sede = (u.sedes as { id_sede: number; es_principal: boolean }[] | undefined)?.find((s) => s.es_principal)
      setIdSede(sede ? String(sede.id_sede) : "")
      setVersion(Number(u.version_fila ?? 1))
      setPuedeTemp(Boolean(u.puede_contrasena_temporal))
    })()
  }, [open, id, isNew, roles, sedes])

  const puedeGuardar = useMemo(
    () => formularioUsuarioCompleto({ nombre, apellido, documento, email, idRol, idSede }),
    [nombre, apellido, documento, email, idRol, idSede],
  )

  const enviar = () => {
    if (!isNew && idRol !== rolInicial) {
      setConfirmRol(true)
      return
    }
    void guardar()
  }

  const guardar = () =>
    run(async () => {
      setError("")
      setConfirmRol(false)
      const payload = {
        nombre,
        apellido,
        documento,
        telefono,
        email,
        id_rol: Number(idRol),
        sedes: [{ id_sede: Number(idSede), es_principal: true }],
        ...(isNew ? {} : { version_fila: version }),
      }
      const resp = await api(isNew ? "/api/v1/usuarios/" : `/api/v1/usuarios/${id}`, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      })
      const msg = await mensajeDe(resp)
      if (!resp.ok) {
        setError(msg || (isNew ? MSG.crearError : MSG.actualizarError))
        return
      }
      toast(msg || (isNew ? MSG.crearOk : MSG.actualizarOk))
      onSaved()
    })

  const generarTemp = () =>
    run(async () => {
      if (!id) return
      const resp = await api(`/api/v1/usuarios/${id}/contrasena-temporal`, { method: "POST" })
      const msg = await mensajeDe(resp)
      if (!resp.ok) {
        setError(msg || MSG.contrasenaTempError)
        return
      }
      const body = (await resp.json()) as { contrasena_temporal?: string; mensaje?: string }
      toast(body.mensaje || MSG.contrasenaTempOk)
      setConfirmTemp(false)
      setTempClave(body.contrasena_temporal ?? null)
    })

  return (
    <Modal open={open} onClose={onClose} title={isNew ? "Crear usuario" : "Editar usuario"} wide>
      {error && <p role="alert" className="mb-3 rounded-xl border-2 border-brand p-3 text-sm text-brand-dark">{error}</p>}
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (puedeGuardar) void enviar()
        }}
      >
        <label className="block text-sm font-semibold">
          Nombre<span className="text-brand"> *</span>
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          Apellido<span className="text-brand"> *</span>
          <input required value={apellido} onChange={(e) => setApellido(e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          Documento<span className="text-brand"> *</span>
          <input required value={documento} onChange={(e) => setDocumento(e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          Teléfono
          <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold sm:col-span-2">
          Correo electrónico<span className="text-brand"> *</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          Rol<span className="text-brand"> *</span>
          <select required value={idRol} onChange={(e) => setIdRol(e.target.value)} className={input}>
            <option value="">—</option>
            {roles.map((r) => (
              <option key={r.id_rol} value={String(r.id_rol)}>{r.nombre}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Sede asignada<span className="text-brand"> *</span>
          <select required value={idSede} onChange={(e) => setIdSede(e.target.value)} className={input}>
            <option value="">—</option>
            {sedes.map((s) => (
              <option key={s.id_sede} value={String(s.id_sede)}>{s.nombre}</option>
            ))}
          </select>
        </label>
        {isNew && (
          <p className="sm:col-span-2 text-sm text-ink/60">La contraseña inicial la genera el sistema y se envía al correo del usuario.</p>
        )}
        {!isNew && puedeTemp && (
          <div className="sm:col-span-2">
            <button type="button" className={btnGhost} onClick={() => setConfirmTemp(true)}>
              Generar contraseña temporal
            </button>
          </div>
        )}
        <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className={btnGhost}>Cancelar</button>
          <button type="submit" disabled={!puedeGuardar || pending} className={btnPrimary}>
            {pending && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {isNew ? "Crear usuario" : "Guardar cambios"}
          </button>
        </div>
      </form>

      <Confirm open={confirmRol} title="Cambiar rol" text={MSG.rolCambio} busy={pending} onNo={() => setConfirmRol(false)} onYes={() => void guardar()} />
      <Confirm
        open={confirmTemp}
        title="Contraseña temporal"
        text={MSG.contrasenaTempConfirm}
        busy={pending}
        onNo={() => setConfirmTemp(false)}
        onYes={() => void generarTemp()}
      />
      <Modal open={tempClave !== null} onClose={() => setTempClave(null)} title="Contraseña temporal">
        <p className="mb-2 text-sm text-ink/60">Esta contraseña no se volverá a mostrar.</p>
        <div className="flex gap-2">
          <input readOnly value={tempClave ?? ""} className={input} aria-label="Contraseña temporal generada" />
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              void navigator.clipboard.writeText(tempClave ?? "")
              toast("Copiado al portapapeles.")
            }}
          >
            Copiar
          </button>
        </div>
      </Modal>
    </Modal>
  )
}

function accionesParaEstado(estado: string): string[] {
  if (estado === "Activo") return ["desactivar", "bloquear"]
  if (estado === "Inactivo") return ["activar"]
  return ["activar", "desactivar"]
}

function etiquetaAccion(accion: string): string {
  if (accion === "activar") return "Activar"
  if (accion === "desactivar") return "Desactivar"
  return "Bloquear"
}
