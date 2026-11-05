import { getBranches, getSiteSettings } from "../lib/public-data"
import { Sticker } from "../components/ui/splash"
import { EnDesarrolloRecuadro } from "../components/ui/en-desarrollo-recuadro"
import { BranchCard, type BranchView } from "../components/site/branch-card"
import { Reveal } from "../components/ui/reveal"

export function SedesPage() {
  const branches = getBranches()
  const s = getSiteSettings()
  const list: BranchView[] = branches
  const [first, ...rest] = list
  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 md:px-10">
      <Sticker>Cali, Colombia</Sticker>
      <h1 className="mt-5 font-display text-5xl font-extrabold text-plum md:text-6xl">Sedes y contacto</h1>
      <p className="mt-4 max-w-2xl text-ink/70">Encuentra la sede más cercana, revisa si estamos abiertos hoy y escríbenos por WhatsApp.</p>
      {!list.length ? (
        <div className="mt-12">
          <EnDesarrolloRecuadro />
        </div>
      ) : (
        <div className="mt-12 space-y-14">
          <Reveal>
            <BranchCard b={first} index={0} whatsapp={s.whatsapp} variant="featured" />
          </Reveal>
          {rest.length === 1 && (
            <Reveal>
              <BranchCard b={rest[0]} index={1} whatsapp={s.whatsapp} variant="featured" mirror />
            </Reveal>
          )}
          {rest.length > 1 && (
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-2">
              {rest.map((b, i) => (
                <Reveal key={b.id} delay={(i % 2) * 120} className={`${i % 2 === 1 ? "md:mt-16" : ""} ${rest.length % 2 === 1 && i === rest.length - 1 ? "md:col-span-2" : ""}`}>
                  <BranchCard b={b} index={i + 1} whatsapp={s.whatsapp} variant={rest.length % 2 === 1 && i === rest.length - 1 ? "featured" : "tile"} mirror={i % 2 === 0} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
