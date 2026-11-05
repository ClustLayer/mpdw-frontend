import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { MENSAJE_EN_DESARROLLO, MSG, correoValido, passwordCumplePolitica, puedeEnviarLogin, puedeEnviarRecuperacion, rutaDeRol, tokenDesdeHash } from "../features/auth/logic"
import { api, mensajeDe } from "../shared/api"
import { useApp } from "./providers"

const campo = "mt-2 w-full rounded-xl border-2 border-plum/15 bg-white px-4 py-3.5 text-ink outline-none focus:border-cyan"
const boton = "mt-7 flex w-full items-center justify-center rounded-xl bg-brand px-5 py-3.5 font-bold text-white shadow-[4px_4px_0_0_var(--color-plum)] disabled:cursor-not-allowed disabled:opacity-50"

function Marco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-plum p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <img src="/brand/logo.png" alt="Mundo Pinturas Diana" className="relative size-20 rounded-full bg-white p-1" />
        <div>
          <h2 className="font-display text-5xl font-extrabold leading-[0.95]">Todo el negocio, en un solo lugar.</h2>
          <p className="mt-6 max-w-md text-white/75">Ventas, inventario, caja y clientes conectados para decidir mejor.</p>
        </div>
        <p className="text-sm text-white/60">Acceso exclusivo para personal autorizado.</p>
      </section>
      <section className="flex flex-col justify-center px-5 py-10 sm:px-12">
        <Link to="/" className="mb-8 text-sm font-semibold text-plum hover:text-brand">Volver al sitio</Link>
        <div className="w-full max-w-md">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Portal del equipo</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-plum">{titulo}</h1>
          {children}
        </div>
      </section>
    </main>
  )
}

function PasswordField({ id, label, value, onChange, autoComplete }: { id: string; label: string; value: string; onChange: (valor: string) => void; autoComplete: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="mt-5 block text-sm font-semibold" htmlFor={id}>
      {label}
      <span className="relative block">
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} type={visible ? "text" : "password"} autoComplete={autoComplete} className={`${campo} pr-28`} />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-plum" aria-pressed={visible} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} title={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible((v) => !v)}>
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </span>
    </label>
  )
}

export function HomePage() {
  const { avisar } = useApp()
  const abrir = () => avisar(MENSAJE_EN_DESARROLLO, "error")
  return (
    <main className="min-h-dvh bg-paper">
      <header className="flex items-center justify-between px-5 py-4">
        <a href="#contenido" className="sr-only focus:not-sr-only">Saltar al contenido</a>
        <p className="font-display text-xl font-extrabold text-plum">Mundo Pinturas Diana</p>
        <Link to="/login" className="rounded-xl bg-brand px-4 py-2 font-bold text-white" title="Ingresar al portal interno">Iniciar sesión</Link>
      </header>
      <section id="contenido" className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-5xl font-extrabold text-plum">Pinturas y color para cada espacio.</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">El catalogo publico conserva su lugar. Las operaciones internas se habilitan con la cuenta que asigna administracion.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="rounded-xl border-2 border-plum px-4 py-2 font-semibold" title="El catalogo publico se conectara en una historia posterior" onClick={abrir}>Catalogo</button>
          <button type="button" className="rounded-xl border-2 border-plum px-4 py-2 font-semibold" title="Las sedes publicas se conectaran en una historia posterior" onClick={abrir}>Sedes</button>
        </div>
      </section>
    </main>
  )
}

