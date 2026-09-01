/** Genuine FAQs — no invented clients, numbers, accreditations or guarantees. */
export interface Faq {
  q: string;
  a: string;
}

export const HOME_FAQS: Faq[] = [
  {
    q: "Which areas does Siyakha Technology Solutions service?",
    a: "We work on site across Johannesburg and Sandton, and in Durban and KwaZulu-Natal, with project delivery for multi-site clients elsewhere in South Africa. Remote IT support is available wherever your staff are.",
  },
  {
    q: "What does your managed IT service include?",
    a: "A monthly support arrangement covering remote helpdesk for staff issues, Microsoft 365 and mailbox administration, backups and recovery testing, cybersecurity such as endpoint protection and patching, and field support engineers on site when a problem cannot be fixed remotely.",
  },
  {
    q: "Do you handle full technology projects such as cabling and Wi-Fi?",
    a: "Yes. We design and install structured cabling, business and campus Wi-Fi, fibre links and risers, comms racks, SD-WAN and multi-site connectivity — and hand over documentation at the end of the project.",
  },
  {
    q: "Can you install and maintain commercial CCTV and access control?",
    a: "Yes. We specify commercial CCTV, access control and alarms for the site, install with our own engineers, plan recording retention and set up monitoring or remote viewing. Larger perimeter and command-centre infrastructure is delivered through our Siyakha Interlink capability.",
  },
  {
    q: "Do you build websites and manage hosting, domains and business email?",
    a: "Yes. We build business websites and landing pages, manage hosting, domains and DNS, set up business email on your own domain, cover SEO foundations, and maintain the site after launch.",
  },
  {
    q: "What kind of AI and process solutions do you offer businesses?",
    a: "AI voice agents that answer and log calls, enquiry handling and qualification, appointment booking and reminders, CRM follow-up automation, and workflow or document automation connecting the systems you already use.",
  },
  {
    q: "How quickly will someone respond to my enquiry?",
    a: "Enquiries go directly to the owner. Nikita Jacobs replies personally within one business day, and you can call 087 723 9183 or WhatsApp 081 501 2993 for anything urgent.",
  },
];

export const buildFaqSchema = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});
