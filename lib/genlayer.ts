"use client";

import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import type { Job, ContractSummary } from "./types";

export const CHAIN_ID = "0x107D";
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as `0x${string}`;
export const EXPLORER = "https://explorer-bradbury.genlayer.com";
type Provider = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };
export type TxPhase = "SIGN" | "SUBMITTED" | "CONSENSUS" | "FINALIZED" | "READBACK" | "SUCCESS" | "ERROR";

function provider(): Provider {
  const value = (window as typeof window & { ethereum?: Provider }).ethereum;
  if (!value) throw new Error("An EIP-1193 wallet is required");
  return value;
}

export async function connectWallet(): Promise<string> {
  const wallet = provider();
  const accounts = await wallet.request({ method: "eth_requestAccounts" }) as string[];
  try { await wallet.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_ID }] }); }
  catch (error: unknown) {
    if ((error as { code?: number }).code !== 4902) throw error;
    await wallet.request({ method: "wallet_addEthereumChain", params: [{ chainId: CHAIN_ID, chainName: "GenLayer Bradbury Testnet", nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 }, rpcUrls: ["https://rpc-bradbury.genlayer.com"], blockExplorerUrls: [EXPLORER] }] });
  }
  if (!accounts[0]) throw new Error("Wallet returned no account");
  return accounts[0];
}

function requireAddress() {
  if (!/^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS) || /^0x0{40}$/.test(CONTRACT_ADDRESS)) throw new Error("Set NEXT_PUBLIC_CONTRACT_ADDRESS");
  return CONTRACT_ADDRESS;
}

const readClient = createClient({ chain: testnetBradbury });
async function read<T>(functionName: string, args: unknown[] = []): Promise<T> {
  return readClient.readContract({ address: requireAddress(), functionName, args: args as never[] }) as Promise<T>;
}
export const getJob = (id: number) => read<Job>("get_job", [id]);
export const getJobs = () => read<Job[]>("list_jobs");
export const getSummary = () => read<ContractSummary>("get_summary");

// A semantic verdict is executable only when it is bound to the fetched policy.
export function policyBoundToExecution(job: Job): boolean {
  return /^[0-9a-f]{64}$/.test(job.policy_digest) &&
    ["RELEASE", "PARTIAL", "REFUND", "INSUFFICIENT"].includes(job.verdict) &&
    job.release_bps >= 0 && job.release_bps <= 10000;
}

export function executionResult(receipt: unknown): string | undefined {
  const seen = new Set<unknown>();
  const visit = (value: unknown): string | undefined => {
    if (value === null || value === undefined || seen.has(value)) return undefined;
    if (typeof value === "string") {
      const normalized = value.toUpperCase();
      if (normalized === "FINISHED_WITH_RETURN" || normalized === "FINISHED_WITH_ERROR") return normalized;
    }
    if (typeof value === "number") return value === 1 ? "FINISHED_WITH_RETURN" : value === 2 ? "FINISHED_WITH_ERROR" : undefined;
    if (Array.isArray(value)) { seen.add(value); for (const item of value) { const found = visit(item); if (found) return found; } }
    if (typeof value === "object") {
      seen.add(value);
      const record = value as Record<string, unknown>;
      for (const key of ["txExecutionResultName", "tx_execution_result_name", "executionResult", "execution_result", "txExecutionResult", "tx_execution_result"]) {
        const found = visit(record[key]); if (found) return found;
      }
      for (const key of ["consensus_data", "consensusData", "leader_receipt", "leaderReceipt", "receipt", "receipts", "data"]) {
        const found = visit(record[key]); if (found) return found;
      }
    }
    return undefined;
  };
  return visit(receipt);
}

async function canonicalWait<T>(readback: () => Promise<T>, matches: (value: T) => boolean) {
  for (let attempt = 0; attempt < 45; attempt++) {
    try { const value = await readback(); if (matches(value)) return value; } catch { /* eventual RPC consistency */ }
    await new Promise(resolve => setTimeout(resolve, Math.min(1000 + attempt * 250, 4000)));
  }
  throw new Error("Finalized transaction was not reflected in canonical state");
}

export async function writeAndVerify<T>(account: string, functionName: string, args: unknown[], readback: () => Promise<T>, matches: (value: T) => boolean, setPhase: (phase: TxPhase, hash?: string) => void, value = 0n) {
  try {
    const wallet = provider();
    const client = createClient({ chain: testnetBradbury, account: account as `0x${string}`, provider: wallet });
    setPhase("SIGN");
    const hash = await client.writeContract({ address: requireAddress(), functionName, args: args as never[], value });
    setPhase("SUBMITTED", hash); setPhase("CONSENSUS", hash);
    const receipt = await client.waitForTransactionReceipt({ hash, status: "FINALIZED", retries: 220, interval: 4000 } as never);
    const execution = executionResult(receipt);
    if (execution !== "FINISHED_WITH_RETURN") throw new Error(`GenVM execution was not successful: ${execution || "UNKNOWN"}`);
    setPhase("FINALIZED", hash); setPhase("READBACK", hash);
    const state = await canonicalWait(readback, matches);
    setPhase("SUCCESS", hash); return { hash, state };
  } catch (error) { setPhase("ERROR"); throw error; }
}
