import { GITHUB_USER, GITHUB_REPO } from './config.js';
import type { Fetcher, FetchedSkill, ResolvedRef, SkillsManifest } from './types.js';

export function githubConfigured(): boolean {
  return GITHUB_USER !== '__GH_USER__' && GITHUB_USER.length > 0;
}

export function apiLatestReleaseUrl(): string {
  return `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`;
}

export function apiTagsUrl(): string {
  return `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/tags`;
}

export function rawBaseUrl(ref: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${ref}`;
}

export function manifestUrl(ref: string): string {
  return `${rawBaseUrl(ref)}/skills/index.json`;
}

export function skillFileUrl(ref: string, skill: string, file: string): string {
  return `${rawBaseUrl(ref)}/skills/${skill}/${file}`;
}

export const nodeFetcher: Fetcher = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'code-flow-skill', Accept: 'application/vnd.github+json' } });
  return { ok: res.ok, status: res.status, text: () => res.text() };
};

export async function resolveRef(explicit: string | undefined, fetcher: Fetcher): Promise<ResolvedRef> {
  if (explicit) return { ref: explicit, source: 'explicit' };

  try {
    const res = await fetcher(apiLatestReleaseUrl());
    if (res.ok) {
      const body = JSON.parse(await res.text()) as { tag_name?: string };
      if (body.tag_name) return { ref: body.tag_name, source: 'release' };
    }
  } catch {
    // fall through to tags
  }

  try {
    const res = await fetcher(apiTagsUrl());
    if (res.ok) {
      const tags = JSON.parse(await res.text()) as Array<{ name?: string }>;
      const first = tags.find((t) => typeof t.name === 'string');
      if (first?.name) return { ref: first.name, source: 'tag' };
    }
  } catch {
    // fall through to default branch
  }

  return { ref: 'main', source: 'fallback' };
}

export async function fetchManifest(ref: string, fetcher: Fetcher): Promise<SkillsManifest> {
  const res = await fetcher(manifestUrl(ref));
  if (!res.ok) {
    throw new Error(`Could not fetch skills manifest at ref "${ref}" (HTTP ${res.status}). URL: ${manifestUrl(ref)}`);
  }
  const parsed = JSON.parse(await res.text()) as SkillsManifest;
  if (!Array.isArray(parsed.skills)) {
    throw new Error('Manifest is malformed: missing "skills" array.');
  }
  return parsed;
}

export async function fetchSkill(ref: string, entry: SkillsManifest['skills'][number], fetcher: Fetcher): Promise<FetchedSkill> {
  const files = new Map<string, string>();
  for (const file of entry.files) {
    const url = skillFileUrl(ref, entry.name, file);
    const res = await fetcher(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${entry.name}/${file} (HTTP ${res.status}).`);
    }
    files.set(file, await res.text());
  }
  return { name: entry.name, files };
}

export async function fetchAllSkills(ref: string, manifest: SkillsManifest, fetcher: Fetcher): Promise<FetchedSkill[]> {
  const skills: FetchedSkill[] = [];
  for (const entry of manifest.skills) {
    skills.push(await fetchSkill(ref, entry, fetcher));
  }
  return skills;
}
