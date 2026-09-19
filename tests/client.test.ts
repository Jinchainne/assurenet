import { describe, expect, it } from "vitest";
import { CHAIN_ID, EXPLORER, executionResult } from "../lib/genlayer";
describe("network configuration", () => {
  it("pins Bradbury and its explorer", () => {
    expect(CHAIN_ID).toBe("0x107D");
    expect(EXPLORER).toContain("explorer-bradbury.genlayer.com");
  });
});

describe("receipt verification", () => {
  it("finds success in nested Bradbury receipts", () => {
    expect(executionResult({ consensus_data: { leader_receipt: [{ execution_result: 1 }] } })).toBe("FINISHED_WITH_RETURN");
  });
  it("does not treat missing execution evidence as success", () => {
    expect(executionResult({ status_name: "FINALIZED" })).toBeUndefined();
    expect(executionResult({ txExecutionResultName: "FINISHED_WITH_ERROR" })).toBe("FINISHED_WITH_ERROR");
  });
});
