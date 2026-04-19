# DOMAIN GLOSSARY — ChatNow.Zone
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Source:** Tech Debt Delta 2026-04-16 + OQMI Coding Doctrine v2.0
**Repo:** OmniQuestMediaInc/ChatNowZone--BUILD
**Last updated:** 2026-04-18

This file is the canonical naming authority for all code, comments,
documentation, and database identifiers in the ChatNow.Zone codebase.
Agents must check this file before naming any domain concept.
If a required term is absent, HARD_STOP and raise a naming question
to Program Control. Do not invent terms.

HOW TO USE:
- Exact casing shown is required in all code, comments, and docs
- Database column names use snake_case equivalents
  (e.g. ChatZoneTokens = czt_balance in DB)
- Terms marked RETIRED must not appear in any new code
- If you see a RETIRED term in existing code, flag it in your report-back

---

## PLATFORM AND COMPANY

| Term | Definition | Code identifier |
|------|------------|-----------------|
| OmniQuest Media Inc. | Parent company | OmniQuestMediaInc |
| ChatNow.Zone | Flagship platform | ChatNow.Zone (marketing), cnz (code prefix) |
| OQMI | OmniQuest Media Inc. abbreviation | OQMI |
| Parks | OQMInc digital venues collectively | parks |

---

## USERS AND ROLES

| Term | Definition | Code identifier | Notes |
|------|------------|-----------------|-------|
| Guests | Platform consumers | guests, guest_id | Never "users" or "customers" in code or UI |
| Creators | On-screen performers (external-facing) | creators, creator_id | |
| Models | On-screen performers (internal/code) | models | Internally "models"; externally "Creators" |
| Agents | Human Contact Zone crew members | agents, agent_id | Diamond Concierge, HCZ crew |
| Admin | Platform administrators | admin | |

---

## TOKEN ECONOMY

| Term | Definition | Code identifier | Status |
|------|------------|-----------------|--------|
| ChatZoneTokens | Universal platform currency. The only token type. | CZT, czt_balance | ACTIVE — only currency |
| CZT | Abbreviation for ChatZoneTokens | CZT | ACTIVE |
| RETIRED: ShowZoneTokens | Retired premium token type | RETIRED: SZT | Do not use |
| RETIRED: Venue Scarcity Tokens | Retired limited-inventory token | RETIRED: VST | Do not use |
| RETIRED: Wristband Tokens | Retired physical event token | RETIRED: wristband_token | Do not use |
| PURCHASED | Token origin: bought by guest | PURCHASED | Origin tag on czt_balance |
| GIFTED | Token origin: gifted/granted | GIFTED | Origin tag on czt_balance |
| wallet_bucket | Segment of token balance by origin | wallet_bucket | PURCHASED or GIFTED |

---

## CREATOR PAYOUT

| Term | Definition | Code identifier |
|------|------------|-----------------|
| FairPay/FairPlay | Creator payout engine doctrine | FairPayFairPlay (class), FAIRPAY (prefix) |
| Room-Heat Engine | Real-time composite score driving payout rate | RoomHeatEngine, room_heat_score |
| RATE_COLD | Heat 0-33 = $0.075/CZT payout rate | RATE_COLD |
| RATE_WARM | Heat 34-60 = $0.080/CZT payout rate | RATE_WARM |
| RATE_HOT | Heat 61-85 = $0.085/CZT payout rate | RATE_HOT |
| RATE_INFERNO | Heat 86-100 = $0.090/CZT payout rate | RATE_INFERNO |
| RATE_DIAMOND_FLOOR | $0.080 minimum on 10,000+ CZT bulk | RATE_DIAMOND_FLOOR |
| Tease rate | Pre-Mic Drop reveal rate ($0.065 rack / $0.080 bulk) | TEASE, rate_state: TEASE |
| Mic Drop rate | $0.090 bulk / $0.075 rack full performance range | MIC_DROP, rate_state: MIC_DROP |
| Day 91 Parity | All creators registered Days 1-90 access full range on Day 91 | day_91_parity, creator_registration_day |
| Pixel Legacy | First 3,000 pre-launch creator registrants | pixel_legacy: bool |
| Pixel Legacy Signing Bonus | Month 4 bonus for qualifying Pixel Legacy creators | reason_code: PIXEL_LEGACY_SIGNING_BONUS |

