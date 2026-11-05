import { Outlet } from "react-router-dom"
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { CartProvider } from "../components/cart/cart-provider"
import { getSiteSettings } from "../lib/public-data"

export function SiteLayout() {
  const settings = getSiteSettings()
  return (
    <CartProvider>
      <SiteHeader whatsapp={settings.whatsapp} />
      <main id="contenido">
        <Outlet />
      </main>
      <SiteFooter settings={settings} />
    </CartProvider>
  )
}
