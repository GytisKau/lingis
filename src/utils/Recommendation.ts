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
    theorySessionPromise ??= ort.InferenceSession.create("/lingis/models/knn_pipeline_theory.onnx");
    return theorySessionPromise;
  }
  practiceSessionPromise ??= ort.InferenceSession.create("/lingis/models/knn_pipeline_practice.onnx");
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


  // const results = await session.run({[inputName]: inputTensor});
  const results = await session.run(feeds, ["output_label"]);
  console.log(results)
  const output = results[outputName].data;
  const code = Number(output[0]);

  return { code, label: LABELS[code] };
}