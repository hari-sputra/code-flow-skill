export interface SkillManifestEntry {
  readonly name: string;
  readonly files: readonly string[];
}

export interface SkillsManifest {
  readonly version: string;
  readonly generatedAt: string;
  readonly skills: readonly SkillManifestEntry[];
}

export interface ResolvedRef {
  readonly ref: string;
  readonly source: 'release' | 'tag' | 'explicit' | 'fallback';
}

export interface FetchedSkill {
  readonly name: string;
  readonly files: ReadonlyMap<string, string>;
}

export type Fetcher = (url: string) => Promise<FetchResponse>;

export interface FetchResponse {
  readonly ok: boolean;
  readonly status: number;
  text(): Promise<string>;
}