---

## VENUES AND ZONES

| Term | Definition | Code identifier | Notes |
|------|------------|-----------------|-------|
| ChatNow.Zone | Main platform / free entry zone | chatNowZone | |
| ShowTheatre.Zone | Premium performance venue (CZT-gated) | ShowTheatre, show_theatre | Launch requirement — NOT deferred |
| theBijou.Zone | Ultra-premium curated experience | theBijou, bijou | Launch requirement |
| Bijou | Short form of theBijou.Zone | bijou | |
| HeartZone | Biometric-linked intimate experience zone | HeartZone, heart_zone | |
| GuestZone | Guest services and CS tooling | GuestZone, guest_zone | |
| CreatorControl.Zone | Creator dashboard and control surface | CreatorControlZone | |
| Diamond Concierge | Security and Fraud function with hospitality surface | DiamondConcierge, diamond_concierge | NOT Guest Services |
| HCZ | Human Contact Zone — agent escalation pathway | HCZ, hcz | |
| RETIRED: ShowZonePass | Retired pass SKU system | RETIRED: show_zone_pass | |
| Wristband | Physical or account-linked access identifier | wristband | Access identifier is RETAINED; token economy layer is RETIRED |

---

## MEMBERSHIP AND ACCESS

Source of truth: `docs/MEMBERSHIP_LIFECYCLE_POLICY.md` v1.0 (CEO-approved
2026-04-17). On any conflict, the policy wins; this glossary follows.

### Canonical `MembershipTier` enum (locked — exactly six values)

| Rank | Term | Code identifier | Paid? | Notes |
|------|------|-----------------|-------|-------|
| 0 | Guest | `GUEST` | No | 31-day expiry; locks then purges per policy §3.1 |
| 1 | VIP | `VIP` | No | Permanent once earned; 30-day age re-verify cadence (§3.2) |
| 2 | VIP Silver | `VIP_SILVER` | Yes | 90+1 day paid block; age re-verify on each new purchase |
| 3 | VIP Gold | `VIP_GOLD` | Yes | 90+1 day paid block; age re-verify on each new purchase |
| 4 | VIP Platinum | `VIP_PLATINUM` | Yes | 90+1 day paid block; age re-verify on each new purchase |
| 5 | VIP Diamond | `VIP_DIAMOND` | Yes | 90+1 day paid block; binds Diamond Concierge per locked rules |

### Retired tier values — must NOT appear as `MembershipTier` in schema, code, config, or new docs

| Retired token | Status | Replacement / disposition |
|---------------|--------|---------------------------|
| `DAY_PASS` | RETIRED — concept fully retired | Use `GUEST` for the no-subscription fallback |
| `ANNUAL` (as tier) | RETIRED — never a tier | May appear ONLY as a `BillingInterval` enum value or billing-cycle label; never on `MembershipTier` |
| `OMNIPASS_PLUS` | RETIRED — never a tier | OmniPass+ is a **product** (Entitlement / Pass / Product domain), not a tier — see Products below |
| Standalone `DIAMOND` | RETIRED — invalid form | Canonical form is `VIP_DIAMOND` |

Existing-code policy: any RETIRED token discovered in active source, config,
or active docs must be flagged in the agent's report-back. Historical
report-backs and `PROGRAM_CONTROL/DIRECTIVES/DONE/*` artifacts are archival
and are not rewritten.

Append-only guard: `prisma/seed.test.ts` is the canary that fails CI if any
of `DAY_PASS`, `ANNUAL`-as-tier, `OMNIPASS_PLUS`, or standalone `DIAMOND`
ever reappear in the `MembershipTier` enum.

### Products (NOT `MembershipTier` values)

These are products in the Entitlement / Pass / Product domain. They are
distinct from tiers and must never be added to the `MembershipTier` enum.

| Product | Code identifier | Notes |
|---------|-----------------|-------|
| OmniPass | OmniPass | Product — separate from tier |
| OmniPass+ | OmniPassPlus, omni_pass_plus | Product — replaces the retired `OMNIPASS_PLUS` tier usage |
| ShowZonePass | ShowZonePass | Product — venue access pass |
| SilverBullet | SILVER_BULLET (`product_variant`) | 30-day on-ramp variant of `VIP_SILVER`; carried as `product_variant`, NOT a tier value |

