"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { connectWallet, EXPLORER, getJob, getJobs, getSummary, policyBoundToExecution, writeAndVerify, type TxPhase } from "@/lib/genlayer";
import type { ContractSummary, Job } from "@/lib/types";

const phaseLabel: Record<TxPhase, string> = {
  SIGN: "Confirm in wallet", SUBMITTED: "Transaction submitted", CONSENSUS: "Validators reaching consensus",
  FINALIZED: "Finalized on StudioNet", READBACK: "Verifying canonical state", SUCCESS: "Canonical state verified", ERROR: "Transaction failed"
};

export default function Home() {
  const [account, setAccount] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<ContractSummary>({ jobs: 0, open: 0, reviewed: 0, finalized: 0 });
  const [phase, setPhase] = useState<TxPhase | null>(null);
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Job | null>(null);

  const refresh = useCallback(async () => {
    try { const [nextJobs, nextSummary] = await Promise.all([getJobs(), getSummary()]); setJobs(nextJobs); setSummary(nextSummary); if (selected) setSelected(nextJobs.find(j => j.id === selected.id) || null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not read contract"); }
  }, [selected]);

  useEffect(() => {
    // Initial chain synchronization is intentionally effect-driven.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function progress(next: TxPhase, nextHash?: string) { setPhase(next); if (nextHash) setHash(nextHash); }
  async function run(action: () => Promise<unknown>) { setError(""); try { await action(); await refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Transaction failed"); } }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!account) return setError("Connect your wallet first");
    const data = new FormData(event.currentTarget); const before = summary.jobs;
    await run(() => writeAndVerify(account, "create_job", [data.get("worker"), data.get("title"), data.get("brief"), data.get("policy")], getSummary, state => state.jobs === before + 1, progress, BigInt(data.get("amount") as string) * 10n ** 18n));
    event.currentTarget.reset();
  }

  async function mutate(job: Job, fn: string, args: unknown[], expected: (next: Job) => boolean) {
    if (!account) return setError("Connect your wallet first");
    await run(() => writeAndVerify(account, fn, args, () => getJob(job.id), expected, progress));
  }

  return <main>
    <nav><a className="brand" href="#top"><span className="mark">A</span> ASSURENET</a><div className="navlinks"><a href="#market">Jobs</a><a href="#how">Protocol</a></div><button className="wallet" onClick={async () => { try { setAccount(await connectWallet()); } catch (cause) { setError(cause instanceof Error ? cause.message : "Wallet failed"); } }}>{account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "Connect wallet"}</button></nav>

    <section className="hero" id="top"><div><p className="eyebrow">POLICY-BOUND WORK ESCROW · GENLAYER</p><h1>Work with proof.<br/><em>Pay with confidence.</em></h1><p className="lede">AssureNet reads the rules, inspects public delivery evidence, and releases escrow only after independent validators agree.</p><div className="hero-actions"><a className="primary" href="#create">Open a job</a><a className="secondary" href="#market">Explore jobs →</a></div></div><div className="proof-card"><div className="scan"><span>CONSENSUS REVIEW</span><b>Policy ↔ Delivery</b><i>Validators compare independently</i></div><div className="decision"><span>DECISION SURFACE</span><div><b>release</b><strong>0—100%</strong></div><div><b>appeal</b><strong>24h</strong></div><div><b>settlement</b><strong>exactly once</strong></div></div></div></section>

    <section className="metrics"><div><strong>{summary.jobs}</strong><span>JOBS CREATED</span></div><div><strong>{summary.open}</strong><span>IN DELIVERY</span></div><div><strong>{summary.reviewed}</strong><span>IN REVIEW WINDOW</span></div><div><strong>{summary.finalized}</strong><span>SETTLED</span></div></section>

    <section className="content" id="market"><div className="section-head"><div><p className="eyebrow">CANONICAL CONTRACT STATE</p><h2>Live work ledger</h2></div><button className="text-button" onClick={() => void refresh()}>Refresh ↻</button></div>
      {jobs.length === 0 ? <div className="empty"><span>◇</span><h3>No on-chain jobs yet</h3><p>Create the first funded agreement. Demo data is never fabricated.</p></div> : <div className="job-grid">{jobs.map(job => <button key={job.id} className="job" onClick={() => setSelected(job)}><div><span className={`status ${job.status.toLowerCase()}`}>{job.status}</span><small>JOB {String(job.id).padStart(3, "0")}</small></div><h3>{job.title}</h3><p>{job.brief}</p><footer><span>{Number(BigInt(job.amount || "0")) / 1e18} GEN</span><b>{job.verdict || "Awaiting delivery"} →</b></footer></button>)}</div>}
    </section>

    <section className="create" id="create"><div><p className="eyebrow">NEW AGREEMENT</p><h2>Lock the terms before<br/>the work begins.</h2><p>The policy lives at a public HTTPS URL. Validators retrieve and hash it during review, so the decision remains tied to the evidence they saw.</p></div><form onSubmit={createJob}><label>Worker address<input name="worker" required pattern="0x[0-9a-fA-F]{40}" placeholder="0x…"/></label><div className="split"><label>Job title<input name="title" required minLength={3} maxLength={100} placeholder="Audit the release candidate"/></label><label>Escrow (GEN)<input name="amount" type="number" min="1" step="1" required placeholder="10"/></label></div><label>Acceptance brief<textarea name="brief" required minLength={20} maxLength={2400} placeholder="Describe the deliverable and objective pass conditions…"/></label><label>Policy URL<input name="policy" type="url" required placeholder="https://example.com/acceptance-policy"/></label><button className="primary" type="submit">Fund and publish job →</button></form></section>

    <section className="how" id="how"><p className="eyebrow">WHY INTELLIGENT CONTRACTS</p><h2>One decision. Four hard guarantees.</h2><div className="steps"><article><b>01</b><h3>Rules are frozen</h3><p>Policy content is retrieved, bounded and hashed into the decision record.</p></article><article><b>02</b><h3>Evidence is hostile</h3><p>Source pages are data, never instructions. Embedded prompt injection is ignored.</p></article><article><b>03</b><h3>Validators reproduce</h3><p>Independent validators rerun the review and compare structured decision fields.</p></article><article><b>04</b><h3>Money follows state</h3><p>The accepted percentage controls the actual finalized worker payout and refund.</p></article></div></section>

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><article className="modal" role="dialog" aria-modal="true" aria-labelledby="job-dialog-title" onClick={e => e.stopPropagation()}><button className="close" aria-label="Close job details" onClick={() => setSelected(null)}>×</button><p className="eyebrow">JOB {selected.id} · {selected.status}</p><h2 id="job-dialog-title">{selected.title}</h2><p>{selected.brief}</p><dl><div><dt>Escrow</dt><dd>{Number(BigInt(selected.amount || "0")) / 1e18} GEN</dd></div><div><dt>Verdict</dt><dd>{selected.verdict || "Pending"}</dd></div><div><dt>Worker release</dt><dd>{selected.release_bps / 100}%</dd></div><div><dt>Confidence</dt><dd>{selected.confidence}%</dd></div></dl>{selected.reason && <blockquote>{selected.reason}</blockquote>}
      {selected.status === "OPEN" && <form onSubmit={e => { e.preventDefault(); const url = new FormData(e.currentTarget).get("evidence"); void mutate(selected, "submit_delivery", [selected.id, url], j => j.status === "SUBMITTED"); }}><input name="evidence" type="url" required placeholder="https://… delivery evidence"/><button className="primary">Submit delivery</button></form>}
      {selected.status === "SUBMITTED" && <button className="primary full" onClick={() => void mutate(selected, "review_delivery", [selected.id], j => j.status === "REVIEWED" && policyBoundToExecution(j))}>Run consensus review</button>}
      {selected.status === "REVIEWED" && <><form onSubmit={e => { e.preventDefault(); const reason = new FormData(e.currentTarget).get("reason"); void mutate(selected, "challenge", [selected.id, reason], j => j.status === "CHALLENGED" && policyBoundToExecution(j)); }}><textarea name="reason" minLength={20} required placeholder="Appeal with a concrete discrepancy…"/><button className="secondary">Challenge once</button></form><button className="primary full" onClick={() => void mutate(selected, "finalize", [selected.id], j => j.status === "FINALIZED" && policyBoundToExecution(j))}>Finalize after 24h</button></>}
      {selected.status === "CHALLENGED" && <button className="primary full" onClick={() => void mutate(selected, "finalize", [selected.id], j => j.status === "FINALIZED" && policyBoundToExecution(j))}>Finalize appeal after 24h</button>}
    </article></div>}

    {(phase || error) && <aside role="status" aria-live="polite" className={`tx ${phase === "ERROR" || error ? "bad" : ""}`}><b>{error || (phase && phaseLabel[phase])}</b>{hash && <a href={`${EXPLORER}/transactions/${hash}`} target="_blank" rel="noreferrer">View transaction ↗</a>}<button aria-label="Dismiss transaction status" onClick={() => { setPhase(null); setError(""); }}>×</button></aside>}
    <footer className="site-footer"><span>ASSURENET / BRADBURY TESTNET 4221</span><span>Contract is the source of truth.</span></footer>
  </main>;
}
