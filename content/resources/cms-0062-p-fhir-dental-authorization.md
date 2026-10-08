A federal proposed rule released in April moves the entire prior authorization system in US healthcare toward FHIR-based exchange. The headline of the rule is drug prior authorization. The part that matters for dental is buried further down.

*Updated October 8, 2026: the comment period has closed. See "Where the rule stands now" below.*

On April 10, 2026, the Centers for Medicare and Medicaid Services released proposed rule CMS-0062-P, titled the "2026 CMS Interoperability Standards and Prior Authorization for Drugs Proposed Rule." The public comment period closed June 15, 2026. As of October 2026, CMS has not published a final rule.

The rule is getting written about quickly, and some of the early commentary frames it as a federal mandate specifically for dental referral coordination. That framing is wrong, and it matters that it is wrong, because the actual rule still has real implications for dental practices that are worth understanding clearly.

## What CMS-0062-P actually proposes

The rule has two major pieces and they sit under different legal authorities.

The first piece, the part the title is about, extends federal electronic prior authorization requirements to prescription drugs. The 2020 Interoperability and Patient Access final rule (CMS-9115-F) and the 2024 Interoperability and Prior Authorization final rule (CMS-0057-F) together built a FHIR-based prior authorization framework for non-drug items and services across Medicare Advantage, Medicaid managed care, CHIP fee-for-service, and Qualified Health Plan issuers on the federally facilitated exchanges. CMS-0062-P extends that framework to drugs, tightens decision timeframes, mandates public reporting of API metrics, and adds a new mandatory FHIR endpoint registry.

The second piece sits under HIPAA Administrative Simplification authority. Under that authority, the Department of Health and Human Services proposes adopting specific HL7 FHIR implementation guides as HIPAA standards for prior authorization transactions, including referral certification and authorization. The CMS fact sheet names dental, professional, and institutional transactions as covered. This applies broadly to HIPAA covered entities, providers, health plans, and clearinghouses that electronically exchange prior authorization and referral certification information.

### The rule at a glance

- Rule number: CMS-0062-P
- Released April 10, 2026, comment period closed June 15, 2026
- Status as of October 2026: still a proposed rule, no final rule published
- Headline: prior authorization for prescription drugs, under FHIR-based standards
- Buried lede for dental: a HIPAA Administrative Simplification proposal naming FHIR for referral certification and authorization transactions, including dental
- Proposed compliance date for NCPDP standards: October 1, 2027
- Builds on the 2020 Interoperability final rule and the 2024 Prior Authorization final rule

## What the rule does not propose

It is worth being explicit about what is not in the rule, because some of what is circulating online overstates it.

**It does not create a new compliance category for dental referrals.** Referral certification and authorization has been a named HIPAA transaction since the original Administrative Simplification rules. What is new is the proposed adoption of FHIR as the standard for it, not the existence of the category.

**It does not impose a direct referral coordination mandate on every dental practice.** The primary impacted entities under the rule's main provisions are payers in specific federal programs, Medicare Advantage organizations, Medicaid managed care plans, CHIP managed care entities, and QHP issuers on federally facilitated exchanges. Provider obligations come downstream as payer infrastructure adopts FHIR and as the broader HIPAA standards adoption process plays out.

**It does not endorse or require any specific platform.** What it does is standardize how electronic prior authorization and referral certification data moves between HIPAA covered entities, and name FHIR as that standard.

## Why dental practices should still care

The direction is the story. The 2020 rule established the framework. The 2024 rule made FHIR-based prior authorization real for non-drug services in federal coverage programs, with payer compliance dates landing January 1, 2027. The 2026 rule extends FHIR to drug prior authorization and proposes FHIR as the HIPAA standard for the broader set of authorization transactions, including the ones dental practices use.

Once federal-program payers are required to support FHIR-based prior authorization APIs, commercial payers historically follow within roughly 18 to 24 months. Once the HIPAA standards in CMS-0062-P are finalized, the practical floor for electronic exchange of prior authorization and referral certification information moves to FHIR. That is the part that will eventually reach every practice, dental or otherwise, that submits authorizations electronically.

The American Dental Association collected member input during the comment period. Its public framing of the proposed rule identified three areas of dental-specific concern:

- **The FHIR transition itself.** Every dental office that submits prior authorizations electronically would be affected by the change from current standards to FHIR-based exchange.
- **The Direct Data Entry portal exception.** CMS is considering eliminating the exception that currently allows dental offices to submit data for claims, benefit verification, and prior authorizations through payer web portals. Small and rural dental practices rely on this exception.
- **Cybersecurity provisions.** The rule solicits input on healthcare cybersecurity, and dental offices face distinct vulnerabilities that the ADA wants reflected in the final rule.

If your practice submits prior authorizations electronically, the FHIR transition will reach you. If your practice depends on payer web portals for those submissions, the Direct Data Entry exception change is a direct operational risk. If your practice is small or rural, both of those carry significant weight.

## What it means for referral and authorization infrastructure

Two things follow from the regulatory direction.

Fax and unsecured email are getting further from the standard. The federal direction is structured electronic exchange built on FHIR. Practices and platforms that depend on legacy formats will face increasing friction as payer infrastructure catches up and as HIPAA standards adoption progresses.

Infrastructure choices made now carry forward. A practice picking a referral or prior authorization tool in 2026 should be evaluating whether the tool is built on modern healthcare data standards and aligned with HIPAA's evolving requirements, or whether it is layering a web interface over fax workflows. Vague answers from vendors about future standards readiness are a signal worth taking seriously.

> CaseLink was built HIPAA aligned from day one, with end-to-end encryption, audit logging on every case, and structured electronic exchange between offices. CaseLink is not a federally mandated platform. No platform is. It is a platform whose architecture aligns with where federal interoperability is going, so practices on CaseLink will not be unwinding fax workflows when commercial payers catch up to the FHIR-based standard.

## Where the rule stands now

The comment period closed on June 15, 2026. CMS now reviews the comments it received and decides what to keep, change, or drop before publishing a final rule in the Federal Register. As of October 2026, it has not done so, and CMS has not announced a date.

Three things are worth knowing while the rule is pending.

**The final rule can differ from the proposal.** Provisions the ADA flagged, including the Direct Data Entry portal exception, could be kept, changed, or removed. The proposed October 1, 2027 compliance date for NCPDP standards could also move.

**The direction is unlikely to reverse.** The 2020 and 2024 rules already moved federal-program prior authorization toward FHIR. CMS-0062-P extends that path. Whatever the final details, structured electronic exchange is where authorization and referral certification are heading.

**Nothing changes for your practice until a final rule is in effect.** There is no new obligation today. This is a planning signal.

## What to do now

Watch for the final rule and the ADA's summary of it. If your practice relies on payer web portals for prior authorizations, plan for the possibility that the Direct Data Entry exception changes.

If your practice is evaluating referral or authorization tools right now, ask vendors two questions. First, what is your plan to support FHIR-based exchange as the standards finalize. Second, how does your current architecture handle structured prior authorization and referral certification data. The answers will tell you a lot about which tools were built for where the industry is going and which were built for where it was. Our checklist on [how to choose dental referral software](/resources/how-to-choose-dental-referral-software) covers the other questions worth asking.
