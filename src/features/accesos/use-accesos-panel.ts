import { useEffect, useState } from "react"
import { api } from "../../shared/api"
import { toast } from "../en-desarrollo"

export type AccesosPanel = {
  modulos: string[]
  acciones_por_modulo: Record<string, string[]>
}

export function useAccesosPanel(enabled: boolean) {
  const [data, setData] = useState<AccesosPanel | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let cancel = false
    void (async () => {
      try {
        const r = await api("/api/v1/auth/accesos-panel")
        if (!r.ok) {
          if (!cancel) setError(true)
          toast("No fue posible verificar sus permisos. Intente nuevamente.")
          return
        }
        const body = (await r.json()) as AccesosPanel
        if (!cancel) {
          setData(body)
          setError(false)
        }
      } catch {
        if (!cancel) setError(true)
        toast("No fue posible verificar sus permisos. Intente nuevamente.")
      }
    })()
    return () => {
      cancel = true
    }
  }, [enabled])

  const puedeModulo = (clave: string) => {
    if (!data) return true
    if (clave === "cuenta") return true
    return data.modulos.includes(clave)
  }

  return { data, error, puedeModulo }
}
