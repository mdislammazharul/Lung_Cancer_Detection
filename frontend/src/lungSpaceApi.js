import { Client, handle_file } from "@gradio/client";

// Returns a normalized object so your UI can display it consistently.
export async function predictFromSpace(file) {
  if (!file) throw new Error("No file selected.");

  const spaceId = import.meta.env.VITE_SPACE_ID;
  const apiName = import.meta.env.VITE_GRADIO_API_NAME || "/predict";

  if (!spaceId) {
    throw new Error("VITE_SPACE_ID is missing in frontend/.env (e.g. user/space_name).");
  }

  // Connect to the Space
  const app = await Client.connect(spaceId);

  // If your Space expects one image input, this is the common pattern:
  // - Some apps use app.predict(apiName, [handle_file(file)])
  // - Some apps use app.predict(apiName, { image: handle_file(file) })
  //
  // We'll try the array form first, then fallback to object form.
  try {
    const res = await app.predict(apiName, [handle_file(file)]);
    return normalizeGradioResult(res);
  } catch (e1) {
    try {
      const res = await app.predict(apiName, { image: handle_file(file) });
      return normalizeGradioResult(res);
    } catch (e2) {
      throw new Error(
        `HF Space call failed.\n` +
          `Tried: predict("${apiName}", [file]) and predict("${apiName}", {image:file}).\n` +
          `Error 1: ${e1?.message || e1}\n` +
          `Error 2: ${e2?.message || e2}\n\n` +
          `Fix: confirm the correct api_name by running app.view_api() (see below).`
      );
    }
  }
}

function normalizeGradioResult(res) {
  // res usually looks like: { data: [...] }
  // We keep everything but also try to extract a "label" and "confidence" if present.
  const out = { ...res };

  // Try common patterns (you can adjust once you know your Space output)
  const data = res?.data;

  if (Array.isArray(data)) {
    // Example possibilities:
    // - data[0] = "lung_n"
    // - data[0] = { label: "...", confidences: [...] }
    // - data[0] = { "lung_n": 0.91, "lung_scc": 0.06, ... }
    out.primary = data[0];
  }

  return out;
}
const app = await Client.connect("mdislammazharul/Lung_Cancer_Detection_HF_Space");
console.log(await app.view_api(true));