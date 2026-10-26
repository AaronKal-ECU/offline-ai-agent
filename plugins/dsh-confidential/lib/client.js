window.__ModuleLoader__.load({
	id: "@eloize/dsh-confidential",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		//#region copy and constants
		/**
		 * Generation stamp for every marker and style tag this plugin owns.
		 * Bump whenever injected markup or the stylesheet changes shape.
		 *
		 * 3 = Push 2: the stuck Thinking switch is replaced by the .eloize-btn
		 * Thinking/Fast toggle (purple "Thinking" + brain / white "Fast" + zap),
		 * persisted in localStorage (default Thinking) and pushed onto each
		 * confidential session; the upload button becomes a .eloize-btn pill whose
		 * busy state is owned by the transcript plugin (.eloize-upload-control);
		 * the transcript entry is now called WITHOUT this bundle's services (the
		 * Push 2 inject-trap fix).
		 * 4 = Push 3: Fast is LOCKED off (the -nothink model never existed in
		 * Ollama and the pi-ai seam cannot turn thinking off per request for
		 * local models - the button is aria-disabled "Thinking" with the title
		 * "Thinking is on"); session titles become plain dates (D MMM HH:mm)
		 * with an idempotent rename pass for the old "Confidential \u00b7 <date>"
		 * titles; New chat in the mode runs the enter flow; the sidebar gains
		 * the collapsed "Cloud chats" group + the "Leave offline mode?" dialog
		 * in the mode and keeps the confidential folder visible (collapsed) in
		 * normal mode; the sidebar whitening and the white wordmark rules ship.
		 * 5 = Push 3.1: the enter flow renames through the SESSION BINDING
		 * (session.rename) so the sidebar list projection receives the title
		 * (the raw remote rename ran before the session was opened, so the
		 * sidebar row kept "New Session" while the tab showed the date); the
		 * composer pill is revoked (upload lives in the sidebar only); the top
		 * slots get the full-width Upload transcript button + the purple New
		 * chat button and nothing stays under Audits; the Confidential header
		 * becomes a red pill (#DC2626, white lock/text); the Cloud chats
		 * heading and every cloud folder/session row go BLACK text while
		 * confidential rows stay white; the cloud groups hide per CONTAINER
		 * (each group renders in its own container, which is why "Demo DSH for
		 * Monday" escaped the old sibling walk); and the Confidential folder is
		 * HIDDEN in normal mode - sidebar, search results, the @ session
		 * picker and the Choose-project picker (the toggle is the only way in).
		 * 6 = Push 3.2: the normal-mode sidebar hides the Confidential workspace
		 * GROUP (folder + chats) as one unit instead of filtering session rows one
		 * by one (the old previousSibling scope walk failed closed on the real DOM
		 * and hid every chat); the shell surfaces are hidden with their original
		 * inline display remembered so the fallback buttons keep their flex layout
		 * on exit.
		 * 7 = Offline-mode fix pass: the leave dialog is wired to the group
		 * section (the sibling walk never found the project row); the Thinking
		 * pill is a clickable VISUAL-ONLY Thinking/Fast toggle (never calls
		 * setThinking, always starts Thinking); the two "Confidential" dropdowns
		 * hide in mode; the Confidential header and Cloud chats heading go bold
		 * WHITE with no red anywhere; the fresh chat row is relabeled to the date
		 * immediately; and the toggle ink spread animates.
		 * 8 = Home screens pass: the "Audits" section header row hides in the mode
		 * (anchored on the row's structure, never the label text); the sidebar
		 * logo click routes to the current mode's home (never switches the mode,
		 * reusing an open blank confidential session); and the chip row
		 * left-aligns with the normal home's project chip.
		 */
		const GENERATION = "8";

		/** The dedicated Confidential folder. Same pattern as the shell plugin's CHATS_CWD. */
		// EDIT ME: must match CONFIDENTIAL_CWD in lib/index.js.
		const CONFIDENTIAL_CWD = "C:\\path\\to\\Eloize Confidential";
		/** Sidebar title of the Confidential Workspace (the in-mode header). */
		const WORKSPACE_TITLE = "Confidential";
		/** The host's auto-derived title is the folder basename; both are accepted when matching. */
		const CONFIDENTIAL_TITLES = ["Confidential", "Eloize Confidential"];
		/** Footer row title (v2 layout: "Confidential mode \u00b7 Off \u00b7 cloud + local models"). */
		const ROW_TITLE = "Confidential mode";
		/** Toggle row copy per v2. */
		const CONFIDENTIAL_SUB_ON = "On \u00b7 local model only";
		const CONFIDENTIAL_SUB_OFF = "Off \u00b7 cloud + local models";

		/** Badge shown in the composer header, replacing the hidden model picker. */
		const BADGE_LABEL = "Confidential \u00b7 Local model";
		const THINK_LABEL = "Thinking";
		const FAST_LABEL = "Fast";
		const UPLOAD_LABEL = "Upload transcript";
		/** Copy for the sidebar's in-mode new-chat control. */
		const NEW_CHAT_LABEL = "New chat";
		/** The Cloud chats group heading (mode only). */
		const CLOUD_CHATS_LABEL = "Cloud chats";
		/** Leave-dialog copy (plan section6.1). */
		const LEAVE_DIALOG_TITLE = "Leave offline mode?";
		const LEAVE_DIALOG_BODY = "Your next messages go to the cloud model.";
		const LEAVE_DIALOG_STAY = "Stay offline";
		const LEAVE_DIALOG_LEAVE = "Leave";

		/**
		 * The old pinned-title format from Push 1/2: "Confidential \u00b7 29 Sep 10:42".
		 * The idempotent rename pass (Push 3) renames exactly these to the bare
		 * date, logging the ids; anything else is left alone.
		 */
		const LEGACY_TITLE_PATTERN = /^Confidential \u00b7 (\d{1,2} [A-Z][a-z]{2} \d{2}:\d{2})$/;

		/** The agent preset confidential sessions are composed from (authored at .dsh\\.agent-presets). */
		const SLIM_PRESET_ID = "eloize-confidential";

		/** Attribute marking the whole confidential mode on <body>. */
		const MODE_ATTR = "data-eloize-confidential-mode";
		/**
		 * Presence marker set on <body> while THIS live plugin is loaded. The
		 * shell plugin's CSS hides its inert placeholder row under it - the
		 * stable one-toggle-row contract (no generation numbers involved).
		 * Switching this plugin off removes the attribute and brings the
		 * placeholder back.
		 */
		const LIVE_ATTR = "data-eloize-confidential-live";
		/** Marker for our live sidebar row (also the class the shell's toggle CSS styles). */
		const LIVE_CLASS = "eloize-confidential-live";
		/** Marker for everything this plugin injects, generation-stamped. */
		const BADGE_ATTR = "data-eloize-confidential-badge-" + GENERATION;
		const HIDE_ATTR = "data-eloize-confidential-hide-" + GENERATION;
		/** Remembers a node's original inline display so the OFF pass can restore it (Push 3.2). */
		const DISPLAY_ATTR = HIDE_ATTR + "-display";
		const CONF_ROW_ATTR = "data-eloize-confidential-crow-" + GENERATION;
		const LOCK_ATTR = "data-eloize-confidential-lock-" + GENERATION;
		const TOAST_ATTR = "data-eloize-confidential-toast-" + GENERATION;
		/** Push 7: the toggle ink-spread overlay marker. */
		const INK_ATTR = "data-eloize-confidential-ink-" + GENERATION;

		/** Push 3.1: the sidebar's top-slot controls (Upload transcript + New chat). */
		const TOP_UPLOAD_ATTR = "data-eloize-confidential-topupload-" + GENERATION;
		const TOP_NEWCHAT_ATTR = "data-eloize-confidential-topnewchat-" + GENERATION;
		/** Push 3.1: rows hidden while the mode is OFF (the Confidential folder + its chats everywhere). */
		const OFF_HIDE_ATTR = "data-eloize-confidential-offhide-" + GENERATION;
		/** Push 3.1: every non-Confidential sidebar row, so CSS can paint them black in the mode. */
		const CLOUD_ROW_ATTR = "data-eloize-confidential-cloudrow-" + GENERATION;

		/** Push 7: the Confidential header + Cloud chats heading are bold WHITE (no pill, no red). */
		const HEADING_TEXT = "#ffffff";
		/** Push 3.1: cloud folder/session ROWS stay black text in the mode (headings are white). */
		const CLOUD_TEXT = "#000000";

		/** Unique input ids (the shell's placeholder row uses its own id; ours must not collide). */
		const LIVE_INPUT_ID = "eloize-confidential-live-toggle";

		/** The host's own new-session control, hidden while the mode is on. */
		const HOST_NEW_SESSION_LABEL = "New Session";
		/** Shell plugin's injected surfaces (generation 12), hidden while the mode is on. */
		const SHELL_MARKERS = ["data-eloize-actions-12", "data-eloize-new-chat-12", "data-eloize-upload-12"];

		/** The "+" command menu card / row / label classes (dsh-client-ui-commands, stable in this build). */
		const MENU_CARD_CLASS = "mufS8W_card";
		const MENU_ROW_CLASS = "mufS8W_row";
		const MENU_LABEL_CLASS = "mufS8W_label";

		/** The model picker's stable root class (dsh-client-ui-model-selection). */
		const MODEL_PICKER_CLASS = "_7KE1Ra_root";
		/** The workspace-folder dropdown (composer hero) - hidden in mode (Push 7). */
		const WORKSPACE_DROPDOWN_CLASS = "pXSMma_workspace";
		/** The agent-preset "seat" dropdown (composer hero) - hidden in mode (Push 7). */
		const SEAT_DROPDOWN_CLASS = "cubgiG_seat";

		/** Plain-text-readable attachment types for the in-mode upload control. */
		const UPLOAD_ACCEPT =
			".txt,.md,.markdown,.csv,.tsv,.json,.jsonl,.log,.yaml,.yml,.xml,.html,.htm,.css,.js,.mjs,.ts,.jsx,.py,.java,.c,.h,.cpp,.cs,.rs,.go,.rb,.php,.sh,.ps1,.bat,.ini,.toml,.sql,.r,.swift,.kt,.scala,.pl,.lua,.cfg,.conf,.env,.gitignore,text/plain,text/markdown,application/json,text/csv,application/xml,text/xml,text/html,text/css,application/javascript,text/x-python,text/x-shellscript";

		/** The chat area's stable class prefix (same anchor the branding plugin uses). */
		const CHAT_ROOT_PREFIX = "wSkVaW";
		/** The composer's text field, whichever kind the host renders. */
		const FIELD_SELECTOR = "textarea, input, [contenteditable='true']";
		//#endregion

		//#region dom helpers
		function isAttached(node) {
			if (node === null || node === undefined) return false;
			if (typeof document === "undefined") return false;
			return document.contains(node);
		}

		function findInjected(attr) {
			if (typeof document === "undefined") return null;
			return document.querySelector("[" + attr + "]");
		}

		/** Every element whose trimmed text equals `text`, in document order. */
		function elementsWithText(root, text) {
			const found = [];
			if (root === null || root === undefined) return found;
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
			let node = walker.nextNode();
			while (node !== null) {
				const value = node.nodeValue;
				if (value !== null && value.trim() === text) {
					const el = node.parentElement;
					if (el !== null && el !== document.body) found.push(el);
				}
				node = walker.nextNode();
			}
			return found;
		}

		/** Whether the node sits inside the chat area (never the sidebar search or settings). */
		function insideChatRoot(node) {
			let cursor = node;
			while (cursor !== null && cursor !== document.body) {
				if (typeof cursor.className === "string" && cursor.className.indexOf(CHAT_ROOT_PREFIX) >= 0) return true;
				cursor = cursor.parentElement;
			}
			return false;
		}

		function el(tag, attrs, children) {
			const node = document.createElement(tag);
			for (const key of Object.keys(attrs ?? {})) {
				if (key === "style") node.setAttribute("style", attrs[key]);
				else if (key === "text") node.textContent = attrs[key];
				else node.setAttribute(key, attrs[key]);
			}
			for (const child of children ?? []) {
				if (child === null || child === undefined) continue;
				node.appendChild(child);
			}
			return node;
		}

		function applyInlineStyle(node, style) {
			for (const key of Object.keys(style)) node.style[key] = style[key];
			return node;
		}

		function svg(attrs, paths) {
			const NS = "http://www.w3.org/2000/svg";
			const node = document.createElementNS(NS, "svg");
			for (const key of Object.keys(attrs)) node.setAttribute(key, attrs[key]);
			for (const d of paths) {
				const p = document.createElementNS(NS, "path");
				p.setAttribute("d", d);
				node.appendChild(p);
			}
			return node;
		}

		/** Fold separators and case so host paths never register twice or compare wrong. */
		function normalisePath(value) {
			return String(value).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
		}

		/** Path equality through the shared normaliser. */
		function sameDirectory(left, right) {
			return normalisePath(left) === normalisePath(right);
		}

		/** Settle a RemoteResult envelope; a non-ok result throws with the wire error. */
		function valueOf(result, label) {
			if (result === undefined || result === null) throw new Error((label ?? "remote call") + " returned nothing");
			if (result.ok !== true) {
				const error = result.error;
				throw new Error((label ?? "remote call") + " failed" + (error && error.code ? ": " + error.code : ""));
			}
			return result.value;
		}
		//#endregion

		//#region mode state
		/** The Workspace registered for the Confidential folder, when present. */
		function confidentialWorkspace(snapshot) {
			return (snapshot.items ?? []).find((workspace) => sameDirectory(workspace.path, CONFIDENTIAL_CWD));
		}

		/** The currently open session id, when one exists. */
		function currentSessionId(services) {
			const snapshot = services.sessions?.list?.getSnapshot?.();
			return snapshot?.current ?? undefined;
		}

		/** The current session id when that session lives in the Confidential Workspace. */
		function currentConfidentialSessionId(services) {
			const current = currentSessionId(services);
			if (current === undefined) return undefined;
			const workspace = confidentialWorkspace(services.workspaces.list.getSnapshot());
			if (workspace === undefined) return undefined;
			return Array.isArray(workspace.sessionIds) && workspace.sessionIds.includes(current) ? current : undefined;
		}

		/** Mode is derived, never stored: ON iff the open session is a Confidential session. */
		function modeIsOn(services) {
			return currentConfidentialSessionId(services) !== undefined;
		}

		/**
		 * Read-only debug handle (v3 rule): everything needed to see why the
		 * mode is or isn't on, inspectable from the browser console.
		 * window.__eloizeConfidential.state()
		 */
		function debugState(services) {
			const sessionSnapshot = services.sessions?.list?.getSnapshot?.() ?? {};
			const current = sessionSnapshot.current;
			const summary = current !== undefined && sessionSnapshot.byId ? sessionSnapshot.byId[current] : undefined;
			return {
				generation: GENERATION,
				mode: modeIsOn(services) ? "on" : "off",
				sessionId: current ?? null,
				cwd: summary && summary.cwd ? normalisePath(summary.cwd) : null,
				confidentialPath: normalisePath(CONFIDENTIAL_CWD),
				toggleRows: typeof document === "undefined" ? 0 : document.querySelectorAll(".eloize-confidential-toggle").length,
				lastError,
			};
		}
		//#endregion

		//#region navigation
		/** The folder's own name, as the host would auto-title it. */
		function confidentialFolderName() {
			return String(CONFIDENTIAL_CWD).replace(/\\/g, "/").replace(/\/+$/, "").split("/").pop();
		}

		/**
		 * Register the Confidential folder as a real Workspace (idempotent: the host
		 * adopts the path), repairing its auto title to "Confidential". Same pattern
		 * as the shell plugin's chats flow, with the same guarded cosmetic repairs.
		 */
		async function ensureConfidentialWorkspace(services) {
			const existing = services.workspaces.list
				.getSnapshot()
				.items.find((workspace) => sameDirectory(workspace.path, CONFIDENTIAL_CWD));
			const workspace = existing ?? (await services.workspaces.create({ path: CONFIDENTIAL_CWD }));
			if (existing === undefined || workspace.title === confidentialFolderName() || workspace.title === WORKSPACE_TITLE) {
				try {
					await services.workspaces.rename(workspace.workspaceId, WORKSPACE_TITLE);
				} catch (reason) {
					console.warn("@eloize/dsh-confidential: workspace rename failed:", reason);
				}
			}
			return workspace;
		}

		/** The fixed session name: "29 Sep 10:42" (24h, at creation). Push 3 dropped the "Confidential \u00b7 " prefix. */
		function confidentialTitle() {
			const d = new Date();
			const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			const hh = String(d.getHours()).padStart(2, "0");
			const mm = String(d.getMinutes()).padStart(2, "0");
			return d.getDate() + " " + months[d.getMonth()] + " " + hh + ":" + mm;
		}

		/**
		 * Rename one session through the CLIENT SESSION BINDING when available
		 * (the Push 3.1 "New Session" fix). The binding's `session.rename`
		 * performs the same host call AND settles the local title projection,
		 * which is what the sidebar list rows read; the raw API remote alone
		 * renames on the host (the open session/tab shows it) but the sidebar
		 * list projection never receives the title when the rename lands
		 * BEFORE the session is opened, because no control-stream projection
		 * frame is delivered for an unopened session. The raw remote stays as
		 * the fallback so a binding-less host still gets the rename.
		 * Logging and the failure toast belong to the caller.
		 */
		async function renameSessionTitle(services, sessionId, title) {
			let binding = undefined;
			try {
				if (typeof services.sessions.binding === "function") binding = services.sessions.binding(sessionId);
			} catch (reason) {
				binding = undefined;
			}
			const session = binding === undefined || binding === null ? undefined : binding.session;
			if (session !== undefined && session !== null && typeof session.rename === "function") {
				return valueOf(await session.rename(title), "session rename");
			}
			return valueOf(await services.remote.session.rename({ sessionId, title }), "session rename");
		}

		/**
		 * Idempotent rename pass (Push 3): Confidential-workspace sessions
		 * titled exactly "Confidential \u00b7 <date>" become the bare "<date>".
		 * Runs best-effort; every rename logs its session id, never content.
		 * Push 3.1: renames go through the session binding so the sidebar list
		 * projection settles alongside the host rename.
		 */
		let titlesPassDone = false;
		async function renameLegacyTitles(services) {
			if (titlesPassDone) return;
			titlesPassDone = true;
			try {
				const workspaces = services.workspaces.list.getSnapshot();
				const workspace = (workspaces.items ?? []).find((w) => sameDirectory(w.path, CONFIDENTIAL_CWD));
				if (workspace === undefined) return;
				const sessions = services.sessions.list.getSnapshot();
				for (const sessionId of workspace.sessionIds ?? []) {
					const row = sessions.byId[sessionId];
					if (row === undefined) continue;
					const match = LEGACY_TITLE_PATTERN.exec(String(row.title ?? ""));
					if (match === null) continue;
					try {
						await renameSessionTitle(services, sessionId, match[1]);
						enterLog("title.rename", "ok id=" + sessionId);
					} catch (reason) {
						enterLog("title.rename", "FAILED id=" + sessionId + " " + (reason && reason.message ? reason.message : String(reason)));
					}
				}
			} catch (reason) {
				// best effort; the enter flow's own pin is the real contract
			}
		}

		//#region enter diagnostics (loud failures, v3 rule)
		/** Last enter-flow failure, kept for the debug handle. */
		let lastError = null;

		/** Log one enter-flow step. IDs and counts only, never chat content. */
		function enterLog(step, message) {
			console.log("[eloize-confidential] " + step + ": " + message);
		}

		/** Record a failed step: log, remember, and toast. */
		function enterFailed(step, reason) {
			const message = reason && reason.message ? reason.message : String(reason);
			lastError = step + ": " + message;
			enterLog(step, "FAILED " + message);
			showFailureToast(step);
		}

		/** On-screen failure notice; the enter flow must never fail silently. */
		function showFailureToast(step) {
			if (typeof document === "undefined" || document.body === null) return;
			for (const stale of document.querySelectorAll("[" + TOAST_ATTR + "]")) stale.remove();
			const toast = document.createElement("div");
			toast.setAttribute(TOAST_ATTR, "1");
			toast.textContent = "Couldn't open Confidential mode (" + step + ")";
			applyInlineStyle(toast, {
				position: "fixed",
				top: "16px",
				right: "16px",
				zIndex: "2147483000",
				maxWidth: "420px",
				padding: "12px 16px",
				borderRadius: "12px",
				background: "#241c4a",
				color: "#ffffff",
				fontFamily: "'Manrope',ui-sans-serif,system-ui,sans-serif",
				fontWeight: "600",
				fontSize: "13.5px",
				lineHeight: "18px",
				boxShadow: "0 12px 32px rgba(36,28,74,0.35)",
			});
			document.body.appendChild(toast);
			setTimeout(() => {
				if (isAttached(toast)) toast.remove();
			}, 6000);
		}

		/**
		 * Run one enter-flow step with the loud contract: `ok` (plus ids) on
		 * success, `FAILED <message>` + toast + lastError on failure. The
		 * throw always propagates - the flow keeps failing CLOSED.
		 * `detail` may be a string or a function of the settled value.
		 */
		async function enterStep(services, step, detail, run) {
			try {
				const value = await run();
				const suffix = typeof detail === "function" ? detail(value) : detail;
				enterLog(step, "ok" + (suffix === undefined || suffix === null ? "" : " " + suffix));
				return value;
			} catch (reason) {
				enterFailed(step, reason);
				throw reason;
			}
		}
		//#endregion

		/** Push 7: the title last applied to a freshly-created confidential session. */
		let lastNewSessionTitle = null;

		/**
		 * Relabel the just-created confidential session's sidebar row from the
		 * host default "New Session" to the date. The host summary title only
		 * settles on the next async list frame; this makes the row correct as
		 * soon as the chat is made. Idempotent: no-ops once the row shows the date.
		 */
		function relabelNewSessionRow() {
			if (typeof document === "undefined" || lastNewSessionTitle === null) return;
			const row = document.querySelector("[class*='hHd-'] [class*='sessionRow'][class*='_selected']");
			if (row === null) return;
			const titleEl = row.querySelector("[class*='_title']");
			if (titleEl === null) return;
			if ((titleEl.textContent ?? "").trim() === "New Session") titleEl.textContent = lastNewSessionTitle;
		}

		/**
		 * Enter confidential mode. The session is created BLANK and the slim
		 * agent preset is selected before anything else, so the preset lock
		 * (fixed at first turn) holds; the fixed name is applied immediately so
		 * no title LLM ever runs for it. On any failure the half-open state is
		 * abandoned and the page returns home rather than leaving a session in
		 * the folder that could route to the cloud.
		 *
		 * Every step logs and a failure toasts - nothing in this flow is
		 * silent (v3 rule; the v2 build proved a silent enter is invisible).
		 */
		async function enterConfidential(services) {
			try {
				const workspace = await enterStep(services, "workspace", (w) => "id=" + (w && w.workspaceId ? w.workspaceId : "?"), () => ensureConfidentialWorkspace(services));
				// sessions.create resolves the new SESSION ID directly (a plain
				// string, not an envelope) - verified against the shipped
				// dsh-api-session-controller client service.
				const sessionId = await enterStep(services, "session.create", (id) => "id=" + id, async () => {
					const id = await services.sessions.create({ workspaceId: workspace.workspaceId });
					if (typeof id !== "string" || id.length === 0) throw new Error("no session id returned");
					return id;
				});
				// The preset remote takes two POSITIONAL arguments and answers
				// a RemoteResult whose value is the settled preset id; a refusal
				// (not-blank session, unknown preset) lands in error.details.reason.
				await enterStep(services, "preset.select", "id=" + sessionId, async () => {
					const preset = await services.remote.agentPresets.select(sessionId, SLIM_PRESET_ID);
					if (preset === undefined || preset === null || preset.ok !== true) {
						const reason = preset && preset.error && preset.error.details && typeof preset.error.details.reason === "string"
							? preset.error.details.reason
							: (preset && preset.error && preset.error.message) || "preset refused";
						throw new Error(reason);
					}
					return preset.value;
				});
				// The fixed name pins the title; no title LLM ever runs for it.
				// Push 3.1: renamed through the session binding so the sidebar
				// list projection settles (raw remote alone left the sidebar on
				// "New Session" while the tab showed the date).
				const title = confidentialTitle();
				await enterStep(services, "session.rename", "id=" + sessionId, async () => renameSessionTitle(services, sessionId, title));
				services.uiWorkspace.openSession(sessionId);
				// Push 7: the sidebar list row reads the host summary title, which
				// only settles on the next async list frame; relabel the fresh
				// "New Session" row to the date immediately (host-side cause).
				lastNewSessionTitle = title;
				relabelNewSessionRow();
				// The visual-only Thinking pill resets on every new chat.
				if (typeof thinkToggleReset === "function") thinkToggleReset();
				enterLog("open", "id=" + sessionId);
			} catch (reason) {
				console.warn("@eloize/dsh-confidential: enter failed:", reason);
				runInk("retract"); // reverse the spread on a failed enter
				exitToHome(services);
			}
		}

		/** Toggling off returns to the home page: clear the current session. */
		function exitToHome(services) {
			try {
				services.sessions.clear();
				const layout = services.layout;
				if (layout !== undefined && typeof layout.selectPanel === "function") layout.selectPanel(null);
				enterLog("exit", "ok");
			} catch (reason) {
				lastError = "exit: " + (reason && reason.message ? reason.message : String(reason));
				enterLog("exit", "FAILED " + lastError);
			}
		}
		//#endregion

		//#region thinking toggle remote
		/**
		 * Mount the `eloizeConfidential` namespace on this client with a
		 * hand-built contribution. The host side registers the remote through
		 * ctx.provide + a source-mode marker; the client side needs no
		 * generated manifest, only strict descriptors with passthrough
		 * codecs (verified against dsh-api-gateway's client mount).
		 */
		function mountThinkingRemote(ctx) {
			if (!ctx.remote || typeof ctx.remote.$mount !== "function") return;
			const passthrough = () => ({ parse: (value) => value });
			const codec = (typeSymbol) => ({ mode: "strict", typeSymbol, schema: passthrough() });
			const parameter = (name) => ({ name, wire: name, source: "json", codec: codec("eloize/" + name) });
			ctx.remote.$mount({
				package: "eloize-confidential-client",
				descriptors: [
					{
						id: "eloize:setThinking",
						service: "eloizeConfidential",
						namespace: "eloizeConfidential",
						method: "setThinking",
						invocation: { kind: "direct" },
						parameters: [parameter("sessionId"), parameter("enabled")],
						result: codec("eloize/setThinkingResult"),
					},
					{
						id: "eloize:getThinking",
						service: "eloizeConfidential",
						namespace: "eloizeConfidential",
						method: "getThinking",
						invocation: { kind: "direct" },
						parameters: [parameter("sessionId")],
						result: codec("eloize/getThinkingResult"),
					},
				],
			}).catch((reason) => {
				console.warn("@eloize/dsh-confidential: thinking remote mount failed:", reason);
			});
		}

		/** The mounted namespace service, or undefined when unavailable. */
		function thinkingRemote(ctx) {
			try {
				const namespace = ctx.get("remote.eloizeConfidential");
				return namespace;
			} catch (reason) {
				return undefined;
			}
		}

		/** Read the server-side thinking flag for this session (defaults ON). */
		async function readThinking(services, sessionId) {
			try {
				const remote = services.thinkingRemote();
				if (remote === undefined || typeof remote.getThinking !== "function") return true;
				const result = await remote.getThinking(sessionId);
				if (result === undefined || result === null || result.ok !== true) return true;
				const value = result.value;
				return value === undefined || value === null ? true : value.thinkOn !== false;
			} catch (reason) {
				console.warn("@eloize/dsh-confidential: getThinking failed:", reason);
				return true;
			}
		}

		/** Push the toggle to the node lock; the next reply routes to the matching model tag. */
		async function writeThinking(services, sessionId, enabled) {
			try {
				const remote = services.thinkingRemote();
				if (remote === undefined || typeof remote.setThinking !== "function") return enabled;
				const result = await remote.setThinking(sessionId, enabled);
				if (result === undefined || result === null || result.ok !== true) return enabled;
				const value = result.value;
				return value === undefined || value === null ? enabled : value.thinkOn !== false;
			} catch (reason) {
				console.warn("@eloize/dsh-confidential: setThinking failed:", reason);
				return enabled;
			}
		}
		//#endregion

		//#region sidebar row (slot occupant)
		/** Row layout mirroring the shell's placeholder row. */
		const ROW_STYLE = {
			display: "flex",
			alignItems: "center",
			gap: "12px",
			width: "100%",
			boxSizing: "border-box",
			textAlign: "left",
			padding: "4px 0",
		};

		/** Subscribe to the session/workspace stores so the row follows the derived mode. */
		function useMode(services) {
			const [state, setState] = React.useState(() => modeIsOn(services));
			React.useEffect(() => {
				const disposers = [];
				for (const store of [services.sessions?.list, services.workspaces?.list]) {
					if (store !== undefined && store !== null && typeof store.subscribe === "function") {
						disposers.push(store.subscribe(() => setState(modeIsOn(services))));
					}
				}
				return () => {
					for (const dispose of disposers) dispose();
				};
			}, [services]);
			return state;
		}

		//#region toggle ink animation (Push 7)
		/** True while an ink animation is in flight; swallows a fast double-click. */
		let inkRunning = false;

		/** The live toggle row's centre, for the ink origin. */
		function inkOrigin() {
			if (typeof document === "undefined") return null;
			const toggle = document.querySelector(".eloize-confidential-live");
			if (toggle === null) return null;
			const rect = toggle.getBoundingClientRect();
			return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
		}

		/**
		 * Run the purple ink spread (or reverse) from the toggle across the
		 * sidebar. Reduced-motion skips it entirely; a run in flight is ignored
		 * so a fast double-click toggles once. The overlay is pointer-transparent,
		 * sits on <body> over the sidebar rect, and self-removes when the
		 * animation ends.
		 */
		function runInk(direction) {
			if (typeof document === "undefined" || document.body === null) return;
			if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
			if (inkRunning) return;
			const origin = inkOrigin();
			if (origin === null) return;
			const sidebar = document.querySelector("[class*='hHd-']");
			const rect = sidebar !== null ? sidebar.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
			inkRunning = true;
			const overlay = el("div", { [INK_ATTR]: "1", class: "eloize-ink", "data-ink": direction });
			applyInlineStyle(overlay, {
				position: "fixed",
				left: rect.left + "px",
				top: rect.top + "px",
				width: rect.width + "px",
				height: rect.height + "px",
				"--ink-x": (origin.x - rect.left) + "px",
				"--ink-y": (origin.y - rect.top) + "px",
			});
			document.body.appendChild(overlay);
			const finish = () => {
				if (isAttached(overlay)) overlay.remove();
				inkRunning = false;
			};
			overlay.addEventListener("animationend", finish);
			setTimeout(finish, 700); // safety net
		}
		//#endregion

		/**
		 * The live Confidential mode row. Reuses the shell plugin's toggle CSS by
		 * keeping its class structure (`eloize-confidential-toggle` / `checkbox-wrapper`
		 * / `tick_mark`); the checkbox input order before the label matters for that
		 * stylesheet's adjacent-sibling selectors. Checked state is DERIVED from the
		 * current session, never a local flip: clicking while ON exits to home,
		 * clicking while OFF opens a new confidential session.
		 */
		function ConfidentialRowLive({ services }) {
			const on = useMode(services);
			const toggle = () => {
				if (inkRunning) return; // a fast double-click switches once
				runInk(on ? "retract" : "spread"); // starts on the click, before the mode flips
				if (on) exitToHome(services);
				else enterConfidential(services);
			};
			return React.createElement(
				"div",
				{ className: "eloize-confidential-toggle " + LIVE_CLASS, style: ROW_STYLE },
				React.createElement(
					"div",
					{ className: "checkbox-wrapper" },
					React.createElement("input", {
						type: "checkbox",
						id: LIVE_INPUT_ID,
						checked: on,
						readOnly: true,
						"aria-label": ROW_TITLE,
					}),
					React.createElement(
						"label",
						{ htmlFor: LIVE_INPUT_ID, onClick: toggle },
						React.createElement("div", { className: "tick_mark" }),
					),
				),
				React.createElement(
					"span",
					{ style: { display: "flex", flexDirection: "column", cursor: "pointer" }, onClick: toggle },
					React.createElement("span", { className: "eloize-conf-title" }, ROW_TITLE),
					React.createElement("span", { className: "eloize-conf-sub" }, on ? CONFIDENTIAL_SUB_ON : CONFIDENTIAL_SUB_OFF),
				),
			);
		}
		//#endregion

		//#region composer controls (badge + thinking + upload)
		/** Inline geometry shared by the badge row's pieces. */
		const BADGE_ROW_STYLE = {
			display: "flex",
			alignItems: "center",
			justifyContent: "flex-start",
			gap: "10px",
			flexWrap: "wrap",
			boxSizing: "border-box",
			width: "100%",
			maxWidth: "520px",
			margin: "0 auto 10px",
			paddingLeft: "8px",
		};
		const BADGE_STYLE = {
			display: "inline-flex",
			alignItems: "center",
			gap: "7px",
			padding: "5px 12px",
			borderRadius: "999px",
			background: "linear-gradient(135deg, #3a28c4 0%, #6d4cf0 100%)",
			color: "#ffffff",
			fontFamily: "'Manrope',ui-sans-serif,system-ui,sans-serif",
			fontWeight: "700",
			fontSize: "12.5px",
			lineHeight: "18px",
			whiteSpace: "nowrap",
			boxShadow: "0 2px 10px rgba(75,55,224,0.28)",
		};
		const THINK_TOGGLE_LAYOUT = {
			display: "inline-flex",
			alignItems: "center",
			gap: "6px",
			cursor: "default",
			userSelect: "none",
		};

		/**
		 * The Thinking/Fast control (Push 7: VISUAL ONLY). A real .eloize-btn
		 * toggle - purple "Thinking" + brain, white "Fast" + bolt, with the
		 * branding press animation and aria-pressed. It never calls setThinking
		 * (every request stays identical to Thinking; the node lock keeps the
		 * one model tag) and starts on Thinking on every load and every new chat.
		 */
		let thinkToggleEl = null;
		let thinkToggleReset = null;

		function buildThinkToggle(services) {
			const brain = svg(
				{ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", class: "eloize-think-on-icon" },
				[
					"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z",
					"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z",
				],
			);
			const bolt = svg(
				{ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", class: "eloize-think-off-icon", style: "display:none" },
				["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
			);
			const label = el("span", { class: "eloize-think-label", text: THINK_LABEL });
			const button = el("button", {
				type: "button",
				class: "eloize-btn eloize-btn--on eloize-conf-think-toggle",
				"aria-pressed": "true",
			}, [brain, bolt, label]);
			applyInlineStyle(button, THINK_TOGGLE_LAYOUT);
			// Visual-only: no setThinking call, ever. Always starts Thinking.
			let thinking = true;
			const renderThink = () => {
				button.setAttribute("class", "eloize-btn " + (thinking ? "eloize-btn--on" : "eloize-btn--off") + " eloize-conf-think-toggle");
				button.setAttribute("aria-pressed", thinking ? "true" : "false");
				label.textContent = thinking ? THINK_LABEL : FAST_LABEL;
				brain.setAttribute("style", thinking ? "" : "display:none");
				bolt.setAttribute("style", thinking ? "display:none" : "");
			};
			button.addEventListener("click", () => {
				thinking = !thinking;
				renderThink();
			});
			thinkToggleEl = button;
			thinkToggleReset = () => {
				thinking = true;
				renderThink();
			};
			return button;
		}

		/** Upload the chosen file through the transcript plugin's own pipeline, pointed at the Confidential folder. */
		function runTranscriptUpload(services, file) {
			const sessionId = currentConfidentialSessionId(services);
			if (sessionId === undefined) {
				console.warn("@eloize/dsh-confidential: upload refused - no confidential session open");
				return Promise.resolve();
			}
			const entry = window.__eloizeTranscript?.runUploadWithTarget;
			if (typeof entry !== "function") {
				console.warn("@eloize/dsh-confidential: transcript entry point unavailable");
				return Promise.resolve();
			}
			// Push 2: NO services object crosses the plugin boundary - the entry is
			// bound to the transcript bundle's own ctx, so its remote namespaces are
			// gated by ITS inject declarations, not ours.
			return entry(file, { sessionId, cwd: CONFIDENTIAL_CWD, title: WORKSPACE_TITLE });
		}

		/** Build the sidebar's full-width Upload transcript button; it opens a hidden file input and never touches the host picker. */
		function buildSidebarUploadButton(services) {
			const button = el("button", { type: "button", [TOP_UPLOAD_ATTR]: "1", class: "eloize-btn eloize-btn--on eloize-upload-control", title: UPLOAD_LABEL, "aria-label": UPLOAD_LABEL }, [
				svg(
					{ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" },
					["M12 16V4M7 9l5-5 5 5M5 20h14"],
				),
				document.createTextNode(UPLOAD_LABEL),
			]);
			applyInlineStyle(button, {
				display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
				width: "calc(100% - 4px)", margin: "0 2px 8px", boxSizing: "border-box", cursor: "pointer",
			});
			button.addEventListener("click", () => {
				const input = el("input", { type: "file", accept: UPLOAD_ACCEPT, style: "display:none" });
				input.addEventListener("change", () => {
					const file = (input.files ?? [])[0];
					input.remove();
					if (file === undefined || file === null) return;
					// The transcript plugin owns the busy state (spinner, "Cleaning\u2026",
					// disabled) through .eloize-upload-control - this button must not
					// manage its own disabled flag, or the two would fight.
					runTranscriptUpload(services, file).catch((reason) => console.warn("@eloize/dsh-confidential: upload failed:", reason));
				});
				document.body.appendChild(input);
				input.click();
			});
			return button;
		}

		/** Build the sidebar's full-width purple New chat button (the Push 3 enter flow). */
		function buildSidebarNewChatButton(services) {
			const button = el("button", { type: "button", [TOP_NEWCHAT_ATTR]: "1", class: "eloize-btn eloize-btn--on", title: NEW_CHAT_LABEL, "aria-label": NEW_CHAT_LABEL }, [
				svg(
					{ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2.5, "stroke-linecap": "round" },
					["M12 5v14M5 12h14"],
				),
				document.createTextNode(NEW_CHAT_LABEL),
			]);
			applyInlineStyle(button, {
				display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
				width: "calc(100% - 4px)", margin: "0 2px 8px", boxSizing: "border-box", cursor: "pointer",
			});
			button.addEventListener("click", () => enterConfidential(services));
			return button;
		}

		/**
		 * Mount the two top-slot controls (Upload transcript on top, New chat
		 * below) where the shell's fallback pair sits in normal mode - i.e.
		 * immediately before the host's own new-session control (hidden in the
		 * mode). Idempotent via the markers; removed again when the mode turns
		 * off. Nothing is injected under Audits any more.
		 */
		function mountTopControls(services) {
			if (typeof document === "undefined") return;
			const existingUpload = document.querySelector("[" + TOP_UPLOAD_ATTR + "]");
			const existingNew = document.querySelector("[" + TOP_NEWCHAT_ATTR + "]");
			if (existingUpload !== null && existingNew !== null) return;
			let anchor = null;
			for (const button of document.querySelectorAll("button")) {
				if ((button.textContent ?? "").trim() === HOST_NEW_SESSION_LABEL) { anchor = button; break; }
			}
			if (anchor === null) {
				anchor = document.querySelector("[data-eloize-actions-12]") ?? document.querySelector("[data-eloize-new-chat-12]");
			}
			if (anchor === null || anchor.parentElement === null) return;
			const parent = anchor.parentElement;
			if (existingUpload === null) parent.insertBefore(buildSidebarUploadButton(services), anchor);
			if (existingNew === null) parent.insertBefore(buildSidebarNewChatButton(services), anchor);
		}

		/** Remove the top-slot controls when the mode turns off. */
		function unmountTopControls() {
			if (typeof document === "undefined") return;
			for (const node of document.querySelectorAll("[" + TOP_UPLOAD_ATTR + "],[" + TOP_NEWCHAT_ATTR + "]")) {
				if (node.parentElement !== null) node.parentElement.removeChild(node);
			}
		}

		/** Build the whole composer control row: badge + Thinking only (Push 3.1 revoked the upload pill). */
		function buildBadgeRow(services) {
			const badge = el("span", { class: "eloize-conf-badge" }, [
				svg(
					{ width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" },
					["M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"],
				),
				document.createTextNode(BADGE_LABEL),
			]);
			applyInlineStyle(badge, BADGE_STYLE);
			const row = el("div", { [BADGE_ATTR]: "1", class: "eloize-conf-badgerow" }, [badge, buildThinkToggle(services)]);
			return applyInlineStyle(row, BADGE_ROW_STYLE);
		}
		//#endregion

		//#region mounting and filtering
		/** Find the composer's text field inside the chat area (not the sidebar search). */
		function findComposerField() {
			if (typeof document === "undefined") return null;
			for (const field of document.querySelectorAll(FIELD_SELECTOR)) {
				let node = field;
				while (node !== null && node !== document.body) {
					if (typeof node.className === "string" && node.className.indexOf(CHAT_ROOT_PREFIX) >= 0) return field;
					node = node.parentElement;
				}
			}
			return null;
		}

		/** From the composer field, climb to the composer column (direct child of the chat root). */
		function findComposerColumn(field) {
			let node = field;
			while (node !== null && node !== document.body) {
				const parent = node.parentElement;
				if (parent !== null && typeof parent.className === "string" && parent.className.indexOf(CHAT_ROOT_PREFIX) >= 0) return node;
				node = parent;
			}
			return null;
		}

		/** The composer bar's root inside the composer column (same logic as the shell plugin). */
		function findComposerBar(composer) {
			const field = composer.querySelector(FIELD_SELECTOR);
			if (field === null) return null;
			let node = field;
			while (node.parentElement !== null && node.parentElement !== composer) node = node.parentElement;
			return node.parentElement === composer ? node : null;
		}

		/** Mount the badge row directly above the composer bar. Idempotent via the marker. */
		function mountBadgeRow(services) {
			if (typeof document === "undefined") return;
			if (isAttached(findInjected(BADGE_ATTR))) return;
			// Retire badge rows left behind by an earlier generation's bundle (a
			// hot swap does not clean up after its predecessor). Belt and braces
			// with the .eloize-conf-think CSS hide rule.
			for (let gen = 1; gen <= 9; gen++) {
				if (String(gen) === GENERATION) continue;
				for (const node of document.querySelectorAll("[data-eloize-confidential-badge-" + gen + "]")) {
					if (node.parentElement !== null) node.parentElement.removeChild(node);
				}
			}
			const field = findComposerField();
			if (field === null) return;
			const composer = findComposerColumn(field);
			if (composer === null) return;
			const bar = findComposerBar(composer);
			if (bar === null) return;
			composer.insertBefore(buildBadgeRow(services), bar);
		}

		/**
		 * Hide the shell's injected surfaces and the host New Session control
		 * while ON. The shell's inert placeholder toggle row is NOT touched
		 * here: the stable one-row contract (body[data-eloize-confidential-live]
		 * + the shell's own CSS) owns that, so there is exactly one mechanism.
		 */
		function hideShellArtifacts(on) {
			if (typeof document === "undefined") return;
			const selectors = SHELL_MARKERS.map((marker) => "[" + marker + "]");
			for (const selector of selectors) {
				for (const node of document.querySelectorAll(selector)) {
					if (on) {
						if (node.getAttribute(HIDE_ATTR) !== "1") {
							node.setAttribute(HIDE_ATTR, "1");
							// Remember the inline display so the OFF pass restores
							// it (the shell's fallback buttons carry inline
							// display:flex; wiping it leaves them display:block
							// and the icon/label collide - Push 3.2 fix).
							node.setAttribute(DISPLAY_ATTR, node.style.display ?? "");
						}
						node.style.display = "none";
					} else if (node.getAttribute(HIDE_ATTR) === "1") {
						node.removeAttribute(HIDE_ATTR);
						node.style.display = node.getAttribute(DISPLAY_ATTR) ?? "";
						node.removeAttribute(DISPLAY_ATTR);
					}
				}
			}
			for (const button of document.querySelectorAll("button")) {
				const text = button.textContent;
				if (text === null || text.trim() !== HOST_NEW_SESSION_LABEL) continue;
				if (on) {
					if (button.getAttribute(HIDE_ATTR) !== "1") {
						button.setAttribute(HIDE_ATTR, "1");
						button.setAttribute(DISPLAY_ATTR, button.style.display ?? "");
					}
					button.style.display = "none";
				} else if (button.getAttribute(HIDE_ATTR) === "1") {
					button.removeAttribute(HIDE_ATTR);
					button.style.display = button.getAttribute(DISPLAY_ATTR) ?? "";
					button.removeAttribute(DISPLAY_ATTR);
				}
			}
		}

		/** Hide the "Full access" command chip (and any Read Only / Project Write state) while ON. */
		function hideFullAccessChip(on) {
			if (typeof document === "undefined") return;
			const labels = ["Full access", "Read Only", "Project Write"];
			for (const node of document.querySelectorAll("button, [role='button']")) {
				const text = node.textContent;
				if (text === null || !labels.includes(text.trim()) || !insideChatRoot(node)) continue;
				if (on) {
					node.setAttribute(HIDE_ATTR, "1");
					node.style.display = "none";
				} else if (node.getAttribute(HIDE_ATTR) === "1") {
					node.removeAttribute(HIDE_ATTR);
					node.style.display = "";
				}
			}
		}

		/**
		 * The "+" command menu: while ON only the transcript plugin's
		 * "Upload transcript" row stays visible. The menu card re-renders per
		 * open; the boot observer covers its arrival, and this pass is also
		 * run on every body mutation.
		 */
		function filterCommandMenus(on) {
			if (typeof document === "undefined") return;
			for (const card of document.querySelectorAll("." + MENU_CARD_CLASS)) {
				for (const row of card.querySelectorAll("." + MENU_ROW_CLASS)) {
					const label = row.querySelector("." + MENU_LABEL_CLASS);
					const text = label !== null ? label.textContent : row.textContent;
					const isUpload = text !== null && text.trim() === UPLOAD_LABEL;
					if (on && !isUpload) {
						row.setAttribute(HIDE_ATTR, "1");
						row.style.display = "none";
					} else if (row.getAttribute(HIDE_ATTR) === "1") {
						row.removeAttribute(HIDE_ATTR);
						row.style.display = "";
					}
				}
			}
		}

		/** The workspace ROW owning a label match, found by the host's stable class suffix. */
		function workspaceRowOf(label) {
			let node = label;
			while (node !== null && node !== undefined && node !== document.body) {
				const cls = node.className;
				if (typeof cls === "string" && cls.indexOf("projectRow") >= 0) return node;
				node = node.parentElement;
			}
			return null;
		}

		/**
		 * The workspace GROUP SECTION that owns a row. The host renders one group
		 * per Workspace: the section holds the project row AND every session row
		 * (each wrapped in its own container), so hiding the section hides the
		 * folder and its chats together. Used by the Push 3.2 normal-mode hide.
		 */
		function workspaceGroupSectionOf(row) {
			let node = row;
			while (node !== null && node !== undefined && node !== document.body) {
				const cls = node.className;
				if (typeof cls === "string" && cls.indexOf("groupSection") >= 0) return node;
				node = node.parentElement;
			}
			return null;
		}

		/** Give the Confidential workspace row its lock icon (v2 header treatment). */
		function ensureLockIcon(row) {
			if (typeof document === "undefined") return;
			if (row.querySelector("[" + LOCK_ATTR + "]") !== null) return;
			const icon = svg(
				{
					[LOCK_ATTR]: "1",
					width: 14,
					height: 14,
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					"stroke-width": 2,
					"stroke-linecap": "round",
					"stroke-linejoin": "round",
					style: "flex:none;color:inherit;",
				},
				["M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z"],
			);
			row.insertBefore(icon, row.firstChild);
		}

		//#region Push 3 sidebar (cloud chats, leave dialog, new chat)
		/** Markers for the sidebar nodes this push injects, generation-stamped. */
		const CLOUD_HEADER_ATTR = "data-eloize-confidential-cloud-" + GENERATION;
		const DIALOG_ATTR = "data-eloize-confidential-dialog-" + GENERATION;
		/** Cloud containers/rows hidden while the Cloud chats group is collapsed. */
		const CLOUD_HIDDEN_ATTR = "data-eloize-confidential-cloudhidden-" + GENERATION;

		/** The Cloud chats group's collapse state and the one-shot entry pass flag. */
		let cloudChatsExpanded = false;
		let modeSidebarReady = false;
		/** The session the leave dialog will open, when one is showing. */
		let dialogTarget = null;

		/** Identify the Confidential workspace row(s) (auto title or repaired title). */
		function confidentialRows() {
			const rows = new Set();
			for (const title of CONFIDENTIAL_TITLES) {
				for (const label of elementsWithText(document.body, title)) {
					const row = workspaceRowOf(label);
					if (row !== null) rows.add(row);
				}
			}
			return rows;
		}

		/** True when a session row belongs to the Confidential group (by owning group section). */
		function sessionScopeIsConfidential(row) {
			// Each session row is wrapped in its own container inside a group
			// section, so the project row is NEVER a previous sibling - the Push 3
			// sibling walk therefore failed closed and the leave dialog never fired.
			// Climb to the owning group section and read ITS project row's title.
			let section = null;
			let node = row;
			while (node !== null && node !== undefined && node !== document.body) {
				const cls = typeof node.className === "string" ? node.className : "";
				if (cls.indexOf("groupSection") >= 0) {
					section = node;
					break;
				}
				node = node.parentElement;
			}
			if (section === null) return true; // fail closed: no dialog without a proven group
			const project = section.querySelector("[class*='projectRow']");
			if (project === null) return true; // fail closed
			const text = String(project.textContent ?? "").trim();
			return CONFIDENTIAL_TITLES.some((title) => text.startsWith(title));
		}

		/** Resolve the session id a cloud session row opens, by its title. */
		function cloudSessionIdOf(services, row) {
			const titleEl = row.querySelector("[class*='_title']");
			const title = String(titleEl !== null ? titleEl.textContent : row.textContent).trim();
			const snapshot = services.sessions.list.getSnapshot();
			for (const id of Object.keys(snapshot.byId ?? {})) {
				const entry = snapshot.byId[id];
				if (entry === undefined || entry === null) continue;
				if (String(entry.title ?? "") !== title) continue;
				if (sameDirectory(entry.cwd ?? "", CONFIDENTIAL_CWD)) continue;
				return id;
			}
			return null;
		}

		/** Close and remove the leave dialog, whatever it was showing. */
		function closeLeaveDialog() {
			if (typeof document === "undefined") return;
			for (const node of document.querySelectorAll("[" + DIALOG_ATTR + "]")) {
				if (node.parentElement !== null) node.parentElement.removeChild(node);
			}
			dialogTarget = null;
		}

		/**
		 * The "Leave offline mode?" dialog (plan section6.1): role=dialog, aria-modal,
		 * focus trapped between [Stay offline] (default focus, Esc) and [Leave].
		 * Leave runs the exit flow, then opens the cloud chat in normal mode.
		 */
		function showLeaveDialog(services, sessionId, title) {
			closeLeaveDialog();
			if (typeof document === "undefined") return;
			dialogTarget = { sessionId, title };
			const overlay = el("div", { [DIALOG_ATTR]: "1" });
			applyInlineStyle(overlay, {
				position: "fixed", inset: "0", background: "rgba(20,14,46,0.55)",
				display: "flex", alignItems: "center", justifyContent: "center",
				zIndex: "2147483000", boxSizing: "border-box",
			});
			const dialog = el("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": DIALOG_ATTR + "-title" });
			applyInlineStyle(dialog, {
				background: "#ffffff", color: "#1d1b26", borderRadius: "16px", padding: "20px 22px",
				width: "min(92vw, 380px)", boxShadow: "0 24px 64px rgba(20,14,46,0.4)",
				fontFamily: "'Manrope',ui-sans-serif,system-ui,sans-serif", boxSizing: "border-box",
			});
			const heading = el("h2", { id: DIALOG_ATTR + "-title", text: LEAVE_DIALOG_TITLE });
			applyInlineStyle(heading, { margin: "0 0 6px", fontSize: "16px", fontWeight: "700", lineHeight: "22px" });
			const bodyLine = el("p", { text: LEAVE_DIALOG_BODY });
			applyInlineStyle(bodyLine, { margin: "0 0 16px", fontSize: "13.5px", lineHeight: "20px", color: "#5c586b" });
			const actions = el("div", {});
			applyInlineStyle(actions, { display: "flex", gap: "10px", justifyContent: "flex-end" });
			const stay = el("button", { type: "button", class: "eloize-btn eloize-btn--on" }, [document.createTextNode(LEAVE_DIALOG_STAY)]);
			const leave = el("button", { type: "button", class: "eloize-btn eloize-btn--off" }, [document.createTextNode(LEAVE_DIALOG_LEAVE)]);
			stay.addEventListener("click", () => closeLeaveDialog());
			leave.addEventListener("click", () => {
				const target = dialogTarget;
				closeLeaveDialog();
				if (target === null || target.sessionId === null) return;
				exitToHome(services);
				services.uiWorkspace.openSession(target.sessionId);
			});
			actions.appendChild(stay);
			actions.appendChild(leave);
			dialog.appendChild(heading);
			dialog.appendChild(bodyLine);
			dialog.appendChild(actions);
			overlay.appendChild(dialog);
			const focusables = [stay, leave];
			overlay.addEventListener("keydown", (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					closeLeaveDialog();
					return;
				}
				if (event.key !== "Tab") return;
				event.preventDefault();
				const index = focusables.indexOf(document.activeElement);
				focusables[index < 0 ? 0 : (index + 1) % focusables.length].focus();
			});
			document.body.appendChild(overlay);
			stay.focus();
		}

		/** Build the collapsed "Cloud chats" heading row (mode only; BLACK text per Push 3.1). */
		function buildCloudHeader(services) {
			const icon = svg(
				{ width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" },
				["M17.5 19a4.5 4.5 0 1 0-.42-8.98 6 6 0 1 0-11.06 3.1A3.5 3.5 0 0 0 6.5 19h11z"],
			);
			const header = el("div", { [CLOUD_HEADER_ATTR]: "1", role: "button", tabindex: "0", "aria-expanded": "false" }, [icon, el("span", { text: CLOUD_CHATS_LABEL })]);
			applyInlineStyle(header, {
				display: "flex", alignItems: "center", gap: "8px", boxSizing: "border-box",
				padding: "4px 10px", margin: "2px 0", cursor: "pointer", userSelect: "none",
				fontSize: "13px", fontWeight: "600", lineHeight: "18px",
				color: HEADING_TEXT, borderRadius: "8px",
			});
			header.addEventListener("click", () => toggleCloudChats());
			return header;
		}

		/** Collapse/expand the Cloud chats group; the hidden containers keep their host DOM. */
		function toggleCloudChats() {
			if (typeof document === "undefined") return;
			cloudChatsExpanded = !cloudChatsExpanded;
			const header = document.querySelector("[" + CLOUD_HEADER_ATTR + "]");
			if (header !== null) header.setAttribute("aria-expanded", cloudChatsExpanded ? "true" : "false");
			for (const node of document.querySelectorAll("[" + CLOUD_HIDDEN_ATTR + "]")) {
				if (cloudChatsExpanded) {
					node.removeAttribute(CLOUD_HIDDEN_ATTR);
					node.style.display = "";
				} else {
					node.style.display = "none";
				}
			}
		}

		/**
		 * The mode-sidebar pass (Push 3, rebuilt for Push 3.1). ON:
		 *  - the Confidential group keeps its lock icon and is expanded once per
		 *    entry; every other group is collapsed once per entry;
		 *  - a collapsed "Cloud chats" heading is injected before the first cloud
		 *    group's CONTAINER row; while collapsed every cloud group's CONTAINER
		 *    is hidden (display:none, hide-don't-remove) - the live sidebar
		 *    renders each group in its OWN container, which is why the Push 3
		 *    sibling walk left "Demo DSH for Monday" visible below the group;
		 *  - the top slots carry the full-width Upload transcript button and the
		 *    purple New chat button; nothing sits under Audits.
		 * OFF: everything the pass injected is removed and every hidden
		 * container is restored; the Confidential folder is hidden by the
		 * normal-mode pass (applyOffModeHides), not here.
		 */
		function applySidebarFilter(services, on) {
			if (typeof document === "undefined") return;
			const confRows = confidentialRows();
			for (const row of document.querySelectorAll("[" + CONF_ROW_ATTR + "]")) {
				if (!confRows.has(row)) row.removeAttribute(CONF_ROW_ATTR);
			}
			for (const row of confRows) {
				row.setAttribute(CONF_ROW_ATTR, "1");
				ensureLockIcon(row);
			}
			if (!on) {
				cloudChatsExpanded = false;
				modeSidebarReady = false;
				for (const node of document.querySelectorAll("[" + CLOUD_HIDDEN_ATTR + "]")) {
					node.removeAttribute(CLOUD_HIDDEN_ATTR);
					node.style.display = "";
				}
				for (const node of document.querySelectorAll("[" + CLOUD_HEADER_ATTR + "]")) {
					if (node.parentElement !== null) node.parentElement.removeChild(node);
				}
				for (const node of document.querySelectorAll("[" + CLOUD_ROW_ATTR + "]")) node.removeAttribute(CLOUD_ROW_ATTR);
				unmountTopControls();
				closeLeaveDialog();
				return;
			}
			// Mark every row: confidential rows keep the lock; cloud rows get the
			// black-text marker. The marker set is rebuilt every pass, so a
			// re-render can never leave a stale cloud colour behind.
			const allRows = [...document.querySelectorAll("[class*='projectRow']")];
			const cloudContainers = new Set();
			for (const row of allRows) {
				if (confRows.has(row)) continue;
				row.setAttribute(CLOUD_ROW_ATTR, "1");
				if (row.parentElement !== null) cloudContainers.add(row.parentElement);
			}
			for (const srow of document.querySelectorAll("[class*='sessionRow']")) {
				if (sessionScopeIsConfidential(srow)) continue;
				srow.setAttribute(CLOUD_ROW_ATTR, "1");
			}
			// ON: one-shot entry pass - expand Confidential, collapse the clouds.
			// Only marked ready when rows actually exist, so a pass that ran
			// while the sidebar was still rendering does not consume the shot.
			if (!modeSidebarReady) {
				const rows = allRows;
				if (rows.length > 0) {
					modeSidebarReady = true;
					for (const row of rows) {
						const expanded = row.getAttribute("aria-expanded") === "true";
						if (confRows.has(row)) {
							if (!expanded) row.click();
						} else if (expanded) {
							row.click();
						}
					}
				}
			}
			const firstCloud = allRows.find((row) => !confRows.has(row)) ?? null;
			if (firstCloud !== null && firstCloud.parentElement !== null) {
				const container = firstCloud.parentElement;
				let header = document.querySelector("[" + CLOUD_HEADER_ATTR + "]");
				if (header === null) {
					header = buildCloudHeader(services);
					container.insertBefore(header, firstCloud);
				} else if (header.parentElement !== container) {
					container.insertBefore(header, firstCloud);
				}
				header.setAttribute("aria-expanded", cloudChatsExpanded ? "true" : "false");
				if (cloudChatsExpanded) {
					// restore every hidden container and every hidden row in the header's own container
					for (const c of cloudContainers) {
						c.removeAttribute(CLOUD_HIDDEN_ATTR);
						c.style.display = "";
					}
					for (const child of [...container.children]) {
						child.removeAttribute(CLOUD_HIDDEN_ATTR);
						child.style.display = "";
					}
				} else {
					// hide every cloud group's container; the header's own container
					// keeps the header and hides its remaining rows.
					for (const c of cloudContainers) {
						if (c === container) continue;
						if (c.getAttribute(CLOUD_HIDDEN_ATTR) !== "1") c.setAttribute(CLOUD_HIDDEN_ATTR, "1");
						c.style.display = "none";
					}
					for (const child of [...container.children]) {
						if (child === header) continue;
						if (child.getAttribute(CLOUD_HIDDEN_ATTR) !== "1") child.setAttribute(CLOUD_HIDDEN_ATTR, "1");
						child.style.display = "none";
					}
				}
			}
			// Section headers that belong to the cloud side (anything that is not
			// the Audits/Projects heading) hide with the collapsed group and come
			// back with it; they sit outside the group containers, so the
			// container pass above cannot reach them.
			for (const section of document.querySelectorAll("[class*='sectionHeader']")) {
				const text = (section.textContent ?? "").trim();
				if (text === "" || text === "Audits" || text === "Projects") continue;
				if (cloudChatsExpanded) {
					if (section.getAttribute(CLOUD_HIDDEN_ATTR) === "1") {
						section.removeAttribute(CLOUD_HIDDEN_ATTR);
						section.style.display = "";
					}
				} else if (section.getAttribute(CLOUD_HIDDEN_ATTR) !== "1") {
					section.setAttribute(CLOUD_HIDDEN_ATTR, "1");
					section.style.display = "none";
				}
			}
			mountTopControls(services);
		}

		/**
		 * The normal-mode pass (Push 3.1): while the mode is OFF the
		 * Confidential folder and its chats are hidden everywhere the host can
		 * surface them, so the toggle is the only way in:
		 *  - the sidebar group row and its session rows (tree AND flat/rail,
		 *    matched by scope or by the confidential titles/ids from the list);
		 *  - sidebar search result rows whose workspace is the Confidential one;
		 *  - the composer @ menu's session candidates (by title/id from the
		 *    list, or by the confidential path in the location line);
		 *  - the Choose-project picker entries (exact title match).
		 * Everything hidden here is restored the moment the mode turns on.
		 * A session mention PASTED or typed as plain text cannot be blocked by
		 * any client plugin; the record documents that boundary.
		 */
		function applyOffModeHides(services, on) {
			if (typeof document === "undefined") return;
			const snapshot = services.sessions.list.getSnapshot();
			const confTitles = new Set();
			const confIds = new Set();
			for (const id of Object.keys(snapshot.byId ?? {})) {
				const entry = snapshot.byId[id];
				if (entry === undefined || entry === null) continue;
				if (!sameDirectory(entry.cwd ?? "", CONFIDENTIAL_CWD)) continue;
				if (typeof entry.title === "string" && entry.title !== "") confTitles.add(entry.title);
				confIds.add(id);
			}
			const confRows = confidentialRows();
			const setHidden = (node, hidden) => {
				if (hidden) {
					if (node.getAttribute(OFF_HIDE_ATTR) !== "1") node.setAttribute(OFF_HIDE_ATTR, "1");
					node.style.display = "none";
				} else if (node.getAttribute(OFF_HIDE_ATTR) === "1") {
					node.removeAttribute(OFF_HIDE_ATTR);
					node.style.display = "";
				}
			};
			for (const row of confRows) {
				// Push 3.2: hide the Confidential workspace GROUP (folder + chats)
				// as one unit, never row by row. The section holds the project row
				// and every session row, so hiding it hides the folder and its
				// chats together. The old per-row session filter used a
				// previousSibling scope walk that fails closed on the real DOM
				// (each session row is wrapped in its own container, so no
				// projectRow is ever a sibling), which hid EVERY chat in normal mode.
				const section = workspaceGroupSectionOf(row);
				if (section !== null) setHidden(section, !on);
				else setHidden(row, !on); // flat/rail fallback: hide just the folder row
			}
			// sidebar search results: the workspace line names the folder
			for (const row of document.querySelectorAll("[class*='searchResultRow']")) {
				const ws = row.querySelector("[class*='searchResultWorkspace']");
				const text = ws === null ? "" : String(ws.textContent ?? "").trim();
				const confidential = CONFIDENTIAL_TITLES.includes(text);
				if (confidential) setHidden(row, !on);
			}
			// the composer @ menu: match by confidential title/id, or by the path
			for (const opt of document.querySelectorAll("[data-trigger-menu] button[role='option']")) {
				const nameEl = opt.querySelector("[class*='itemName']");
				const descEl = opt.querySelector("[class*='itemDescription']");
				const name = nameEl === null ? "" : String(nameEl.textContent).trim();
				const desc = descEl === null ? "" : String(descEl.textContent).replace(/[\\/]+/g, " ").trim();
				const confidential = confTitles.has(name) || confIds.has(name) || /eloize confidential/i.test(desc);
				if (confidential) setHidden(opt, !on);
			}
			// the Choose-project picker: exact workspace-title entries
			for (const item of document.querySelectorAll("button[role='menuitem']")) {
				const text = String(item.textContent ?? "").trim();
				if (CONFIDENTIAL_TITLES.includes(text)) setHidden(item, !on);
			}
		}

		/**
		 * One capture-phase click guard over the whole document (Push 3), alive
		 * while the plugin runs. While the mode is ON it intercepts:
		 *  - the per-row "New session in Confidential" button -> the enter flow;
		 *  - clicks on CLOUD session rows -> the leave dialog (Stay/Leave).
		 * Confidential-group session rows and everything else pass through.
		 */
		function installClickGuard(services) {
			if (typeof document === "undefined" || document.body === null) return;
			document.body.addEventListener("click", (event) => {
				if (!modeIsOn(services)) return;
				const target = event.target;
				if (target === null || target === undefined) return;
				if (target.tagName === "BUTTON") {
					const label = String(target.getAttribute("aria-label") ?? "");
					if (label.indexOf("New session in Confidential") === 0) {
						event.preventDefault();
						event.stopPropagation();
						enterConfidential(services);
						return;
					}
				}
				let node = target;
				let row = null;
				while (node !== null && node !== undefined && node !== document.body) {
					const cls = typeof node.className === "string" ? node.className : "";
					if (cls.indexOf("sessionRow") >= 0) {
						row = node;
						break;
					}
					node = node.parentElement;
				}
				if (row === null) return;
				if (sessionScopeIsConfidential(row)) return;
				event.preventDefault();
				event.stopPropagation();
				const sessionId = cloudSessionIdOf(services, row);
				const titleEl = row.querySelector("[class*='_title']");
				showLeaveDialog(services, sessionId, titleEl !== null ? String(titleEl.textContent).trim() : "");
			}, true);
		}

		/**
		 * Logo-click routing (capture phase, both modes).
		 *
		 * The host's sidebar logo button (`.hHd-Xa_brand`) calls `startSession()`, which
		 * resolves to the CURRENT or most-recent workspace - and after a confidential
		 * chat that is the Confidential folder, so the logo would open the offline home
		 * even in normal mode. This guard intercepts that click and routes to the home
		 * for the CURRENT mode instead, never switching the mode:
		 *  - OFF: clear to the normal home (the empty hero state);
		 *  - ON:  reuse an open blank confidential session, else run the enter flow.
		 */
		function installLogoClickGuard(services) {
			if (typeof document === "undefined" || document.body === null) return;
			document.body.addEventListener("click", (event) => {
				let node = event.target;
				while (node !== null && node !== document.body) {
					if (node.tagName === "BUTTON" && typeof node.className === "string" && node.className.indexOf("_brand") >= 0) {
						event.preventDefault();
						event.stopPropagation();
						routeLogoClick(services);
						return;
					}
					node = node.parentElement;
				}
			}, true);
		}

		/** The first blank (empty-log) confidential session id, or null when none. */
		function findBlankConfidentialSession(services) {
			const workspace = confidentialWorkspace(services.workspaces.list.getSnapshot());
			if (workspace === undefined) return null;
			const sessions = services.sessions.list.getSnapshot();
			for (const id of workspace.sessionIds ?? []) {
				const entry = sessions.byId ? sessions.byId[id] : undefined;
				if (entry !== undefined && entry !== null && entry.blank === true) return id;
			}
			return null;
		}

		/** Route a logo click to the home for the current mode (never switches mode). */
		function routeLogoClick(services) {
			if (modeIsOn(services)) {
				const blank = findBlankConfidentialSession(services);
				if (blank !== null) {
					if (currentSessionId(services) !== blank) services.uiWorkspace.openSession(blank);
					return;
				}
				enterConfidential(services);
				return;
			}
			exitToHome(services);
		}
		//#endregion

		/** One mount pass over every confidential surface. */
		function applyPass(services) {
			if (typeof document === "undefined" || document.body === null) return;
			const on = modeIsOn(services);
			if (on) document.body.setAttribute(MODE_ATTR, "on");
			else document.body.removeAttribute(MODE_ATTR);
			hideShellArtifacts(on);
			hideFullAccessChip(on);
			filterCommandMenus(on);
			applySidebarFilter(services, on);
			applyOffModeHides(services, on);
			if (on) {
				mountBadgeRow(services);
				renameLegacyTitles(services);
				relabelNewSessionRow();
			}
		}
		//#endregion

		//#region stylesheet
		/**
		 * Confidential look: purple base with white text, a gentle gradient to a
		 * LIGHTER purple (never white). The colours are CSS variables so the polish
		 * step can reuse them. White text contrast at the lightest gradient stop
		 * (#6d4cf0) is ~5.3:1, above the 4.5:1 AA floor.
		 *
		 * The composer itself is untouched (stays white with dark text); only the
		 * surfaces this plugin owns are restyled.
		 */
		const CONFIDENTIAL_CSS = [
			// --- palette (CSS variables for the polish step) -----------------------
			"body[" + MODE_ATTR + "=\"on\"]{",
			"--eloize-confidential-base:#4b37e0;",
			"--eloize-confidential-deep:#3a28c4;",
			"--eloize-confidential-light:#6d4cf0;",
			"--eloize-confidential-text:#ffffff;",
			"--dsw-specific-sidebar-fill:linear-gradient(180deg,#3a28c4 0%,#4b37e0 46%,#6d4cf0 100%)!important;",
			// Nav-item washes DARKEN for the same 4.5:1 reason as the row hover.
			"--dsw-specific-sidebar-nav-item-active:rgba(20,14,46,0.22)!important;",
			"--dsw-specific-sidebar-nav-item-hover:rgba(20,14,46,0.16)!important;",
			"--dsw-specific-sidebar-nav-item-active-accent:#d9ccff!important;",
			"}",
			// --- sidebar: white text on the purple base -----------------------------
			// Push 3 rule: NO opacity-dimmed text - every pair must reach 4.5:1
			// (contrast-check.mjs computes these shipped pairs). De-emphasis is
			// size/weight, never alpha.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-']{color:#ffffff!important;}",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='_sectionLabel'],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='_sectionHeader']{color:#ffffff!important;font-size:12px!important;}",
			// The "Audits" section header row (label + search + filter + new-folder
			// buttons) hides entirely in the mode. Anchored on the row's STRUCTURE
			// (the section header), never the label text, so it holds whether the copy
			// plugin has renamed "Projects" to "Audits" or is switched off.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='_sectionHeader']{display:none!important;}",
			// Every sidebar button (Show N more, expanders, search/filter/new,
			// row actions, Settings) takes white text/icons.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] button{color:#ffffff!important;}",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='_iconButton']:hover{background:rgba(255,255,255,0.18)!important;}",
			// Timestamps: white, smaller - not faded.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='_time']{color:#ffffff!important;font-size:11px!important;line-height:16px!important;}",
			// Rows hover visibly; the wash DARKENS (a lightening wash would drop
			// white text below 4.5:1 on the gradient's lightest stop, which the
			// no-dimmed-text rule forbids). Background only - text stays white.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='projectRow']:hover,",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='sessionRow']:not([class*='_selected']):hover{background:rgba(20,14,46,0.18)!important;}",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='_iconButton']:hover{background:rgba(20,14,46,0.25)!important;}",
			// The active chat: a WHITE pill with purple text (Push 3), children
			// and row-action icons included. Beats the blanket white rules above
			// on specificity: more attribute selectors.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='sessionRow'][class*='_selected']{background:#ffffff!important;color:#4b37e0!important;}",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='sessionRow'][class*='_selected'] [class*='_title'],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='sessionRow'][class*='_selected'] [class*='_time'],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='sessionRow'][class*='_selected'] button{color:#4b37e0!important;}",
			// Confidential (non-cloud) session titles: the blanket white rule only
			// inherits, and the host's explicit title colour (INK) overrides it, so
			// an unselected confidential row stayed dark on the purple fill. Pin it
			// white here (the selected row above and cloud rows below keep theirs).
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='sessionRow']:not([" + CLOUD_ROW_ATTR + "]):not([class*='_selected']) [class*='_title']{color:#ffffff!important;}",
			// The bottom block: the live toggle row and the Settings trigger.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [class*='triggerLabel']{color:#ffffff!important;}",
			// The Eloize wordmark goes white in the mode. The branding plugin's
			// inline color reads var(--eloize-wordmark-color, <token>), so this
			// rule wins without touching the inline style.
			"body[" + MODE_ATTR + "=\"on\"] .eloize-wordmark{--eloize-wordmark-color:#ffffff;}",
			// --- Push 7: the Confidential header is bold WHITE, no pill/box (no red) --
			// Same weight/size as the Cloud chats heading; the white lock stays.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CONF_ROW_ATTR + "]{background:none!important;border-radius:0!important;box-shadow:none!important;}",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CONF_ROW_ATTR + "]:hover{background:rgba(20,14,46,0.18)!important;}",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CONF_ROW_ATTR + "],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CONF_ROW_ATTR + "] *{color:" + HEADING_TEXT + "!important;font-size:13px!important;font-weight:600!important;}",
			// --- Push 3.1: cloud rows go BLACK text (Aaron's spec) ---------------
			// The Cloud chats heading carries the black inline; these rules reach
			// every cloud folder/session row and its title, time, glyph and
			// buttons, beating the blanket white rules on specificity.
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CLOUD_ROW_ATTR + "]{color:" + CLOUD_TEXT + "!important;}",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CLOUD_ROW_ATTR + "] [class*='_title'],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CLOUD_ROW_ATTR + "] [class*='_time'],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CLOUD_ROW_ATTR + "] [class*='_folder'],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CLOUD_ROW_ATTR + "] [class*='_slot'],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CLOUD_ROW_ATTR + "] [class*='_chevron'],",
			"body[" + MODE_ATTR + "=\"on\"] [class*='hHd-'] [" + CLOUD_ROW_ATTR + "] button{color:" + CLOUD_TEXT + "!important;}",
			// --- the live toggle row's own text follows the sidebar surface ----------
			"." + LIVE_CLASS + " .eloize-conf-title{font-weight:700;color:#241c4a;font-size:13px;line-height:1.3;}",
			"." + LIVE_CLASS + " .eloize-conf-sub{color:rgba(60,48,110,0.78);font-size:13px;line-height:1.3;}",
			"body[" + MODE_ATTR + "=\"on\"] ." + LIVE_CLASS + " .eloize-conf-title{color:#ffffff;}",
			"body[" + MODE_ATTR + "=\"on\"] ." + LIVE_CLASS + " .eloize-conf-sub{color:#ffffff;font-size:12px;}",
			// Push 7: the Thinking/Fast pill is a real .eloize-btn (clickable,
			// visual only); its press/hover animation comes from the branding CSS.
			// --- model picker hidden in confidential sessions ------------------------
			// The picker's root class is stable in the shipped bundle; hiding it
			// EVERYWHERE would be this same rule without the body-attribute scope.
			"body[" + MODE_ATTR + "=\"on\"] ." + MODEL_PICKER_CLASS + "{display:none!important;}",
			// --- Push 7: hide the two "Confidential" dropdowns in mode ------------
			// The workspace-folder dropdown and the agent-preset seat both read
			// "Confidential"; the badge chip + Thinking stay on one row.
			"body[" + MODE_ATTR + "=\"on\"] ." + WORKSPACE_DROPDOWN_CLASS + "{display:none!important;}",
			"body[" + MODE_ATTR + "=\"on\"] ." + SEAT_DROPDOWN_CLASS + "{display:none!important;}",
			// --- chat canvas: subtle lavender wash, never fading to white -----------
			"body[" + MODE_ATTR + "=\"on\"] [class*='" + CHAT_ROOT_PREFIX + "_root']{",
			"background-image:linear-gradient(180deg,#e7deff 0%,#efeafc 48%,#e2d7ff 100%)!important;",
			"}",
			// --- composer control row (badge / thinking / upload) --------------------
			"[" + BADGE_ATTR + "]{display:none;}",
			"body[" + MODE_ATTR + "=\"on\"] [" + BADGE_ATTR + "]{display:flex;}",
			// Thinking switch, replaced by the .eloize-btn Thinking/Fast toggle in
			// Push 2. The old pill+knob markup is HIDDEN with CSS (the plan's rule),
			// whatever generation left it behind, while the new toggle carries its
			// own class so this rule can never catch it.
			".eloize-conf-think{display:none !important;}",
			// Upload pill busy/focus states (geometry and the brand look come from
			// the branding plugin's .eloize-btn; inline styles set layout only).
			".eloize-conf-upload:disabled{opacity:0.55;cursor:default;}",
			"@media (prefers-reduced-motion: reduce){",
			".eloize-conf-upload{transition:none;}",
			"}",
			// --- Push 7: the toggle ink spread --------------------------------------
			".eloize-ink{pointer-events:none;z-index:2147482000;overflow:hidden;",
			"background:linear-gradient(180deg,#3a28c4 0%,#4b37e0 46%,#6d4cf0 100%);}",
			".eloize-ink[data-ink=\"spread\"]{animation:eloize-ink-spread 450ms ease-out forwards;}",
			".eloize-ink[data-ink=\"retract\"]{animation:eloize-ink-retract 450ms ease-out forwards;}",
			"@keyframes eloize-ink-spread{from{clip-path:circle(0% at var(--ink-x,50%) var(--ink-y,50%));opacity:1;}to{clip-path:circle(160% at var(--ink-x,50%) var(--ink-y,50%));opacity:0.4;}}",
			"@keyframes eloize-ink-retract{from{clip-path:circle(160% at var(--ink-x,50%) var(--ink-y,50%));opacity:0.4;}to{clip-path:circle(0% at var(--ink-x,50%) var(--ink-y,50%));opacity:1;}}",
			"@media (prefers-reduced-motion: reduce){",
			".eloize-ink{animation:none!important;display:none!important;}",
			"}",
		].join("");

		/** Stable id for the sheet, generation-stamped so hot swaps retire stale rules. */
		const STYLE_ID = "@eloize/dsh-confidential/confidential." + GENERATION + ".css";
		const STYLE_PREFIX = "@eloize/dsh-confidential/confidential";

		/** Inject the confidential stylesheet once, retiring earlier generations first. */
		function installStyles() {
			if (typeof document === "undefined") return;
			for (const tag of document.querySelectorAll("style[data-plugin-css^='" + STYLE_PREFIX + "']")) {
				if (tag.dataset.pluginCss !== STYLE_ID && tag.parentElement !== null) tag.parentElement.removeChild(tag);
			}
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@eloize/dsh-confidential";
			tag.dataset.pluginCss = STYLE_ID;
			tag.textContent = CONFIDENTIAL_CSS;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region lifecycle
		/**
		 * Install the confidential surfaces for the lifetime of the plugin.
		 *
		 * A boot observer on document.body covers the window before the shell has
		 * mounted anything - the same ordering trap the shell and transcript
		 * plugins hit, handled the same way.
		 */
		function installConfidential(services) {
			if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
				return () => {};
			}
			installStyles();
			installClickGuard(services);
			installLogoClickGuard(services);
			let scheduled = false;
			const observer = new MutationObserver(() => {
				if (scheduled) return;
				scheduled = true;
				Promise.resolve().then(run);
			});
			function run() {
				scheduled = false;
				observer.disconnect();
				try {
					// Presence marker for the shell plugin's CSS: while THIS
					// plugin runs, the inert placeholder row stays hidden.
					if (document.body !== null) document.body.setAttribute(LIVE_ATTR, "1");
					applyPass(services);
				} finally {
					observer.disconnect();
					observer.observe(document.body, { childList: true, subtree: true });
				}
			}
			run();
			return () => {
				observer.disconnect();
				document.body?.removeAttribute(MODE_ATTR);
				document.body?.removeAttribute(LIVE_ATTR);
				for (const node of document.querySelectorAll("[" + HIDE_ATTR + "]")) {
					node.removeAttribute(HIDE_ATTR);
					node.style.display = node.getAttribute(DISPLAY_ATTR) ?? "";
					node.removeAttribute(DISPLAY_ATTR);
				}
				for (const node of document.querySelectorAll("[" + CONF_ROW_ATTR + "]")) {
					node.removeAttribute(CONF_ROW_ATTR);
					node.style.display = "";
				}
				for (const node of document.querySelectorAll("[" + BADGE_ATTR + "]")) {
					if (node.parentElement !== null) node.parentElement.removeChild(node);
				}
				cloudChatsExpanded = false;
				modeSidebarReady = false;
				for (const node of document.querySelectorAll("[" + CLOUD_HIDDEN_ATTR + "]")) {
					node.removeAttribute(CLOUD_HIDDEN_ATTR);
					node.style.display = "";
				}
				for (const node of document.querySelectorAll("[" + CLOUD_ROW_ATTR + "]")) node.removeAttribute(CLOUD_ROW_ATTR);
				for (const node of document.querySelectorAll("[" + OFF_HIDE_ATTR + "]")) {
					node.removeAttribute(OFF_HIDE_ATTR);
					node.style.display = "";
				}
				for (const node of document.querySelectorAll("[" + CLOUD_HEADER_ATTR + "],[" + TOP_UPLOAD_ATTR + "],[" + TOP_NEWCHAT_ATTR + "],[" + DIALOG_ATTR + "]")) {
					if (node.parentElement !== null) node.parentElement.removeChild(node);
				}
			};
		}
		//#endregion

		/**
		 * Required client services. `remote.<namespace>` entries are gated
		 * per namespace by the cordis inject trap (verified live: the enter
		 * flow failed on "cannot get property \"remote.agentPresets\" without
		 * inject"); both namespaces are declared by their owning bundles in
		 * the shipped build, so the live rows they provide are injectable.
		 */
		const inject = ["slots", "uiWorkspace", "workspaces", "sessions", "remote", "remote.agentPresets", "remote.session", "sidebarRight"];

		/**
		 * Register the Eloize confidential contributions.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			const services = {
				sessions: ctx.sessions,
				remote: ctx.remote,
				workspaces: ctx.workspaces,
				uiWorkspace: ctx.uiWorkspace,
				sidebarRight: ctx.sidebarRight,
				layout: ctx.get("layout") ?? undefined,
				thinkingRemote: () => thinkingRemote(ctx),
			};

			// The thinking namespace rides a hand-built client contribution.
			mountThinkingRemote(ctx);

			// Read-only debug handle, runnable from the browser console.
			// `buildThinkToggle()` returns a fresh Thinking/Fast toggle (used by the
			// client smoke to exercise aria-pressed, persistence and the default).
			// `buildTopControls()` and `buildBadgeRow()` expose the Push 3.1
			// sidebar/composer surfaces to the smoke.
			if (typeof window !== "undefined") {
				window.__eloizeConfidential = Object.freeze({
					state: () => debugState(services),
					buildThinkToggle: () => buildThinkToggle(services),
					buildTopControls: () => ({ upload: buildSidebarUploadButton(services), newChat: buildSidebarNewChatButton(services) }),
					buildBadgeRow: () => buildBadgeRow(services),
				});
			}

			ctx.effect(() => installConfidential(services));

			// Replace the shell plugin's inert placeholder row with the live toggle.
			// `sidebar.footer.action` is additive, so this composes with the host footer.
			ctx.slots.inject("sidebar.footer.action", function* () {
				yield ctx.slots.register(
					{ name: "sidebar.footer.action", id: "eloize-confidential-live", order: 11, label: ROW_TITLE },
					(props) => React.createElement(ConfidentialRowLive, { ...props, services }),
				);
			});
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});
