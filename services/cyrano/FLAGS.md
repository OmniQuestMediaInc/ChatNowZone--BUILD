# Cyrano — FLAGS.md

## FLAG-001: CYRANO_IDEAL_LATENCY_MS
**Value:** 2000 ms  
**Intent:** Suggestions delivered faster than this are considered optimal.
No action taken at this threshold — it is a monitoring SLO.

## FLAG-002: CYRANO_HARD_CUTOFF_MS
**Value:** 4000 ms  
**Intent:** Suggestions exceeding 4 s are discarded silently.
`CYRANO_SUGGESTION_DROPPED` is emitted for audit and monitoring.
To adjust, update `CYRANO_LATENCY.HARD_CUTOFF_MS` in `cyrano.service.ts`.

## FLAG-003: CALLBACK_FACT_THRESHOLD
**Value:** 2 durable facts  
**Intent:** `CAT_CALLBACK` is only surfaced when the session memory
contains at least 2 facts for the (creator_id, guest_id) pair. Prevents
premature callback suggestions on first visits.

## FLAG-004: RECOVERY_SILENCE_THRESHOLD_SEC
**Value:** 60 seconds  
**Intent:** `CAT_RECOVERY` weight is boosted by +15 when
`silence_seconds >= 60`. Threshold is defined in `computeWeight()`.

## FLAG-005: SESSION_OPEN_STALE_THRESHOLD_MIN
**Value:** 5 minutes  
**Intent:** `CAT_SESSION_OPEN` weight is penalised by −20 when
`dwell_minutes >= 5`. Prevents session-open suggestions from surfacing
mid-session.

## FLAG-006: MONETIZATION_TIPPED_BOOST
**Value:** +10 weight  
**Intent:** When `guest_has_tipped` is true, `CAT_MONETIZATION` weight
is boosted by 10. A tipping guest is a warm lead — monetisation
suggestions are more likely to convert.

## FLAG-007: CALLBACK_WEIGHT_PROXIMITY_THRESHOLD
**Value:** 20 points  
**Intent:** `CAT_CALLBACK` is only preferred over the top-weighted
category when it is within 20 weight points of the maximum. Prevents
low-relevance callbacks from dominating high-heat rooms.
