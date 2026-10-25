#!/usr/bin/env node
/**
 * Push non-empty keys from .env + .env.local to Vercel (production, preview, development).
 * Requires VERCEL_TOKEN and VERCEL_PROJECT_ID (or VERCEL_PROJECT_NAME) in .env.local
 * Does not upload VERCEL_TOKEN itself.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_KEYS = new Set(["VERCEL_TOKEN", "VERCEL_ORG_ID"]);

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function mergeEnv() {
  return {
    ...parseEnvFile(resolve(root, ".env")),
    ...parseEnvFile(resolve(root, ".env.local")),
  };
}

async function vercelRequest(token, teamId, method, path, body) {
  const q = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const res = await fetch(`https://api.vercel.com${path}${q}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function listProjectEnv(token, projectId, teamId) {
  const { ok, data } = await vercelRequest(
    token,
    teamId,
    "GET",
    `/v9/projects/${projectId}/env`
  );
  if (!ok) throw new Error(`List env failed: ${JSON.stringify(data)}`);
  return data.envs ?? [];
}

async function createEnv(token, projectId, teamId, key, value) {
  return vercelRequest(token, teamId, "POST", `/v10/projects/${projectId}/env`, {
    key,
    value,
    type: "encrypted",
    target: ["production", "preview", "development"],
  });
}

async function removeEnv(token, envId, teamId) {
  return vercelRequest(token, teamId, "DELETE", `/v9/projects/env/${envId}`);
}

async function upsertEnv(token, projectId, teamId, key, value, existing) {
  const matches = existing.filter((e) => e.key === key);
  for (const e of matches) {
    await removeEnv(token, e.id, teamId);
  }
  return createEnv(token, projectId, teamId, key, value);
}

async function main() {
  const merged = mergeEnv();
  const token = merged.VERCEL_TOKEN;
  const projectId = merged.VERCEL_PROJECT_ID || merged.VERCEL_PROJECT_NAME;
  const teamId = merged.VERCEL_TEAM_ID || "";

  if (!token) {
    console.error("Missing VERCEL_TOKEN in .env.local — create at vercel.com/account/tokens");
    process.exit(1);
  }
  if (!projectId) {
    console.error("Missing VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME in .env.local");
    process.exit(1);
  }

  const existing = await listProjectEnv(token, projectId, teamId || undefined);
  const toPush = Object.entries(merged).filter(
    ([key, value]) => !SKIP_KEYS.has(key) && value !== "" && value !== undefined
  );

  if (toPush.length === 0) {
    console.log("No non-empty variables to push. Fill .env / .env.local first.");
    process.exit(0);
  }

  console.log(`Pushing ${toPush.length} variable(s) to Vercel project ${projectId}…`);

  for (const [key, value] of toPush) {
    const { ok, status, data } = await upsertEnv(
      token,
      projectId,
      teamId || undefined,
      key,
      value,
      existing
    );
    if (ok) {
      console.log(`  ✓ ${key}`);
    } else {
      console.error(`  ✗ ${key} (${status}):`, data.error?.message ?? JSON.stringify(data));
    }
  }

  console.log("\nDone. Redeploy on Vercel for build-time vars (NEXT_PUBLIC_*) to apply.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
