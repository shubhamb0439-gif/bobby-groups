import sequence from "@/config/sequence.json";

export type SceneKey = keyof typeof sequence.scenes;
export type FrameSet = (typeof sequence)["desktop"];
export type DeviceKind = "desktop" | "mobile";

export const scenes = sequence.scenes as Record<SceneKey, [number, number]>;
export const sequenceColors = sequence.colors;

export function getFrameSet(kind: DeviceKind): FrameSet {
  return sequence[kind];
}

export function frameUrl(set: FrameSet, index: number): string {
  const name = sequence.pattern.replace("{index}", String(index).padStart(sequence.pad, "0"));
  return `${set.folder}/${name}?v=${sequence.version}`;
}

/** Combined [start, end] of one or more consecutive scenes. */
export function sceneSpan(keys: SceneKey[]): [number, number] {
  const ranges = keys.map((k) => scenes[k]);
  return [Math.min(...ranges.map((r) => r[0])), Math.max(...ranges.map((r) => r[1]))];
}

export const posterUrl = `/frames/poster.webp?v=${sequence.version}`;
