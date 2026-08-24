import { Disclosure, SectionHeading } from "@/components/external/shared"

import { faqItems } from "./data"

const disclosureClass =
  "[&>summary]:flex [&>summary]:items-center [&>summary]:justify-between border-b border-[var(--linea)]"

export function Faq() {
  return (
    <section
      id="faq"
      aria-label="Preguntas frecuentes"
      className="campo-papel jec-anchor px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Preguntas frecuentes"
          className="mb-12 md:mb-16"
        />

        <div className="flex max-w-xl flex-col">
          {faqItems.map((item) => (
            <Disclosure key={item.id} summary={item.question} className={disclosureClass}>
              <p className="text-[var(--suave)]">{item.answer}</p>
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  )
}
