import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Posts Philip's feedback / approve / deny onto a redesign-pipeline GitHub issue.
// The agent is the executor: it reads these comments on its next run and acts.
// Auth posture matches /admin middleware (cookie presence); the PAT lives in
// GITHUB_TOKEN (server env only — never NEXT_PUBLIC_*).

const REPO = "FulphilledDev/redesign-pipeline";

export async function POST(req: NextRequest) {
  if (!cookies().get("phitdev_admin_token")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN is not configured on the server" }, { status: 503 });
  }

  const { issueNumber, comment } = await req.json().catch(() => ({}));
  if (!Number.isInteger(issueNumber) || typeof comment !== "string" || !comment.trim() || comment.length > 10000) {
    return NextResponse.json({ error: "issueNumber (int) and comment (non-empty string) required" }, { status: 400 });
  }

  const res = await fetch(`https://api.github.com/repos/${REPO}/issues/${issueNumber}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ body: comment }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `GitHub ${res.status}`, detail: detail.slice(0, 300) }, { status: 502 });
  }
  const data = await res.json();
  return NextResponse.json({ ok: true, url: data.html_url });
}