export function LoginPage() {
  const { entrar, avisar, sesion } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const emailId = useId()

  if (sesion && !sesion.requiere2fa && !sesion.debeCambiarPassword) return <Navigate to={rutaDeRol(sesion.rol)} replace />

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setError("")
    if (!correoValido(email)) {
      setError(MSG.email)
      return
    }
    if (!password) {
      setError(MSG.passwordVacia)
      return
    }
    setCargando(true)
    try {
      const respuesta = await api("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email: email.trim(), password }) }, false)
      const data = (await respuesta.json()) as { mensaje?: string; nombre?: string; rol?: string; email?: string; access_token?: string; desafio_token?: string; debe_cambiar_password?: boolean; requiere_2fa?: boolean; redireccion?: string }
      if (!respuesta.ok) {
        setError(data.mensaje || MSG.errorLogin)
        return
      }
      const requiere2fa = Boolean(data.requiere_2fa)
      const debe = Boolean(data.debe_cambiar_password)
      entrar({
        nombre: data.nombre || email,
        email: data.email || email.trim(),
        rol: data.rol || "Empleado",
        debeCambiarPassword: debe,
        requiere2fa,
        desafioToken: data.desafio_token ?? null,
      }, data.access_token ?? null)
      if (data.mensaje) avisar(data.mensaje)
      if (requiere2fa && !data.access_token) navigate("/verificacion", { replace: true })
      else if (debe) navigate("/cambiar-contrasena", { replace: true })
      else navigate(rutaDeRol(data.rol || "Empleado"), { replace: true })
    } catch {
      setError(MSG.errorLogin)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Marco titulo="Iniciar sesión">
      <p className="mt-2 text-sm text-ink/60">Usa las credenciales que te asignó administración. No hay registro público.</p>
      <form className="mt-6" onSubmit={enviar} noValidate>
        {error && <p role="alert" className="mb-4 rounded-xl border-2 border-brand bg-brand/5 p-3 text-sm font-medium text-brand-dark">{error}</p>}
        <label className="block text-sm font-semibold" htmlFor={emailId}>
          Correo electrónico
          <input id={emailId} name="email" type="email" autoComplete="username" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className={campo} />
        </label>
        <PasswordField id="password-login" label="Contraseña" value={password} onChange={setPassword} autoComplete="current-password" />
        <button className={boton} disabled={!puedeEnviarLogin(email, password) || cargando} title="Iniciar sesión con el correo y la contraseña" aria-label="Iniciar sesión">
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
      <Link to="/recuperar" className="mt-5 inline-block text-sm font-semibold text-plum underline-offset-4 hover:underline" title="Solicitar un enlace temporal para restablecer la contraseña">¿Olvidó su contraseña?</Link>
      <p className="mt-4 text-xs leading-relaxed text-ink/50">Tras 5 intentos fallidos la cuenta se bloquea 15 minutos. El acceso queda registrado en auditoria.</p>
    </Marco>
  )
}

export function RecuperarPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [cargando, setCargando] = useState(false)
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (!correoValido(email)) {
      setError(MSG.email)
      setInfo("")
      return
    }
    setCargando(true)
    setError("")
    try {
      const respuesta = await api("/api/v1/auth/recuperar", { method: "POST", body: JSON.stringify({ email: email.trim() }) }, false)
      const texto = await mensajeDe(respuesta)
      if (!respuesta.ok) setError(texto || MSG.errorSolicitud)
      else setInfo(texto || MSG.recuperacion)
    } catch {
      setError(MSG.errorSolicitud)
    } finally {
      setCargando(false)
    }
  }
  return (
    <Marco titulo="Recuperar contraseña">
      <p className="mt-2 text-sm text-ink/60">Le enviaremos un enlace de un solo uso si el correo pertenece a una cuenta activa.</p>
      <form className="mt-6" onSubmit={enviar} noValidate>
        {error && <p role="alert" className="mb-4 rounded-xl border-2 border-brand p-3 text-sm font-medium text-brand-dark">{error}</p>}
        {info && <p role="status" className="mb-4 rounded-xl border-2 border-cyan p-3 text-sm font-medium text-plum">{info}</p>}
        <label className="block text-sm font-semibold">Correo electrónico
          <input type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className={campo} />
        </label>
        <button className={boton} disabled={!puedeEnviarRecuperacion(email) || cargando} title="Enviar el enlace de recuperacion">Enviar enlace</button>
      </form>
      <Link to="/login" className="mt-5 inline-block text-sm font-semibold text-plum">Volver a iniciar sesión</Link>
    </Marco>
  )
}

