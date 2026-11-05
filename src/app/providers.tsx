import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { guardarToken } from "../shared/api"

export type Aviso = { id: number; texto: string; tipo: "ok" | "error" }

type Sesion = {
  nombre: string
  email: string
  rol: string
  debeCambiarPassword: boolean
  requiere2fa: boolean
  desafioToken: string | null
}

type AppState = {
  sesion: Sesion | null
  entrar: (sesion: Sesion, accessToken: string | null) => void
  actualizar: (parcial: Partial<Sesion>, accessToken?: string | null) => void
  salir: () => void
  avisar: (texto: string, tipo?: "ok" | "error") => void
  avisos: Aviso[]
  cerrarAviso: (id: number) => void
}

const Ctx = createContext<AppState | null>(null)

export function Providers({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [avisos, setAvisos] = useState<Aviso[]>([])

  const avisar = useCallback((texto: string, tipo: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setAvisos((lista) => [...lista, { id, texto, tipo }])
    window.setTimeout(() => setAvisos((lista) => lista.filter((aviso) => aviso.id !== id)), 6000)
  }, [])

  const value = useMemo<AppState>(() => ({
    sesion,
    avisos,
    entrar: (nueva, accessToken) => {
      guardarToken(accessToken)
      setSesion(nueva)
    },
    actualizar: (parcial, accessToken) => {
      if (accessToken !== undefined) guardarToken(accessToken)
      setSesion((actual) => (actual ? { ...actual, ...parcial } : actual))
    },
    salir: () => {
      guardarToken(null)
      setSesion(null)
    },
    avisar,
    cerrarAviso: (id) => setAvisos((lista) => lista.filter((aviso) => aviso.id !== id)),
  }), [sesion, avisos, avisar])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-2" aria-live="polite">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role={aviso.tipo === "error" ? "alert" : "status"}
            className={`pointer-events-auto rounded-xl border-2 px-4 py-3 text-sm font-semibold shadow-lg ${aviso.tipo === "error" ? "border-brand bg-white text-brand-dark" : "border-cyan bg-white text-plum"}`}
          >
            {aviso.texto}
            <button type="button" className="ml-3 underline" onClick={() => value.cerrarAviso(aviso.id)}>Cerrar</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useApp(): AppState {
  const valor = useContext(Ctx)
  if (!valor) throw new Error("Falta el proveedor de la aplicacion")
  return valor
}
