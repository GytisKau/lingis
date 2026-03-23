import * as ort from "onnxruntime-web";

// Point ONNX Runtime to the wasm files served by Vite from /public/ort/
// Put the ort wasm assets there, for example:
// public/ort/ort-wasm-simd-threaded.wasm
// public/ort/ort-wasm-simd-threaded.mjs
// ort.env.wasm.wasmPaths = "/lingis/dist/";
// ort.env.wasm.numThreads = 1; // disables multithreading, often simpler in Vite/browser setups
// ort.env.wasm.proxy = false;
// ort.env.logLevel = "warning";

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

const LABELS: Record<number, string> = {
  1: "~10 min",
  2: "~20 min",
  3: "~0.5 h",
  4: "~1 h",
  5: "~1.5 h",
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
): Promise<{ code: number; label?: string }> {
  const session = await getSession(type);

  const featureArray = featuresToArray(features);
  const inputTensor = new ort.Tensor(
    "float32",
    Float32Array.from(featureArray),
    [1, featureArray.length]
  );

  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  const results = await session.run({ [inputName]: inputTensor });
  const output = results[outputName].data;
  const code = Number(output[0]);

  return { code, label: LABELS[code] };
}