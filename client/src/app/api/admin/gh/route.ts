import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Dashboard ↔ pipeline bridge. Two shapes:
//   POST { issueNumber, comment }  → comment on a specific lead/build issue (approve/deny/feedback)
//   POST { command }               → enqueue "CMD: <command>" on the open issue labeled ops-queue
//                                    (created on first use); the desktop listener executes it.
//   GET                            → pending commands (CMD comments with no DONE reply)
// Auth matches /admin middleware; the PAT lives in GITHUB_TOKEN (server env only).

const REPO = "FulphilledDev/redesign-pipeline";
const GH = "https://api.github.com";

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
}

async function opsIssue(token: string): Promise<number> {
  const r = await fetch(`${GH}/repos/${REPO}/issues?labels=ops-queue&state=open&per_page=1`, { headers: headers(token), cache: "no-store" });
  const list = r.ok ? await r.json() : [];
  if (list[0]?.number) return list[0].number;
  const c = await fetch(`${GH}/repos/${REPO}/issues`, {
    method: "POST", headers: headers(token),
    body: JSON.stringify({ title: "Ops queue — dashboard commands", labels: ["ops-queue"], body: "Commands from /admin/ops land here as `CMD:` comments. The desktop listener executes each and replies `DONE <comment-id>`. Do not close." }),
  });
  if (!c.ok) throw new Error(`create ops issue: ${c.status}`);
  return (await c.json()).number;
}

function guard() {
  if (!cookies().get("phitdev_admin_token")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.GITHUB_TOKEN) return NextResponse.json({ error: "GITHUB_TOKEN is not configured on the server" }, { status: 503 });
  return null;
}

export async function GET() {
  const g = guard(); if (g) return g;
  const token = process.env.GITHUB_TOKEN!;
  try {
    const issue = await opsIssue(token);
    const r = await fetch(`${GH}/repos/${REPO}/issues/${issue}/comments?per_page=100`, { headers: headers(token), cache: "no-store" });
    const comments: { id: number; body: string; created_at: string }[] = r.ok ? await r.json() : [];
    const done = new Set(comments.filter((c) => c.body.startsWith("DONE ")).map((c) => c.body.split(/\s+/)[1]));
    const pending = comments
      .filter((c) => c.body.startsWith("CMD:") && !done.has(String(c.id)))
      .map((c) => ({ id: c.id, command: c.body.slice(4).trim().split("\n")[0], at: c.created_at }));
    return NextResponse.json({ issue, pending });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const g = guard(); if (g) return g;
  const token = process.env.GITHUB_TOKEN!;
  const body = await req.json().catch(() => ({}));

  let issueNumber: number;
  let comment: string;
  if (typeof body.command === "string" && body.command.trim()) {
    if (body.command.length > 500) return NextResponse.json({ error: "command too long" }, { status: 400 });
    try { issueNumber = await opsIssue(token); } catch (e) { return NextResponse.json({ error: String(e) }, { status: 502 }); }
    comment = `CMD: ${body.command.trim()}\n\n_queued from the dashboard_`;
  } else if (Number.isInteger(body.issueNumber) && typeof body.comment === "string" && body.comment.trim() && body.comment.length <= 10000) {
    issueNumber = body.issueNumber;
    comment = body.comment;
  } else {
    return NextResponse.json({ error: "need { command } or { issueNumber, comment }" }, { status: 400 });
  }

  const res = await fetch(`${GH}/repos/${REPO}/issues/${issueNumber}/comments`, {
    method: "POST", headers: headers(token), body: JSON.stringify({ body: comment }),
  });
  if (!res.ok) return NextResponse.json({ error: `GitHub ${res.status}` }, { status: 502 });
  const data = await res.json();
  return NextResponse.json({ ok: true, url: data.html_url, issue: issueNumber });
}
