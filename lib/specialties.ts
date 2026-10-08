/**
 * Specialty landing pages at /referral-software/<slug>.
 *
 * Content rules (same as lib/faqs.ts and the blog facts file):
 * - CaseLink claims only restate facts already on the site. No invented
 *   CaseLink metrics, no patient scheduling, not a PMS, no competitor names.
 * - "What a good referral includes" is general clinical practice, written
 *   as guidance for the referring office, never as a CaseLink feature list.
 *   Do not claim specific file-type support (for example CBCT viewers).
 */

export type Specialty = {
  slug: string;
  /** Plural noun used in headings: "endodontists" */
  plural: string;
  /** Singular label for chips and cards: "Endodontics" */
  field: string;
  metaTitle: string;
  description: string;
  h1: string;
  lead: string;
  /** Typical reasons a GP refers to this specialty. */
  referralReasons: string[];
  /** What the referring office should send so the case can start cleanly. */
  goodReferral: string[];
  /** Why referral visibility matters for this specialty specifically. */
  whyItMatters: string;
  faqs: { q: string; a: string }[];
  /** Optional Resources article slug for a "Read the guide" link. */
  guide?: string;
};

const sharedFaqs = (plural: string) => [
  {
    q: `How much does CaseLink cost for ${plural}?`,
    a: "The specialist plan is $299 per month, or $269 per month on yearly billing, and the first month is free. General dentists who refer to you use CaseLink for free. There is no setup fee and no contract.",
  },
  {
    q: `Do the general dentists who refer to me have to pay?`,
    a: "No. The general dentist plan is permanently free, with unlimited referrals and no credit card. You can invite any referring GP from the referral screen in under a minute.",
  },
  {
    q: "Does CaseLink replace my practice management system?",
    a: "No. CaseLink works alongside Dentrix, Eaglesoft, Open Dental, and others. Scheduling, charting, and billing stay where they are. CaseLink handles the referral and the communication between offices.",
  },
  {
    q: "Is CaseLink HIPAA compliant?",
    a: "Yes. Every referral, message, and file is encrypted in transit and at rest, with audit logs on every action and role-based access controls. CaseLink signs a Business Associate Agreement on signup with every practice.",
  },
];