export function NuevaContrasenaPage() {
  const navigate = useNavigate()
  const { avisar } = useApp()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [error, setError] = useState("")
  useEffect(() => setToken(tokenDesdeHash(window.location.hash)), [])
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (!password || !confirmar) return setError(MSG.campos)
    if (!passwordCumplePolitica(password)) return setError(MSG.politica)
    if (password !== confirmar) return setError(MSG.noCoinciden)
    if (!token) return setError(MSG.resetInvalido)
    try {
      const respuesta = await api("/api/v1/auth/restablecer", { method: "POST", body: JSON.stringify({ token, password, confirmar }) }, false)
      const texto = await mensajeDe(respuesta)
      if (!respuesta.ok) return setError(texto || MSG.errorSolicitud)
      avisar(texto || MSG.resetOk)
      navigate("/login", { replace: true })
    } catch {
      setError(MSG.errorSolicitud)
    }
  }
  return (
    <Marco titulo="Nueva contraseña">
      <p className="mt-2 text-sm text-ink/60">Elija una contraseña de 8 a 64 caracteres, con mayuscula, numero y un caracter de !@#$%^&*.</p>
      {error && <p role="alert" className="mt-4 rounded-xl border-2 border-brand p-3 text-sm text-brand-dark">{error}</p>}
      {!token && <p role="alert" className="mt-4 text-sm text-brand-dark">{MSG.resetInvalido} <Link to="/recuperar" className="underline">Solicitar uno nuevo</Link></p>}
      <form onSubmit={enviar}>
        <PasswordField id="nueva" label="Nueva contraseña" value={password} onChange={setPassword} autoComplete="new-password" />
        <PasswordField id="confirma" label="Confirmar nueva contraseña" value={confirmar} onChange={setConfirmar} autoComplete="new-password" />
        <button className={boton} disabled={!password || !confirmar} title="Guardar la nueva contraseña">Restablecer contraseña</button>
      </form>
    </Marco>
  )
}

export function VerificacionPage() {
  const { sesion, actualizar, avisar } = useApp()
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState("")
  if (!sesion) return <Navigate to="/login" replace />
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    try {
      const respuesta = await api("/api/v1/auth/verificar-2fa", {
        method: "POST",
        body: JSON.stringify({ codigo, desafio_token: sesion.desafioToken ?? "" }),
      }, false)
      const data = (await respuesta.json()) as { mensaje?: string; access_token?: string; debe_cambiar_password?: boolean; redireccion?: string }
      if (!respuesta.ok) return setError(data.mensaje || MSG.codigoError)
      actualizar({ requiere2fa: false, debeCambiarPassword: Boolean(data.debe_cambiar_password), desafioToken: null }, data.access_token ?? null)
      avisar(data.mensaje || MSG.verificado)
      navigate(data.debe_cambiar_password ? "/cambiar-contrasena" : rutaDeRol(sesion.rol), { replace: true })
    } catch {
      setError(MSG.codigoError)
    }
  }
  const reenviar = async () => {
    const respuesta = await api("/api/v1/auth/reenviar-2fa", { method: "POST", body: JSON.stringify({ desafio_token: sesion.desafioToken ?? "" }) }, false)
    const texto = await mensajeDe(respuesta)
    if (!respuesta.ok) setError(texto || MSG.codigoError)
    else avisar(texto || MSG.reenviado)
  }
  return (
    <Marco titulo="Verificación en dos pasos">
      <p className="mt-2 text-sm text-ink/60">Ingrese el codigo de 6 digitos enviado a su correo. Vence en 10 minutos.</p>
      {error && <p role="alert" className="mt-4 rounded-xl border-2 border-brand p-3 text-sm text-brand-dark">{error}</p>}
      <form onSubmit={enviar}>
        <label className="mt-6 block text-sm font-semibold">Codigo de verificacion
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))} className={campo} />
        </label>
        <button className={boton} disabled={codigo.length === 0} title="Verificar el codigo recibido">Verificar</button>
      </form>
      <button type="button" className="mt-4 text-sm font-semibold text-plum underline" title="Invalidar el codigo anterior y enviar uno nuevo" onClick={reenviar}>Reenviar codigo</button>
    </Marco>
  )
}

