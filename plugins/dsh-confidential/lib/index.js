// Node half of @eloize/dsh-confidential (v2) - IMPORT-FREE BY DESIGN.
//
// This module contains NO imports at all (crash-report section 4 rule: the v1.0
// crash was one static import of a DSH package). Everything it needs comes
// through the ctx cordis passes to apply(): waterfall events and ctx.provide.
// If this module ever fails to load, the loader fails on an ordinary syntax
// error in THIS file - there is no external resolution left to break boot.
//
// What it does:
//  1. The model lock. `agent/request` is a scoped waterfall emitted per model
//     call with the agent injected into the payload (dsh-agent's fused
//     dispatcher). Host-plane listeners are admitted to every scoped event
//     (dsh-scope: untagged contexts pass the filter), and this plugin
//     registers at boot, so it is the outermost listener: it runs `next()`
//     first and rewrites the resolved config LAST. Sessions whose durable
//     header cwd is the Confidential folder are forced to Ollama/Qwen3;
//     background calls that follow the session's logged request route
//     (session titles, summaries) follow the same lock automatically.
//  2. Zero tools + slim prompt. `system-prompt/assemble` is rewritten for
//     confidential sessions as belt-and-braces on top of the
//     `eloize-confidential` agent preset (whose persona is `complete` and
//     whose composition mounts no tools).
//  3. The thinking toggle remote (`eloizeConfidential.setThinking/
//     getThinking`). Registered import-free: a plain instance provided via
//     ctx.provide carries the visible `typertRemote` binding and the
//     hand-attached prototype marker the gateway's source-mode discovery
//     reads (verified against dsh-api-gateway). Method parameter names are
//     the wire field names (dsh-api-gateway derives them from the source),
//     so they stay plain identifiers.
//
// The lock fails CLOSED: an error inside a listener propagates and fails the
// request rather than silently letting a confidential call through.

/** The descriptor key the Typert gateway reads off a service prototype. */
const REMOTE_METHOD_DESCRIPTOR = "@deepseek-ai/dsh-typert-protocol/remote-methods";

/** The dedicated Confidential folder. Sessions created in its Workspace carry this cwd in their header. */
// EDIT ME: the folder that holds confidential sessions. Must match the client half.
const CONFIDENTIAL_CWD = "C:\\path\\to\\Eloize Confidential";
/** Local provider id from settings.yaml (`llm-pi-ai.providers.ollama`). */
const LOCAL_PROVIDER = "ollama";
/**
 * The one local model id (Push 3). Qwen3 8B is a single hybrid model: there is
 * no separate no-think tag, and the no-think id the earlier build routed to
 * never existed in Ollama (UNKNOWN_MODEL). Thinking on/off is a per-request
 * parameter the pi-ai seam cannot set for hand-declared local models (no
 * reasoningEfforts map; reasoning_effort is omitted for localhost; and this
 * Ollama build does not honour the /no_think marker), so the lock keeps the
 * ONE tag and the client locks Fast off rather than shipping a control that
 * errors.
 */
const THINK_MODEL = "Qwen3-8B-Q6_K";

/**
 * The slim confidential system prompt (~50 tokens).
 *
 * Belt-and-braces on top of the preset: the `eloize-confidential` preset's
 * persona already IS the complete prompt, so this replacement normally only
 * wins if a confidential session somehow runs on another preset.
 */
const SLIM_SYSTEM_PROMPT = [
	"You are Eloize Confidential, a private local assistant running entirely on this machine.",
	"Nothing you read or write leaves this device.",
	"You have no tools. Answer in plain, concise text.",
	"Never reveal or summarise confidential material outside this conversation.",
].join(" ");

/** Per-session thinking state. Defaults to ON (Qwen3's native behaviour). */
const thinkState = new Map();

/** Fold separators and case so host paths never register twice or compare wrong. */
function normalisePath(value) {
	return String(value).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}

/** Path equality through the shared normaliser. */
function sameDirectory(left, right) {
	return normalisePath(left) === normalisePath(right);
}

/** A session is confidential iff its durable header cwd is the Confidential folder. */
function isConfidentialSession(agent) {
	const cwd = agent && agent.session && agent.session.header ? agent.session.header.cwd : undefined;
	return cwd !== undefined && sameDirectory(cwd, CONFIDENTIAL_CWD);
}

/**
 * Package-private browser RPC: read or flip the thinking toggle for one
 * session. A plain class - no cordis Service base - registered with
 * ctx.provide; the visible `typertRemote` binding and the prototype marker
 * below are exactly what the gateway's source-mode discovery consumes.
 */
class EloizeConfidentialRemote {
	constructor() {
		this.name = "eloizeConfidential";
	}

	async setThinking(sessionId, enabled) {
		if (typeof sessionId !== "string") throw new Error("eloizeConfidential.setThinking requires a string sessionId");
		if (typeof enabled !== "boolean") throw new Error("eloizeConfidential.setThinking requires a boolean enabled");
		thinkState.set(sessionId, enabled);
		return { thinkOn: enabled };
	}

	async getThinking(sessionId) {
		if (typeof sessionId !== "string") throw new Error("eloizeConfidential.getThinking requires a string sessionId");
		return { thinkOn: thinkState.get(sessionId) !== false };
	}
}

// The marker descriptor the @Remote decorators would produce for the two
// methods. Attached by hand, exactly as the decorators would produce it.
Object.defineProperty(EloizeConfidentialRemote.prototype, REMOTE_METHOD_DESCRIPTOR, {
	configurable: true,
	value: Object.freeze({
		version: 1,
		methods: Object.freeze([
			Object.freeze({ method: "setThinking", invocation: Object.freeze({ kind: "direct" }) }),
			Object.freeze({ method: "getThinking", invocation: Object.freeze({ kind: "direct" }) }),
		]),
	}),
});

export function apply(ctx) {
	// Import-free remote registration: provide the instance, then attach the
	// visible binding the gateway reads from ctx.reflect.props.
	const remote = new EloizeConfidentialRemote();
	remote.typertRemote = Object.freeze({ service: remote, serviceKey: remote.name, namespace: remote.name });
	ctx.provide("eloizeConfidential", remote);

	// Server-side model lock. `next()` runs the rest of the chain first, so
	// the rewrite below is the LAST word on provider/model regardless of
	// listener order - nothing in a confidential session can leave for the
	// cloud.
	ctx.on("agent/request", async (payload, next) => {
		const resolved = await next();
		const agent = payload && payload.agent;
		if (!isConfidentialSession(agent)) return resolved;
		// The one hybrid model tag, always (Push 3: the no-think id never
		// existed in Ollama). The inherited reasoning effort is dropped for
		// the same reason as before: hand-declared local models carry no
		// reasoning metadata, so pi-ai would refuse an explicit effort.
		const { reasoningEffort: _droppedEffort, ...rest } = resolved;
		return {
			...rest,
			provider: LOCAL_PROVIDER,
			model: THINK_MODEL,
		};
	});

	// Zero tools + slim system prompt. The assembly the waterfall returns is
	// what the loop sends: `sections` is the rendered system prompt, `tools`
	// the tool schemas, `contexts` the runtime context. All three are
	// replaced for confidential sessions, again after `next()` so nothing
	// downstream can undo it.
	ctx.on("system-prompt/assemble", async (assembly, context, next) => {
		const transformed = await next();
		const agent = context ? (context.agent ?? context.scope) : undefined;
		if (!isConfidentialSession(agent)) return transformed;
		return {
			...transformed,
			sections: [{ name: "eloize-confidential", text: SLIM_SYSTEM_PROMPT }],
			contexts: [],
			tools: [],
		};
	});
}
