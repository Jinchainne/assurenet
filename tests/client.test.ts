import { describe, expect, it } from "vitest";
import { CHAIN_ID, EXPLORER } from "../lib/genlayer";
describe("network configuration", () => {
  it("pins Bradbury and its explorer", () => {
    expect(CHAIN_ID).toBe("0x107D");
    expect(EXPLORER).toContain("explorer-bradbury.genlayer.com");
  });
});
