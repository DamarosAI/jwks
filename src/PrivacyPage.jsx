import { useEffect } from 'react'

const SECTIONS = [
  {
    title: '1. Information we collect',
    body: [
      'We collect only what we need to operate this website and respond to you.',
      'Information you give us: your name, work email, organization, role, and anything you write when you request a pilot, contact us, or apply for a role.',
      'Information collected automatically: standard technical data such as IP address, browser and device type, pages visited, and approximate city-level location, gathered to keep the site secure and understand usage.',
      'Information from others: limited business-contact details from partners or public professional sources when we evaluate a potential pilot or collaboration.',
      'Please do not send sensitive or health information through this website. It is not the place for it.',
    ],
  },
  {
    title: '2. How we use information',
    items: [
      'To respond to pilot requests, questions, and other messages you send us.',
      'To operate, secure, maintain, and improve this website.',
      'To evaluate and arrange potential pilots, partnerships, and hiring.',
      'To send operational or relationship messages you have asked for. We do not sell your information or run third-party advertising.',
      'To meet legal, security, and contractual obligations.',
    ],
  },
  {
    title: '3. Legal bases',
    body: [
      'Where the GDPR or similar laws apply, we rely on your consent (for example, when you contact us), our legitimate interests in operating and securing the site and our business, and compliance with legal obligations. You may withdraw consent at any time.',
    ],
  },
  {
    title: '4. Cookies and analytics',
    body: [
      'We use a small number of essential and analytics cookies to keep the site working and to understand aggregate usage. You can control cookies through your browser settings; blocking some may affect how the site functions. We honor browser Do Not Track and global privacy control signals where required.',
    ],
  },
  {
    title: '5. How we share information',
    body: [
      'We share information only as needed with service providers who host, secure, and support the site, bound by contract to protect it; for legal and safety reasons when required by law or to protect rights and security; and in a business transfer if Damaros is involved in a merger, acquisition, or financing, under the same protections.',
      'We do not sell personal information, and we never share PHI through this website because we do not collect it here.',
    ],
  },
  {
    title: '6. Security and retention',
    body: [
      'We protect information with encryption in transit and at rest, access controls, and least-privilege practices. We keep information only as long as needed for the purposes above or as required by law, then delete or de-identify it. No system is perfectly secure, but we work to hold a high bar.',
    ],
  },
  {
    title: '7. Your rights and choices',
    body: [
      'Depending on where you live, you may have the right to access, correct, delete, or port your information, to object to or restrict certain uses, and to opt out of non-essential messages. To exercise any of these, contact us using the details below. We will respond within the timeframe the law requires and will not discriminate against you for exercising your rights.',
    ],
  },
  {
    title: '8. International transfers and children',
    body: [
      'We are based in the United States and may process information there or in other countries with appropriate safeguards. This website is intended for professional audiences and is not directed to children under 16, and we do not knowingly collect their information.',
    ],
  },
  {
    title: '9. Changes to this policy',
    body: [
      'We may update this policy as our practices or the law change. We will revise the date above and, for material changes, provide a clearer notice. Continued use of the site after an update means you accept the revised policy.',
    ],
  },
]

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Damaros'
    const tag = document.querySelector('meta[name="description"]')
    if (tag) tag.setAttribute('content', 'What the Damaros website collects, how it is used, and the choices you have.')
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', 'https://www.damaros.ai/privacy')
  }, [])

  return (
    <main className="page-shell privacy-page">
      <section className="privacy-hero" id="privacy-top">
        <p>Last updated 26 June 2026</p>
        <h1>Privacy <span className="accent-text">policy</span></h1>
        <p>This policy explains what information this website collects, how it is used, and the choices you have. It covers this website and our communications with you, nothing more.</p>
      </section>
      <div className="privacy-body">
        {SECTIONS.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.items && (
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </article>
        ))}
        <article className="privacy-contact">
          <h2>Contact us</h2>
          <p>
            Questions about this policy or your information? Reach us at{' '}
            <a href="mailto:team@damaros.ai?subject=Privacy%20policy%20question">team@damaros.ai</a>.
            We will get back to you.
          </p>
        </article>
      </div>
    </main>
  )
}
