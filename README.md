# AssureNet

### Consensus-backed escrow for work that cannot be reduced to a boolean check.

AssureNet turns a delivery agreement into an on-chain, policy-bound escrow. A client locks GEN, a worker submits public evidence, and GenLayer validators independently evaluate whether that evidence satisfies the agreed policy. The resulting verdict and release percentage are stored by the contract and settle the escrow — no private backend, operator decision, or fabricated frontend state.

[Live application](https://assurenet-chi.vercel.app) · [GitHub](https://github.com/Jinchainne/assurenet) · [Bradbury contract](https://explorer-bradbury.genlayer.com/address/0x57697Ed2681372CFa745c530dfEA56d4EAbeE873)

## What makes it a GenLayer application

The hard part is semantic: “does this delivery satisfy the brief under this policy?” AssureNet uses GenLayer’s non-deterministic execution for that decision:

- `gl.nondet.web.get` retrieves bounded policy and delivery sources.
- `gl.nondet.exec_prompt` produces a structured verdict: `RELEASE`, `PARTIAL`, `REFUND`, or `INSUFFICIENT`.
- `gl.vm.run_nondet_unsafe` requires independent validator reproduction.
- Consensus binds the result to both a frozen `policy_digest` and the fetched `evidence_digest`.
- `release_bps` directly controls the worker payout and client refund.

The browser signs real transactions through an EIP-1193 wallet, waits for finalized execution, rejects failed GenVM results, and performs canonical contract readback before showing success.

## Escrow lifecycle

```text
CLIENT FUNDS
    │ policy is fetched, hashed, and snapshotted at funding
    ▼
WORKER SUBMITS EVIDENCE
    │ public HTTPS source, worker-only authorization
    ▼
VALIDATOR REVIEW
    │ policy + evidence fetched independently; consensus checks both digests
    ▼
OPTIONAL CHALLENGE
    │ client or worker, once, inside the 24-hour window
    ▼
FINALIZE
    │ state closes first; bounded payout/refund transfers execute exactly once
```

`PARTIAL` outcomes tolerate a small validator rounding difference (100 basis points) while still requiring agreement on the verdict, policy digest, and evidence digest.

## Production deployment

| Resource | Value |
| --- | --- |
| Network | GenLayer Bradbury Testnet |
| Chain ID | `4221` (`0x107D`) |
| Contract | [`0x57697Ed2681372CFa745c530dfEA56d4EAbeE873`](https://explorer-bradbury.genlayer.com/address/0x57697Ed2681372CFa745c530dfEA56d4EAbeE873) |
| Deployment transaction | [`0x08ca7963...`](https://explorer-bradbury.genlayer.com/transactions/0x08ca7963e584e3d783f53914e73588278d23047ccc3ef1d0d9c4d6396f1255ae) |
| Web app | [assurenet-chi.vercel.app](https://assurenet-chi.vercel.app) |

The app includes `/api/genlayer-rpc`, a same-origin Bradbury proxy that normalizes viem JSON-RPC request IDs for the Bradbury node. This addresses the production `eth_sendRawTransaction` incompatibility observed with the bundled client.

## Run locally

Requirements: Node.js 20+, npm, Python 3.11+, a GenLayer-compatible wallet, and Bradbury test GEN for writes.

```bash
npm ci
copy .env.example .env.local       # PowerShell / Windows
# cp .env.example .env.local       # macOS / Linux
npm run dev
```

Set `NEXT_PUBLIC_CONTRACT_ADDRESS` to the production contract above, or to a contract you deploy yourself. Never commit `.env.local` or wallet secrets.

### Wallet RPC migration

The browser registers Bradbury with `https://assurenet-chi.vercel.app/api/genlayer-rpc`. If MetaMask already has chain `4221` saved with the direct Bradbury RPC, remove that network and reconnect so it is re-added with the proxy. This matters for signed `eth_sendRawTransaction` writes; reads can succeed even when an old wallet entry still bypasses the proxy.

## Verification

```bash
npm run typecheck
npm test
npm run lint
npm run build
python -m pytest -q
genvm-lint check contracts/assurenet.py
```

The Python suite includes behavior tests for worker/client authorization, challenge timing, exactly-once finalization, and partial payout/refund conservation. The contract linter validates the GenLayer ABI and execution model.

## Security and trust boundaries

- Policy and evidence are treated as untrusted text; prompts embedded in sources are not instructions.
- Sources are HTTPS-only and bounded before entering the validator prompt.
- Policy content is pinned when funds are locked, not when review begins.
- State is marked finalized before external transfers, preventing retry-based double settlement.
- The contract never claims a successful write until finality, execution status, and canonical readback all agree.

The public testnet deployment is not production custody. Use test GEN only, verify URLs before funding, and review the contract source before relying on it.

## Repository map

```text
contracts/assurenet.py       GenLayer escrow contract
lib/genlayer.ts              wallet, RPC, finality, and canonical readback client
app/api/genlayer-rpc/        Bradbury JSON-RPC compatibility proxy
app/                         Next.js application and interaction UI
tests/                       client and contract behavior tests
docs/ARCHITECTURE.md         state and trust-boundary notes
DESIGN.md                    visual and interaction principles
```

## License

MIT