export const specialties: Specialty[] = [
  {
    slug: "endodontists",
    plural: "endodontists",
    field: "Endodontics",
    metaTitle: "Referral Software for Endodontists",
    description:
      "HIPAA-compliant referral software for endodontists. Receive GP referrals with radiographs and clinical notes attached, track every case from intake to treatment, and see which offices refer most. Free for referring GPs.",
    h1: "Referral software for endodontists.",
    lead: "Most new endodontic patients arrive through a general dentist. CaseLink gives your practice one inbox for every incoming case, with the clinical context attached and a status both offices can see.",
    referralReasons: [
      "Root canal treatment on complex or calcified anatomy",
      "Retreatment of a previously treated tooth",
      "Diagnosis of unexplained pain or a suspected cracked tooth",
      "Endodontic surgery, such as an apicoectomy",
      "Trauma involving the pulp",
    ],
    goodReferral: [
      "The tooth number and the reason for referral",
      "Recent periapical radiographs, and any other imaging already taken",
      "Symptoms, test results, and how long the problem has been present",
      "Medical history and current medications",
      "Insurance details and the patient's contact information",
      "Whether the GP plans to place the final restoration",
    ],
    whyItMatters:
      "Endodontic cases are often urgent. A patient in pain who has to call a number on a paper slip may go elsewhere, or wait until the tooth gets worse. When the case lands in your inbox with radiographs attached, your team can reach out first and the referring GP can see that the patient was contacted.",
    faqs: [
      {
        q: "Can the referring GP see when the root canal is complete?",
        a: "Yes. Each referral has a timestamped status that both offices see, from received through consult scheduled and treatment. Outcome notes and treatment reports go back to the GP in the same case record, so the patient returns for the final restoration without phone tag.",
      },
      ...sharedFaqs("endodontists"),
    ],
    guide: "how-endodontists-track-and-manage-incoming-referrals",
  },
  {
    slug: "orthodontists",
    plural: "orthodontists",
    field: "Orthodontics",
    metaTitle: "Referral Software for Orthodontists",
    description:
      "HIPAA-compliant referral software for orthodontists. Receive GP referrals with photos, radiographs, and notes attached, track every consult, and see which offices send the most new patients. Free for referring GPs.",
    h1: "Referral software for orthodontists.",
    lead: "General dentists see children and adults long before an orthodontic evaluation. CaseLink turns that recommendation into a tracked referral, so the consult actually happens and the referring office hears back.",
    referralReasons: [
      "Crowding, spacing, or bite concerns noticed at a recall visit",
      "Early evaluation for a child with developing bite issues",
      "Adult orthodontic treatment or clear aligner consults",
      "Orthodontic preparation before implant or restorative work",
      "Impacted or missing teeth that need orthodontic management",
    ],
    goodReferral: [
      "The concern the GP noticed, in plain terms",
      "Recent radiographs, such as a panoramic image, and any photos",
      "The patient's age and dental development stage",
      "Relevant medical history",
      "Parent or guardian contact details for minors",
      "Any restorative plans that depend on orthodontic treatment",
    ],
    whyItMatters:
      "Orthodontic referrals are rarely urgent, which makes them easy to forget. Families put off the call, and the recommendation fades until the next recall. A tracked referral with a follow-up prompt keeps the consult from slipping, and it shows the referring GP that their recommendation turned into a visit.",
    faqs: [
      {
        q: "What happens if a family does not book the orthodontic consult?",
        a: "If a patient has not booked inside the follow-up window, the case surfaces for outreach. Both offices see that the consult is still open, so the recommendation does not quietly disappear.",
      },
      ...sharedFaqs("orthodontists"),
    ],
  },
  {
    slug: "periodontists",
    plural: "periodontists",
    field: "Periodontics",
    metaTitle: "Referral Software for Periodontists",
    description:
      "HIPAA-compliant referral software for periodontists. Receive GP referrals with charting and radiographs attached, share treatment updates, and keep co-managed patients coordinated. Free for referring GPs.",
    h1: "Referral software for periodontists.",
    lead: "Periodontal patients are often co-managed for years, moving between the general practice and your office. CaseLink keeps every referral, update, and outcome report in one shared record both teams can see.",
    referralReasons: [
      "Moderate to advanced periodontitis",
      "Disease that has not responded to initial therapy",
      "Gum recession and soft tissue grafting",
      "Implant placement or bone grafting",
      "Peri-implantitis around an existing implant",
    ],
    goodReferral: [
      "A recent periodontal chart with probing depths",
      "Radiographs that show bone levels",
      "Treatment already provided, such as scaling and root planing",
      "Medical history, including diabetes and smoking status",
      "Current medications",
      "Whether the GP expects to share maintenance visits",
    ],
    whyItMatters:
      "Periodontal care rarely ends with one visit. Patients alternate maintenance between offices, and both teams need to know what was done and what comes next. One shared case record replaces the letters and phone calls that usually carry that information.",
    faqs: [
      {
        q: "Can I send treatment updates back to the referring GP?",
        a: "Yes. Encrypted messages, files, and outcome reports stay in the same case record, organized by patient and by practice. The GP sees the update without a fax or a phone call.",
      },
      ...sharedFaqs("periodontists"),
    ],
  },
  {
    slug: "oral-surgeons",
    plural: "oral surgeons",
    field: "Oral surgery",
    metaTitle: "Referral Software for Oral Surgeons",
    description:
      "HIPAA-compliant referral software for oral and maxillofacial surgeons. Receive GP referrals with radiographs, medical history, and insurance attached, and track every case from consult to surgery. Free for referring GPs.",
    h1: "Referral software for oral surgeons.",
    lead: "Oral surgery referrals carry a lot of detail: imaging, medical history, medications, and insurance. CaseLink delivers it all with the referral, so your team can review the case before the patient calls.",
    referralReasons: [
      "Third molar extractions, including impacted teeth",
      "Complex or surgical extractions",
      "Dental implant placement",
      "Bone grafting and sinus lifts",
      "Biopsies and evaluation of suspicious lesions",
    ],
    goodReferral: [
      "The procedure requested and the teeth involved",
      "A recent panoramic radiograph, and any other imaging already taken",
      "A complete medical history",
      "Current medications, especially blood thinners and bone medications",
      "Insurance details",
      "Any sedation or anxiety concerns the patient has raised",
    ],
    whyItMatters:
      "Missing medical history or medications can delay a surgical case by days. When the referral arrives complete, your team can review it, verify insurance, and contact the patient sooner. The referring office sees each step, so nobody calls to ask whether the patient was seen.",
    faqs: [
      {
        q: "What can a GP attach to an oral surgery referral?",
        a: "Patient details, x-rays, insurance information, treatment notes, and supporting attachments. The case arrives with the clinical context already in place, so your team is not chasing missing details.",
      },
      ...sharedFaqs("oral surgeons"),
    ],
  },
  {
    slug: "prosthodontists",
    plural: "prosthodontists",
    field: "Prosthodontics",
    metaTitle: "Referral Software for Prosthodontists",
    description:
      "HIPAA-compliant referral software for prosthodontists. Receive GP referrals with records attached, coordinate multi-office treatment plans, and keep every update in one shared case record. Free for referring GPs.",
    h1: "Referral software for prosthodontists.",
    lead: "Prosthodontic cases often involve several offices over many months. CaseLink keeps the referral, the records, and every update in one place, so each provider works from the same plan.",
    referralReasons: [
      "Complex restorative or full-mouth rehabilitation",
      "Complete and partial dentures",
      "Implant-supported restorations",
      "Severe wear or bite collapse",
      "Cosmetic cases that need a coordinated treatment plan",
    ],
    goodReferral: [
      "The patient's goals and the GP's concerns",
      "Recent radiographs and clinical photos",
      "Records of existing restorations",
      "Medical history and current medications",
      "Other specialists already involved in the case",
      "Insurance details",
    ],
    whyItMatters:
      "A single prosthodontic case can involve a GP, a surgeon, and a lab. When updates live in letters and phone calls, someone always works from an old plan. A shared case record with timestamped updates keeps every office aligned from consult to final restoration.",
    faqs: [
      {
        q: "Can several offices work on the same case?",
        a: "Yes. Each referral keeps its records, messages, and status in one case record, and every office involved sees the same timeline. Updates are timestamped, so it is clear what changed and when.",
      },
      ...sharedFaqs("prosthodontists"),
    ],
  },
];

export function getSpecialty(slug: string) {
  return specialties.find((s) => s.slug === slug);
}