### Other access concepts

| Term | Definition | Code identifier |
|------|------------|-----------------|
| Guest Welcome Credit | $100 CZT credit on $250 first-month spend (inactive at launch) | WELCOME_CREDIT, welcome_credit_active |

---

## GATEGUARD SENTINEL

| Term | Definition | Code identifier |
|------|------------|-----------------|
| GateGuard Sentinel | Pre-processor payment risk, welfare intelligence, and AV platform. 10th shared Stack asset. | GateGuardSentinel, gateguard-sentinel (service dir) |
| GateGuard Sentinel AV | Age verification add-on module | GateGuardSentinelAV, gateguard-sentinel/av |
| Welfare Guardian Score | Dual fraud/welfare scoring algorithm (0-100 each) | WelfareGuardianScore, welfare_score, fraud_score |
| WGS | Welfare Guardian Score abbreviation | WGS |
| SOFT_NUDGE | WGS intervention: medium tier, non-blocking notification | SOFT_NUDGE |
| COOL_DOWN | WGS intervention: high tier, mandatory 5-min pause | COOL_DOWN |
| HARD_DECLINE_HCZ | WGS intervention: critical tier, decline + HCZ escalation | HARD_DECLINE_HCZ |
| RedBook | Escalation scenario playbook for HCZ agents | RedBook, redbook_playbook_id |
| zk_proof_hash | Zero-knowledge compliance proof hash on every GGS response | zk_proof_hash |

---

## CYRANO

| Term | Definition | Code identifier |
|------|------------|-----------------|
| Cyrano | Four-layer AI whisper architecture (CNZ subsystem at launch) | Cyrano, cyrano (service dir), CYR: (commit prefix) |
| Cyrano L1 | CNZ Creator Feature — real-time suggestion panel | CyranoCreatorFeature |
| Cyrano L2 | Consumer Audio Platform | CyranoConsumerAudio |
| Cyrano L3 | HCZ Whisper Intelligence | CyranoHCZWhisper |
| Cyrano L4 | Enterprise B2B Whisper API (deferred, Year 3+) | CyranoEnterpriseAPI |

---

## FINANCIAL AND COMPLIANCE

| Term | Definition | Code identifier |
|------|------------|-----------------|
| FIZ | Financial Integrity Zone — paths requiring FIZ: commit format | FIZ |
| DFSP | Diamond Financial Security Platform | DFSP, dfsp (service dir) |
| ASC 606 | Revenue recognition standard | ASC_606 (in comments) |
| VAMP | Visa/MC dispute rate threshold (must stay under 0.75%) | VAMP_THRESHOLD |
| ProductionOrder | Warrant response object (Bill C-22) | ProductionOrder |
| Sovereign CaC | Age gating middleware (Bill S-210) | SovereignCaC, sovereign_cac |
| Bill 149 ON | Ontario AI disclosure requirement | BILL_149_ON (in comments/config) |
| FINTRAC | Financial intelligence regulator | FINTRAC (in comments/config) |
| AGCO | Alcohol and Gaming Commission of Ontario | AGCO (in comments/config) |
| rule_applied_id | Immutable compliance fingerprint on every output object | rule_applied_id |

---

## COMMIT PREFIXES

| Prefix | Scope |
|--------|-------|
| FIZ: | Financial Integrity Zone |
| NATS: | NATS messaging fabric |
| OBS: | OBS broadcast kernel |
| HZ: | HeartZone / biometric |
| BIJOU: | Bijou Theatre architecture |
| CRM: | CRM objects / schema |
| INFRA: | Platform infrastructure |
| UI: | Frontend / Black-Glass |
| GOV: | Compliance / Sovereign CaC |
| CHORE: | Tooling, maintenance |
| GGS: | GateGuard Sentinel core |
| GGS-AV: | GateGuard Sentinel AV module |
| CYR: | Cyrano subsystem |
| SHOWZONE: | ShowZone room lifecycle |

FYI: GGS: + FIZ: dual prefix is required for GateGuard Sentinel
commits that touch ledger, payout, balance, or escrow. Both prefixes
must appear and FIZ: format (REASON/IMPACT/CORRELATION_ID) applies.

---

This glossary is the naming authority. When in doubt, check here first.
To add a term: CEO authorization required.
File a CHORE: commit with reason in the commit message.
