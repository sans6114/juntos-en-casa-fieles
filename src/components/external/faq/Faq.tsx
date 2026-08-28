import { BrandName, Disclosure, SectionHeading } from "@/components/external/shared"

import { faqItems } from "./data"

const disclosureClass =
  "border-b border-[var(--linea)] [&>summary]:flex [&>summary]:items-center [&>summary]:justify-between [&>summary]:gap-6 [&>summary]:py-5 [&>summary]:text-base [&>summary]:font-semibold [&>summary]:text-[var(--dato)] md:[&>summary]:py-6 md:[&>summary]:text-lg"

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

        <div className="flex max-w-3xl flex-col border-t border-[var(--linea)]">
          {faqItems.map((item) => (
            <Disclosure
              key={item.id}
              summary={<BrandName>{item.question}</BrandName>}
              className={disclosureClass}
            >
              <p className="pb-5 pr-8 leading-relaxed text-[var(--suave)] md:pb-6">
                <BrandName>{item.answer}</BrandName>
              </p>
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  )
}
