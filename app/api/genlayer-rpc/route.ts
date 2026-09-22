import { NextRequest, NextResponse } from "next/server";

const RPC = "https://rpc-bradbury.genlayer.com";

export async function POST(request: NextRequest) {
  const body = await request.text();
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return NextResponse.json({ jsonrpc: "2.0", id: "proxy", error: { code: -32700, message: "Invalid JSON" } }, { status: 400 }); }
  const normalizeId = (item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return;
    const request = item as { id?: unknown };
    if (typeof request.id === "string") {
      const parsed = Number(request.id);
      request.id = Number.isSafeInteger(parsed) ? parsed : 1;
    } else if (typeof request.id !== "number") request.id = 1;
  };
  if (Array.isArray(payload)) payload.forEach(normalizeId); else normalizeId(payload);
  const response = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const text = await response.text();
  return new NextResponse(text, { status: response.status, headers: { "content-type": "application/json" } });
}
