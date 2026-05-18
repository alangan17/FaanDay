import { requestUrl } from "obsidian";

export const GITHUB_REPO = "alangan17/FaanDay";
export const RELEASE_FILES = ["manifest.json", "main.js", "styles.css"] as const;

export async function fetchLatestRelease(): Promise<{ tag_name: string }> {
  const response = await requestUrl({
    url: `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`GitHub latest release request failed (${response.status})`);
  }

  if (!response.json || !response.json.tag_name) {
    throw new Error("GitHub latest release did not include a tag name.");
  }

  return response.json;
}

export async function downloadReleaseFiles(tagName: string, expectedVersion: string): Promise<Record<string, string>> {
  const branch = `release/${tagName}`;
  const entries = await Promise.all(RELEASE_FILES.map(async (file) => {
    const response = await requestUrl({
      url: `https://api.github.com/repos/${GITHUB_REPO}/contents/${file}?ref=${encodeURIComponent(branch)}`,
      headers: {
        Accept: "application/vnd.github.raw",
      },
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Could not download ${file} from ${branch} (${response.status})`);
    }

    if (!response.text) {
      throw new Error(`Downloaded empty ${file} from ${branch}.`);
    }

    return [file, response.text] as const;
  }));

  const files = Object.fromEntries(entries);
  const manifest = JSON.parse(files["manifest.json"]);
  if (manifest.version !== expectedVersion) {
    throw new Error(`Release manifest version is ${manifest.version}, expected ${expectedVersion}.`);
  }

  return files;
}

export function versionFromTag(tagName: string): string {
  const version = String(tagName || "").replace(/^v/i, "");
  if (!/^\d+\.\d+\.\d+([+-][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Release tag ${tagName} is not a valid stable version.`);
  }
  return version;
}

export function isNewerVersion(candidate: string, current: string): boolean {
  const candidateParts = parseVersion(candidate);
  const currentParts = parseVersion(current);

  for (let index = 0; index < 3; index += 1) {
    if (candidateParts[index] > currentParts[index]) return true;
    if (candidateParts[index] < currentParts[index]) return false;
  }

  return false;
}

export function parseVersion(version: string): number[] {
  const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return [0, 0, 0];
  return match.slice(1, 4).map((part) => Number(part));
}
