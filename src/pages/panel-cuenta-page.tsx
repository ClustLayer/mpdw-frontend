import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Panel, btnGhost, btnPrimary, input, useDo } from "../components/panel/kit"
import { MSG } from "../features/usuarios/messages"
import { toast } from "../features/en-desarrollo"
import { api, mensajeDe } from "../shared/api"

type Perfil = {
  nombre: string
  apellido: string
  telefono: string
  email: string
  documento: string
  rol_nombre: string
}

export function PanelCuentaPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [error, setError] = useState("")
  const { run, pending } = useDo()

  useEffect(() => {
    void (async () => {
      const resp = await api("/api/v1/auth/profile")
      if (!resp.ok) {
        setError(MSG.perfilError)
        return
      }
      const data = (await resp.json()) as Perfil & { apellido?: string }
      setPerfil({
        nombre: data.nombre,
        apellido: data.apellido ?? "",
        telefono: data.telefono ?? "",
        email: data.email,
        documento: data.documento,
        rol_nombre: data.rol_nombre,
      })
    })()
  }, [])

  if (!perfil && !error) {
    return <p className="text-sm text-ink/60">Cargando perfil…</p>
  }

  return (
    <section>
      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-cyan-dark">Mi cuenta</p>
      <h1 className="font-display text-3xl font-extrabold text-plum">Mi perfil</h1>
      {error && <p role="alert" className="mt-4 text-sm text-brand">{error}</p>}
      {perfil && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[3fr_2fr]">
          <Panel title="Tu perfil">
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault()
                run(async () => {
                  const resp = await api("/api/v1/auth/profile", {
                    method: "PATCH",
                    body: JSON.stringify({
                      nombre: perfil.nombre,
                      apellido: perfil.apellido,
                      telefono: perfil.telefono,
                    }),
                  })
                  const msg = await mensajeDe(resp)
                  if (!resp.ok) {
                    setError(msg || MSG.perfilError)
                    return
                  }
                  toast(msg || MSG.perfilOk)
                })
              }}
            >
              <label className="block text-sm font-semibold sm:col-span-2">
                Nombre<span className="text-brand"> *</span>
                <input required value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} className={input} />
              </label>
              <label className="block text-sm font-semibold sm:col-span-2">
                Apellido<span className="text-brand"> *</span>
                <input required value={perfil.apellido} onChange={(e) => setPerfil({ ...perfil, apellido: e.target.value })} className={input} />
              </label>
              <div>
                <span className="text-xs text-ink/55">Correo</span>
                <p className="font-bold">{perfil.email}</p>
              </div>
              <div>
                <span className="text-xs text-ink/55">Documento</span>
                <p className="font-bold">{perfil.documento}</p>
              </div>
              <label className="block text-sm font-semibold">
                Teléfono
                <input type="tel" value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} className={input} />
              </label>
              <div>
                <span className="text-xs text-ink/55">Rol</span>
                <p className="font-bold">{perfil.rol_nombre}</p>
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-3">
                <button type="submit" disabled={pending} className={btnPrimary}>Guardar cambios</button>
                <Link to="/cambiar-contrasena" className={btnGhost}>Cambiar contraseña</Link>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </section>
  )
}
