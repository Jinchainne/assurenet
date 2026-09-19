import { describe, expect, it } from "vitest";
import { CHAIN_ID, EXPLORER } from "../lib/genlayer";
describe("network configuration", () => {
  it("pins StudioNet and its explorer", () => {
    expect(CHAIN_ID).toBe("0xF22F");
    expect(EXPLORER).toContain("explorer-studio.genlayer.com");
  });
});