export function CambiarContrasenaPage() {
  const { sesion, actualizar, avisar } = useApp()
  const navigate = useNavigate()
  const [actual, setActual] = useState("")
  const [password, setPassword] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [error, setError] = useState("")
  if (!sesion) return <Navigate to="/login" replace />
  const obligatorio = sesion.debeCambiarPassword
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (!actual || !password || !confirmar) return setError(MSG.campos)
    if (!passwordCumplePolitica(password, actual)) return setError(MSG.politica)
    if (password !== confirmar) return setError(MSG.noCoinciden)
    try {
      const respuesta = await api("/api/v1/auth/cambiar-contrasena", { method: "POST", body: JSON.stringify({ password_actual: actual, password, confirmar }) })
      const data = (await respuesta.json()) as { mensaje?: string; access_token?: string; requiere_2fa?: boolean }
      if (!respuesta.ok) return setError(data.mensaje || MSG.cambioError)
      actualizar({ debeCambiarPassword: false, requiere2fa: Boolean(data.requiere_2fa) }, data.access_token ?? null)
      avisar(data.mensaje || MSG.cambioOk)
      navigate(data.requiere_2fa ? "/verificacion" : rutaDeRol(sesion.rol), { replace: true })
    } catch {
      setError(MSG.cambioError)
    }
  }
  return (
    <Marco titulo="Cambiar contraseña">
      <p className="mt-2 text-sm text-ink/60">{obligatorio ? "Debe actualizar la contraseña temporal antes de continuar." : "Puede volver a su panel si prefiere no cambiarla ahora."}</p>
      {error && <p role="alert" className="mt-4 rounded-xl border-2 border-brand p-3 text-sm text-brand-dark">{error}</p>}
      <form onSubmit={enviar}>
        <PasswordField id="actual" label="Contraseña actual" value={actual} onChange={setActual} autoComplete="current-password" />
        <PasswordField id="nueva-auth" label="Nueva contraseña" value={password} onChange={setPassword} autoComplete="new-password" />
        <PasswordField id="confirma-auth" label="Confirmar nueva contraseña" value={confirmar} onChange={setConfirmar} autoComplete="new-password" />
        <button className={boton} disabled={!actual || !password || !confirmar} title="Guardar la contraseña nueva">Guardar contraseña</button>
      </form>
      {!obligatorio && <button type="button" className="mt-4 text-sm font-semibold text-plum" title="Volver sin cambiar la contraseña" onClick={() => navigate(rutaDeRol(sesion.rol))}>Cancelar</button>}
    </Marco>
  )
}

const MODULOS = ["Resumen", "Usuarios", "Sedes", "Productos", "Inventario", "Clientes", "Ventas", "Caja", "Auditoria"]

export function PanelPage({ modulo }: { modulo?: string }) {
  const { sesion, avisar } = useApp()
  if (!sesion) return <Navigate to="/login" replace />
  if (sesion.debeCambiarPassword) return <Navigate to="/cambiar-contrasena" replace />
  if (sesion.requiere2fa) return <Navigate to="/verificacion" replace />
  const titulo = modulo ?? "Inicio"
  return (
    <section>
      <h1 className="font-display text-3xl font-extrabold text-plum">{titulo}</h1>
      <p className="mt-3 max-w-xl text-ink/70">{modulo ? MENSAJE_EN_DESARROLLO : `Hola, ${sesion.nombre}. Su rol es ${sesion.rol}.`}</p>
      {modulo && <button type="button" className="mt-6 rounded-xl bg-plum px-4 py-2 font-bold text-white" title="Esta accion pertenece a otra historia" onClick={() => avisar(MENSAJE_EN_DESARROLLO, "error")}>Continuar</button>}
      {!modulo && (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {MODULOS.slice(1).map((item) => (
            <li key={item}><Link className="block rounded-xl border-2 border-plum/10 bg-white p-4 font-semibold hover:border-brand" to={`/panel/${sesion.rol.toLowerCase()}/${item.toLowerCase()}`}>{item}</Link></li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function NoEncontrada() {
  return <main className="p-10"><h1 className="font-display text-4xl font-extrabold text-plum">Pagina no encontrada</h1><Link to="/" className="mt-4 inline-block font-semibold text-brand">Volver al inicio</Link></main>
}
