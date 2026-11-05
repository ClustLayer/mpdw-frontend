import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { MSG, calcularAvisoMs, rutaDeRol } from "../features/auth/logic"
import { api, mensajeDe, renovarUnaVez } from "../shared/api"
import { useApp } from "./providers"

const ENLACES = [
  ["resumen", "Inicio"],
  ["usuarios", "Usuarios"],
  ["sedes", "Sedes"],
  ["productos", "Productos"],
  ["inventario", "Inventario"],
  ["clientes", "Clientes"],
  ["ventas", "Ventas"],
  ["caja", "Caja"],
  ["auditoria", "Auditoria"],
] as const

export function Shell({ children }: { children: ReactNode }) {
  const { sesion, salir, avisar } = useApp()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [aviso, setAviso] = useState(false)
  const avisoRef = useRef(false)
  const [restante, setRestante] = useState(5 * 60)
  const [inactividad, setInactividad] = useState(60)
  const [previo, setPrevio] = useState(5)

  useEffect(() => {
    if (!sesion) return
    let activo = true
    api("/api/v1/auth/politica-sesion").then(async (respuesta) => {
      if (!respuesta.ok || !activo) return
      const data = (await respuesta.json()) as { inactividad_minutos?: number; aviso_minutos?: number }
      if (data.inactividad_minutos) setInactividad(data.inactividad_minutos)
      if (data.aviso_minutos) setPrevio(data.aviso_minutos)
    }).catch(() => undefined)
    return () => { activo = false }
  }, [sesion])

  useEffect(() => {
    if (!sesion || sesion.debeCambiarPassword || sesion.requiere2fa) return
    let avisoT = 0
    let cierreT = 0
    let cuenta = 0
    const programar = () => {
      window.clearTimeout(avisoT)
      window.clearTimeout(cierreT)
      window.clearInterval(cuenta)
      setAviso(false)
      avisoT = window.setTimeout(() => {
        avisoRef.current = true
        setAviso(true)
        setRestante(previo * 60)
        cuenta = window.setInterval(() => setRestante((valor) => Math.max(valor - 1, 0)), 1000)
      }, calcularAvisoMs(inactividad, previo))
      cierreT = window.setTimeout(() => { void cerrarPorInactividad() }, inactividad * 60_000)
    }
    const mover = () => { if (!avisoRef.current) programar() }
    programar()
    const eventos = ["pointerdown", "keydown"] as const
    eventos.forEach((evento) => window.addEventListener(evento, mover))
    return () => {
      window.clearTimeout(avisoT)
      window.clearTimeout(cierreT)
      window.clearInterval(cuenta)
      eventos.forEach((evento) => window.removeEventListener(evento, mover))
    }
  }, [sesion, inactividad, previo])

  useEffect(() => {
    const alMostrar = (evento: PageTransitionEvent) => {
      if (evento.persisted && !sesion) navigate("/login", { replace: true })
    }
    window.addEventListener("pageshow", alMostrar)
    return () => window.removeEventListener("pageshow", alMostrar)
  }, [sesion, navigate])

  const cerrar = async (mensajeOk = MSG.logout) => {
    try {
      const respuesta = await api("/api/v1/auth/logout", { method: "POST", body: "{}" }, false)
      const texto = await mensajeDe(respuesta)
      salir()
      if (respuesta.ok) avisar(texto || mensajeOk)
      else if (respuesta.status === 401) avisar(texto || MSG.sesionExpirada, "error")
      else avisar(texto || MSG.logoutFallo, "error")
    } catch {
      salir()
      avisar(MSG.logoutFallo, "error")
    }
    navigate("/login", { replace: true })
  }

  const cerrarPorInactividad = async () => {
    await api("/api/v1/auth/logout", { method: "POST", body: "{}" }, false).catch(() => undefined)
    salir()
    avisar(MSG.inactividad, "error")
    navigate("/login", { replace: true })
  }

  const continuar = async () => {
    const ok = await renovarUnaVez()
    if (!ok) {
      salir()
      avisar(MSG.renovar, "error")
      navigate("/login", { replace: true })
      return
    }
    avisoRef.current = false
    setAviso(false)
    avisar(MSG.continua)
  }

  if (!sesion) return <main>{children}</main>
  const base = rutaDeRol(sesion.rol)
  const minutos = String(Math.floor(restante / 60)).padStart(2, "0")
  const segundos = String(restante % 60).padStart(2, "0")

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#panel-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Saltar al contenido</a>
      <aside className="sticky top-0 hidden h-dvh flex-col bg-plum text-white lg:flex">
        <div className="border-b border-white/10 p-5">
          <p className="font-display text-lg font-extrabold">Mundo Pinturas</p>
          <p className="text-xs text-white/60">Panel interno</p>
        </div>
        <nav aria-label="Modulos" className="flex-1 overflow-auto p-3">
          {ENLACES.map(([clave, etiqueta]) => (
            <NavLink key={clave} to={clave === "resumen" ? base : `${base}/${clave}`} className="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/10" title={clave === "resumen" ? "Inicio del rol" : "Funcionalidad en desarrollo"}>{etiqueta}</NavLink>
          ))}
        </nav>
        <div className="border-t border-white/15 p-4">
          <p className="truncate text-sm font-bold">{sesion.nombre}</p>
          <p className="mb-3 text-xs text-cyan">{sesion.rol}</p>
          <Link to="/cambiar-contrasena" className="mb-2 block text-sm underline" title="Cambiar la contraseña de la cuenta">Mi perfil</Link>
          <button type="button" className="flex w-full items-center justify-center rounded-xl border border-white/30 py-2 text-sm font-semibold" title="Cerrar la sesion en este equipo" aria-label="Cerrar sesión" onClick={() => void cerrar()}>Cerrar sesión</button>
        </div>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b-2 border-plum/10 bg-white px-4 py-3 lg:hidden">
          <button type="button" aria-label="Abrir menu" className="rounded-lg px-3 py-2 font-bold text-plum" onClick={() => setAbierto(true)}>Menu</button>
          <span className="font-display font-extrabold text-plum">Mundo Pinturas Diana</span>
          <button type="button" aria-label="Cerrar sesión" title="Cerrar sesión" className="text-sm font-bold text-brand" onClick={() => void cerrar()}>Salir</button>
        </header>
        {abierto && (
          <div className="fixed inset-0 z-40 bg-plum/70 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <nav className="h-full w-72 bg-plum p-4 text-white">
              <button type="button" className="mb-4 text-sm" onClick={() => setAbierto(false)} aria-label="Cerrar menu">Cerrar</button>
              {ENLACES.map(([clave, etiqueta]) => (
                <Link key={clave} to={clave === "resumen" ? base : `${base}/${clave}`} onClick={() => setAbierto(false)} className="block py-2">{etiqueta}</Link>
              ))}
            </nav>
          </div>
        )}
        <main id="panel-main" className="p-4 sm:p-8">{children}</main>
      </div>
      {aviso && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="titulo-sesion">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 id="titulo-sesion" className="font-display text-2xl font-extrabold text-plum">Su sesión está por expirar</h2>
            <p className="mt-3 text-sm text-ink/70">Tiempo restante antes de cerrar la sesión: <span className="font-bold">{minutos}:{segundos}</span></p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-xl border-2 border-plum px-4 py-2 font-semibold" onClick={() => void cerrar()}>Cerrar sesión</button>
              <button type="button" className="rounded-xl bg-brand px-4 py-2 font-bold text-white" onClick={() => void continuar()}>Continuar sesión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
