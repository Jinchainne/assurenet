# Architecture and invariants

```text
Browser wallet
  ├─ write → StudioNet → validator consensus → FINALIZED
  └─ read  ← canonical AssureNet state ← policy/evidence decision
                                             │
Public HTTPS policy/evidence ── untrusted ────┘
```

Policy and evidence pages are bounded, placed in explicit source blocks, described as untrusted, and never allowed to choose schema or instructions. Unreachable sources fail closed to `INSUFFICIENT`.

The leader's prose is not authoritative. Results satisfy exact enums, basis-point invariants, confidence bounds, reason length, and independent validator reproduction.

`gl.message.value` is the funding truth. Finalization marks the job closed and dispatch flags, updates accounting, then schedules transfers with `on="finalized"`. There is no retry path that can emit escrow twice.

The UI distinguishes signature, submission, consensus, finalization and canonical readback. A transaction is not successful until the expected state mutation is visible through a fresh contract read.
