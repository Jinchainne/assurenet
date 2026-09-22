import { NextRequest, NextResponse } from "next/server";

const RPC = "https://rpc-bradbury.genlayer.com";

export async function POST(request: NextRequest) {
  const body = await request.text();
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return NextResponse.json({ jsonrpc: "2.0", id: "proxy", error: { code: -32700, message: "Invalid JSON" } }, { status: 400 }); }
  const response = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const text = await response.text();
  return new NextResponse(text, { status: response.status, headers: { "content-type": "application/json" } });
}
