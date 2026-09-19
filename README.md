# AssureNet

Consensus-backed delivery escrow for work that cannot be verified by a deterministic `if` statement.

A client funds a job and binds it to a public acceptance policy. The worker submits public delivery evidence. GenLayer validators independently retrieve both sources, treat their contents as untrusted data, and agree on a structured release percentage. Either party gets one bounded appeal; after the challenge window the accepted percentage drives the real payout and refund.

## Why GenLayer is essential

The outcome depends on semantic interpretation of live policy and evidence. `contracts/assurenet.py` uses `gl.nondet.web.get`, `gl.nondet.exec_prompt`, and `gl.vm.run_nondet_unsafe`. Validators reproduce the review and compare verdict, release basis points, and policy digest. That result directly controls escrow settlement.

The app is not a static contract panel: its browser client creates funded jobs, submits evidence, triggers review, challenges decisions, waits for finality, checks execution failure, and requires canonical readback before reporting success.

## Product flow

1. Client creates and funds a policy-bound job.
2. Worker submits an HTTPS evidence source.
3. Validators issue `RELEASE`, `PARTIAL`, `REFUND`, or `INSUFFICIENT`.
4. Client or worker may use one 24-hour appeal.
5. Finalization closes state before emitting exactly-once worker/refund transfers.

## Local setup

```bash
npm ci
copy .env.example .env.local
npm run dev
```

## Bradbury deployment

- Contract: `0xF90cd74CE935fE54b8a7f0Db9B2051ab83d369ce`
- Deployment transaction: `0x6f1fd0ec883793713f82b3b17af47a45b538a6d91c830e3ff17babc17f73036a`
- Network: GenLayer Bradbury Testnet, chain ID `4221`

The deployment finalized with `AGREE` and `FINISHED_WITH_RETURN`. The UI never substitutes demo data if chain reads are empty.

Historical deployments `0x54a86A5bA2Fe856d5f84cC546343A9c9A335c187` and `0x7dF88F702b5DD446Ad79cba78142c2211804c641` must not be used. They were replaced before any jobs were created while payout and policy-snapshot hardening was completed.

## Verification

```bash
npm run typecheck
npm test
npm run lint
npm run build
python -m pytest -q
genvm-lint check contracts/assurenet.py
```

See [DESIGN.md](DESIGN.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Design provenance

The interface is original. Its workflow was informed by the MIT-licensed DESIGN.md format in `VoltAgent/awesome-design-md`, accessibility and responsive heuristics in `nextlevelbuilder/ui-ux-pro-max-skill`, and Theatre.js choreography principles. No third-party product UI or source code is copied.

## License

MIT
