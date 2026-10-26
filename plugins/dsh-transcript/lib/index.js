// Node half of @eloize/dsh-transcript.
//
// Deliberately trivial: the whole Step 1 pipeline runs in the browser (read via
// FileReader, redaction via a direct loopback call to Ollama, write through DSH's
// own workspace-files remote), so the raw transcript never touches this process
// and there is no node code to hot-reload. See the approach report / rollout §7.8.
export function apply() {}
