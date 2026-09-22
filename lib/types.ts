export type JobStatus = "OPEN" | "SUBMITTED" | "REVIEWED" | "CHALLENGED" | "FINALIZED";
export type Verdict = "RELEASE" | "PARTIAL" | "REFUND" | "INSUFFICIENT";
export interface Job {
  id: number; client: string; worker: string; title: string; brief: string;
  policy_url: string; evidence_url: string; amount: string; status: JobStatus;
  policy_digest: string; evidence_digest: string; policy_excerpt: string; policy_snapshot?: string; verdict: Verdict | "";
  release_bps: number; confidence: number; reason: string; challenge_reason: string; reviewed_at: number;
}
export interface ContractSummary { jobs: number; open: number; reviewed: number; finalized: number; }
