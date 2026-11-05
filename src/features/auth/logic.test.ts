import { describe, expect, it } from "vitest"
import {
  MENSAJE_EN_DESARROLLO,
  MSG,
  calcularAvisoMs,
  correoValido,
  passwordCumplePolitica,
  puedeEnviarLogin,
  rutaDeRol,
  tokenDesdeHash,
} from "./logic"

describe("validacion de autenticacion", () => {
  it("exige formato de correo y habilita el boton solo con campos diligenciados", () => {
    expect(correoValido("ana@mpdw.co")).toBe(true)
    expect(correoValido("ana")).toBe(false)
    expect(puedeEnviarLogin("", "secreto")).toBe(false)
    expect(puedeEnviarLogin("ana@mpdw.co", "")).toBe(false)
    expect(puedeEnviarLogin("ana@mpdw.co", "x")).toBe(true)
  })

  it("aplica la politica de contraseña de HU 04", () => {
    expect(passwordCumplePolitica("ClaveSegura#1")).toBe(true)
    expect(passwordCumplePolitica("clavesegura1")).toBe(false)
    expect(passwordCumplePolitica("ClaveSegura#1", "ClaveSegura#1")).toBe(false)
  })

  it("conserva los mensajes literales y el aviso de inactividad", () => {
    expect(MSG.credenciales).toBe("Credenciales no válidas, por favor intente de nuevo.")
    expect(MSG.bienvenida("Ana")).toBe("Bienvenido(a), Ana.")
    expect(MSG.logout).toBe("Sesión cerrada correctamente.")
    expect(calcularAvisoMs(60, 5)).toBe(55 * 60_000)
    expect(rutaDeRol("Gerente")).toBe("/panel/gerente")
    expect(tokenDesdeHash("#rt=abc")).toBe("abc")
    expect(MENSAJE_EN_DESARROLLO).toBe("Funcionalidad en desarrollo")
  })
})
