import { Outlet } from "react-router-dom"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { CartProvider } from "../components/cart/cart-provider"
import { getSiteSettings } from "../lib/public-data"

export function SiteLayout() {
  const settings = getSiteSettings()
  return (
    <CartProvider>
      <a href="#contenido" className="figma-bypass-link">
        Saltar al contenido
      </a>
      <SiteHeader whatsapp={settings.whatsapp} />
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter settings={settings} />
    </CartProvider>
  )
}
