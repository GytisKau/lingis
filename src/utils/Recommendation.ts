import * as ort from "onnxruntime-web";

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/';

export function computeSleepQuality(
  sleepHours: number,
  avgSleep: number
): number {
  const diff = sleepHours - avgSleep;

  if (diff < -0.5) return -1;
  if (diff <= 0.5) return 0;
  return 1;
}

export interface FeaturesInput {
  motivation: number;
  mentalTiredness: number;
  physicalTiredness: number;
  mentalEnergy: number;
  emotional: number;
  physical: number;
  sleepHours: number;
  avgSleep: number;
  avgTheory_code: number;
  avgPractice_code: number;
  avgPassive_code: number;
  avgActive_code: number;
  effectiveness: number;
}

export function featuresToArray(input: FeaturesInput): number[] {
  const sleep_quality = computeSleepQuality(input.sleepHours, input.avgSleep);

  return [
    input.motivation,
    input.mentalTiredness,
    input.physicalTiredness,
    input.mentalEnergy,
    input.emotional,
    input.physical,
    sleep_quality,
    input.avgTheory_code,
    input.avgPractice_code,
    input.avgPassive_code,
    input.avgActive_code,
    input.effectiveness,
  ];
}

type RecommendationType = "theory" | "practice";

const LABELS: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 60,
  5: 90,
};

let theorySessionPromise: Promise<ort.InferenceSession> | null = null;
let practiceSessionPromise: Promise<ort.InferenceSession> | null = null;

function getSession(type: RecommendationType) {
  if (type === "theory") {
    theorySessionPromise ??= ort.InferenceSession.create("/models/knn_pipeline_theory.onnx");
    return theorySessionPromise;
  }
  practiceSessionPromise ??= ort.InferenceSession.create("/models/knn_pipeline_practice.onnx");
  return practiceSessionPromise;
}

export async function Recommendation(
  features: FeaturesInput,
  type: RecommendationType
): Promise<{ code: number; minutes?: number }> {
  const session = await getSession(type);

  const feeds: Record<string, ort.Tensor> = {
    motivation: new ort.Tensor("float32", Float32Array.from([features.motivation]), [1, 1]),
    mentalTiredness: new ort.Tensor("float32", Float32Array.from([features.mentalTiredness]), [1, 1]),
    physicalTiredness: new ort.Tensor("float32", Float32Array.from([features.physicalTiredness]), [1, 1]),
    mentalEnergy: new ort.Tensor("float32", Float32Array.from([features.mentalEnergy]), [1, 1]),
    emotional: new ort.Tensor("float32", Float32Array.from([features.emotional]), [1, 1]),
    physical: new ort.Tensor("float32", Float32Array.from([features.physical]), [1, 1]),
    sleep_quality: new ort.Tensor("float32", Float32Array.from([
      computeSleepQuality(features.sleepHours, features.avgSleep)
    ]), [1, 1]),
    avgTheory_code: new ort.Tensor("float32", Float32Array.from([features.avgTheory_code]), [1, 1]),
    avgPractice_code: new ort.Tensor("float32", Float32Array.from([features.avgPractice_code]), [1, 1]),
    avgPassive_code: new ort.Tensor("float32", Float32Array.from([features.avgPassive_code]), [1, 1]),
    avgActive_code: new ort.Tensor("float32", Float32Array.from([features.avgActive_code]), [1, 1]),
    effectiveness: new ort.Tensor("float32", Float32Array.from([features.effectiveness]), [1, 1]),
  };

  const results = await session.run(feeds, ["output_label"]);
  const output = results[session.outputNames[0]].data;
  const code = Number(output[0]);

  return { code, minutes: LABELS[code] };
}