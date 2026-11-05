import { Navigate, Route, Routes } from "react-router-dom"
import { CambiarContrasenaPage, HomePage, LoginPage, NoEncontrada, NuevaContrasenaPage, PanelPage, RecuperarPage, VerificacionPage } from "./pages"
import { Shell } from "./shell"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecuperarPage />} />
      <Route path="/nueva-contrasena" element={<NuevaContrasenaPage />} />
      <Route path="/verificacion" element={<VerificacionPage />} />
      <Route path="/cambiar-contrasena" element={<CambiarContrasenaPage />} />
      <Route path="/panel/administrador" element={<Shell><PanelPage /></Shell>} />
      <Route path="/panel/gerente" element={<Shell><PanelPage /></Shell>} />
      <Route path="/panel/empleado" element={<Shell><PanelPage /></Shell>} />
      <Route path="/panel/:rol/:modulo" element={<Shell><Modulo /></Shell>} />
      <Route path="/registro" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  )
}

function Modulo() {
  const modulo = window.location.pathname.split("/").filter(Boolean).at(-1) ?? "modulo"
  return <PanelPage modulo={modulo} />
}
