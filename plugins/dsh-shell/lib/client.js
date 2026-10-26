window.__ModuleLoader__.load({
	id: "@eloize/dsh-shell",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		//#region copy and anchors
		/** Primary audit CTA label, matching the design board. */
		const LABEL_CREATE_AUDIT = "Create audit";
		/** Small icon-button label. */
		const LABEL_NEW_CHAT = "New chat";
		/** Upload card copy, from the design board. */
		const UPLOAD_TITLE = "Upload transcript";
		/**
		 * Card body copy, rendered by `buildUploadCard` on the home card
		 * (Push 3.1 restored it after the Push 2 pill).
		 */
		/** First body sentence, per Aaron's wording. */
		const UPLOAD_BODY = "Converts to .md and strips confidential data on the local model.";
		/** Second body sentence, rendered BOLD (Aaron's call). */
		const UPLOAD_BODY_BOLD = "Ensures no confidential or sensitive data makes it to the cloud.";
		// Step 1 narrowed the picker to .txt/.md, so the card's format line follows.
		const UPLOAD_EXTS = ".txt or .md";
		/**
		 * Confidential-mode copy, in both toggle states.
		 *
		 * Aaron's wording, supplied after the design board: the OFF state names both model
		 * routes ("cloud + local models") and the ON state narrows to the local one
		 * ("local models only"). This deliberately supersedes the board's
		 * "Off . cloud model" / "On . local model", so do not "restore" it from the board.
		 */
		const CONFIDENTIAL_TITLE = "Confidential mode";
		const CONFIDENTIAL_SUB_OFF = "Off \u00b7 cloud + local models";
		const CONFIDENTIAL_SUB_ON = "On \u00b7 local models only";
		/** Id pairing the toggle's checkbox with its label, as the supplied markup requires. */
		const CONFIDENTIAL_INPUT_ID = "eloize-confidential-toggle";
		/** The host's own new-session control, which the action row replaces. */
		const HOST_NEW_SESSION_LABEL = "New Session";

		/**
		 * Generation stamp for every marker and style tag this plugin owns.
		 *
		 * BUMP THIS whenever the injected markup or the stylesheet changes shape. The client
		 * bundle is hot-swapped without a page reload, and a swap does NOT clean up after the
		 * previous bundle: its `<style>` element and its injected nodes both stay in the
		 * document. With a fixed id and fixed markers the new bundle would see "already
		 * installed", keep the STALE markup, and leave the OLD stylesheet winning on equal
		 * specificity - which is exactly how a fixed layout kept rendering broken. Versioning
		 * both makes a swapped bundle adopt the new markup and retire the old sheet.
		 *
		 * 5 = fix pass: Upload card hover/press/focus/busy states added, and the dock
		 * kit's Split button in the right-hand panel hidden.
		 * 6 = Upload card colour inversion: resting = purple card + WHITE upload icon;
		 * hover inverts to a white card with the purple icon and dark text.
		 * 7 = Aaron's second take on the card: the SQUARE around the icon inverts
		 * (white square + card-coloured icon on the purple card; purple square +
		 * white icon on the white card), and the whole colour flip fades in over
		 * ~500ms through a white overlay instead of snapping.
		 * 8 = Upload card subtext reworded; the final sentence is a separate BOLD
		 * span (cloud-safety line).
		 * 9 = the Confidential placeholder row is hidden by CSS while the live
		 * confidential plugin runs (body[data-eloize-confidential-live]
		 * contract - Step 3 v3 Push 1).
		 * 10 = Push 2: the Upload transcript CARD becomes a .eloize-btn pill
		 * (the brand look ships in the branding plugin; without branding the
		 * button keeps the host look). The card's old hover-inversion CSS and
		 * tile markup are gone. SUPERSEDED by 11.
		 * 11 = Push 3.1: the big Upload transcript card is BACK on the home
		 * (the pre-Push-2 place, size, gradient and hover inversion, restored
		 * from the engine-verified card-invert-preview spec), and the pill is
		 * gone. The card is a real BUTTON carrying .eloize-upload-control, so
		 * the transcript plugin owns its busy state (spinner + "Cleaning\u2026",
		 * aria-busy, disabled) exactly like the pill's, and its hover/press is
		 * gated off while busy via the stable data-eloize-busy flag. Chats
		 * never carried this surface (the hero only renders on the home), and
		 * the in-mode composer pill is retired by Push 3.1, so this card is
		 * the only shell-owned upload surface again.
		 * 12 = Push 3.2: the Upload card's hover text (title/description/ext)
		 * gains !important so it beats the card's inline white styles (it was
		 * white-on-white on the white hover), and turns brand purple (#4b37e0);
		 * the fallback sidebar buttons' icon/label gap is unified to 6px.
		 */
		const GENERATION = "12";

		/**
		 * Attribute markers for everything this plugin puts in the DOM.
		 *
		 * Markers rather than class names: the host's classes are hashed per build, and
		 * our own are looked up by attribute so a re-render cannot duplicate them.
		 */
		const ROW_ATTR = "data-eloize-actions-" + GENERATION;
		/** Marker for the fallback chat button, injected immediately BEFORE the host control. */
		const CHAT_ATTR = "data-eloize-new-chat-" + GENERATION;
		const CARD_ATTR = "data-eloize-upload-" + GENERATION;
		const HIDDEN_ATTR = "data-eloize-hidden-" + GENERATION;
		const CHATS_ATTR = "data-eloize-chats-" + GENERATION;
		/** Every marker this plugin has ever used, so an older bundle's nodes can be retired. */
		const ALL_MARKER_PREFIXES = ["data-eloize-actions", "data-eloize-upload", "data-eloize-hidden", "data-eloize-chats", "data-eloize-new-chat"];

		/**
		 * The one folder every audit-less chat runs in, and the labels its row may carry.
		 *
		 * This group's heading is "Chats" once the copy plugin has renamed `group.ungrouped`;
		 * the chats WORKSPACE is titled "Chats" outright. Both are the same surface, so both
		 * labels are accepted when marking the row for colour.
		 */
		const CHATS_LABELS = ["Chats", "Ungrouped"];

		/**
		 * Directory that hosts every chat with no audit of its own.
		 *
		 * This folder is registered as a real Workspace, and that registration is NOT
		 * cosmetic. The host only unlocks the composer for a session that belongs to a
		 * Workspace: `dsh-client-ui-conversation` derives `chipTitle` from Workspace
		 * membership (`workspaces.items.find(w => w.sessionIds.includes(sessionId))`) and
		 * marks the composer inert when it is missing, showing "Choose a project to start".
		 * Its `cwd` fallback applies ONLY while the Workspace list is still loading, so a
		 * session created with a bare `cwd` and no `workspaceId` is promptable for a moment
		 * and then goes inert - which is exactly the reported bug. Registering this folder
		 * makes chats ordinary Workspace sessions, so the composer, the folder chip and the
		 * folder dropdown all behave the way they do for an audit.
		 *
		 * Registration is non-destructive: it adopts an existing path and creates nothing on
		 * disk. Edit this single constant to relocate chats.
		 */
		// EDIT ME: the folder that holds ungrouped chats.
		const CHATS_CWD = "C:\\path\\to\\Eloize Chats";
		/** Title of the chats Workspace; the sidebar row and the composer chip both read it. */
		const CHATS_TITLE = "Chats";

		/** The hero's headline wrapper; stable substring of the host's hashed class. */
		const HERO_CLASS = '[class*="headline"]';
		/** The composer's text field, whichever kind the host renders. */
		const FIELD_SELECTOR = "textarea, input, [contenteditable='true']";
		//#endregion

		//#region dom helpers
		/** True while the node is still rendered. */
		function isAttached(node) {
			if (node === null || node === undefined) return false;
			if (typeof document === "undefined") return false;
			return document.contains(node);
		}

		/** Our own previously injected node, if it is still live. */
		function findInjected(attr) {
			if (typeof document === "undefined") return null;
			return document.querySelector("[" + attr + "]");
		}

		/**
		 * Find every element whose trimmed text equals `text`, in document order.
		 *
		 * Scoped and exact-matched so it cannot land on unrelated UI: the same discipline
		 * the copy plugin uses. Only elements are considered, never `document.body`.
		 * All matches rather than just the first: a session row may legitimately carry the
		 * same label as the group, and the caller needs the one that is the group row.
		 * @param root - subtree to search.
		 * @param text - exact trimmed text to match.
		 * @returns the matching elements, in document order (possibly empty).
		 */
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


		/** Build an element with attributes and children in one call. */
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

		/**
		 * Apply a style object as inline styles.
		 *
		 * Inline rather than a rule because a hot-swapped bundle leaves the previous bundle's
		 * stylesheet in the document, where an older equal-specificity rule wins on source
		 * order, which is why every injected element sets its geometry inline.
		 * @param node - element to style.
		 * @param style - camelCase style properties.
		 * @returns the same node.
		 */
		function applyInlineStyle(node, style) {
			for (const key of Object.keys(style)) node.style[key] = style[key];
			return node;
		}

		/** Build an inline SVG from a path spec, matching the design board's icons. */
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
		//#endregion

		/**
		 * Inline geometry and resting colours for the Upload transcript CARD
		 * (Push 3.1: the pre-Push-2 card restored). Every value is the exact
		 * engine-verified pre-Push-2 spec (the sibling `_verify` folder's
		 * card-invert-preview.html):
		 * purple 135deg gradient card, 1px #4b37e0 border, 16px radius, 20px
		 * padding, centred at max-width 520px under the composer. Inline so a
		 * hot-swapped stale stylesheet can never restyle it away; the
		 * stylesheet carries only what inline styles cannot express (the
		 * hover inversion, :active, :disabled, focus and reduced motion).
		 *
		 * The card carries .eloize-upload-control: the transcript plugin owns
		 * the busy state (spinner + "Cleaning\u2026", aria-busy, disabled) and
		 * the click wiring, exactly as it did for the pill.
		 */
		const CARD_STYLE = {
			display: "flex",
			flexDirection: "column",
			gap: "10px",
			textAlign: "left",
			boxSizing: "border-box",
			alignSelf: "center",
			width: "100%",
			maxWidth: "520px",
			margin: "14px auto 0",
			background: "linear-gradient(135deg, #6d4cf0 0%, #9b7bf7 100%)",
			border: "1px solid #4b37e0",
			borderRadius: "16px",
			padding: "20px",
			cursor: "pointer",
			position: "relative",
			color: "#ffffff",
			font: "inherit",
			transition: "transform 150ms ease-out, box-shadow 150ms ease-out, border-color 150ms ease-out",
		};
		/** The card's white icon tile (resting: white square, icon in the card's purple). */
		const CARD_TILE_STYLE = {
			width: "38px",
			height: "38px",
			borderRadius: "10px",
			background: "#ffffff",
			color: "#4b37e0",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			flex: "0 0 auto",
			transition: "color 500ms ease, background-color 500ms ease",
		};
		/** Card title, body and extension line (Aaron's copy from the design board). */
		const CARD_TITLE_STYLE = {
			fontFamily: "'Sora',ui-sans-serif,system-ui,sans-serif",
			fontWeight: "600",
			fontSize: "17px",
			color: "#ffffff",
			transition: "color 500ms ease",
		};
		const CARD_BODY_STYLE = {
			fontSize: "13.5px",
			lineHeight: "1.5",
			color: "rgba(255,255,255,0.86)",
			transition: "color 500ms ease",
		};
		const CARD_EXT_STYLE = {
			fontSize: "13px",
			fontWeight: "700",
			color: "#ffcc70",
			transition: "color 500ms ease",
		};

		/**
		 * Stylesheet for what inline styles cannot express: hover, active, disabled
		 * and focus pseudo-states, all scoped to this plugin's own markers. The
		 * card's hover inversion is the pre-Push-2 treatment, gated off while a
		 * transcript is processing (:not([data-eloize-busy]) and :not(:disabled)).
		 */
		const SHELL_CSS = [
			// The Audit category heading must sit on its own line under the row.
			"[class*='_regionArea']{flex-direction:column !important;}",
			// The Chats group is a DIFFERENT colour from the Audits group, on purpose: the
			// Audits folder glyph and heading are the host's indigo, so Chats takes the
			// brighter violet from the brand's extension-list accent to stay clearly apart.
			//
			// The marker now sits on the GROUP ROW, because the folder glyph is a SIBLING of
			// the title wrapper and not a descendant of it: marking the wrapper (the first
			// attempt) coloured the "Chats" text and left the glyph on the host's tertiary
			// colour. The rule is scoped to the glyph, the title and the hover chevron rather
			// than to the whole row, so the row's own ellipsis/plus buttons keep their host
			// styling. !important is required only because the host sets an explicit colour on
			// those two spans (`._slot`, `._projectRow`); the glyph paints `fill="currentColor"`,
			// so colouring the span colours the SVG.
			"[" + CHATS_ATTR + "] [class*='_folder'], [" + CHATS_ATTR + "] [class*='_folder'] *,",
			"[" + CHATS_ATTR + "] [class*='_title'],",
			"[" + CHATS_ATTR + "] [class*='_chevron']{color:#6d4cf0 !important;}",
			// Fix pass D: the dock kit's Split control in the right-hand panel is a
			// core DSH feature (dsh-client-ui-sidebar-right over the shipped dock kit);
			// this demo hides it from a plugin, so 3080 is unaffected.
			"button[data-dockkit-split-button]{display:none !important;}",
			// --- the Upload card's hover inversion (Push 3.1: pre-Push-2 look) ----
			// All card pseudo-state rules are scoped to the card marker, and every
			// interactive one is gated off while a run is in flight or the native
			// button is disabled, so a busy card never lifts or inverts.
			"[" + CARD_ATTR + "]{position:relative;}",
			"[" + CARD_ATTR + "] .eloize-tile, [" + CARD_ATTR + "] .eloize-tiletitle,",
			"[" + CARD_ATTR + "] .eloize-tilebody, [" + CARD_ATTR + "] .eloize-tileext{position:relative;z-index:1;}",
			"[" + CARD_ATTR + "]::after{content:'';position:absolute;inset:0;border-radius:inherit;",
			"background:#ffffff;opacity:0;pointer-events:none;transition:opacity 500ms ease;}",
			"[" + CARD_ATTR + "]:hover:not([data-eloize-busy]):not(:disabled)::after{opacity:1;}",
			"[" + CARD_ATTR + "]:hover:not([data-eloize-busy]):not(:disabled){",
			"transform:translateY(-2px);box-shadow:0 12px 28px rgba(109,76,240,0.32);border-color:#4b37e0;}",
			"[" + CARD_ATTR + "]:hover:not([data-eloize-busy]):not(:disabled) .eloize-tile{background:#4b37e0 !important;color:#ffffff !important;}",
			"[" + CARD_ATTR + "]:hover:not([data-eloize-busy]):not(:disabled) .eloize-tiletitle{color:#4b37e0 !important;}",
			"[" + CARD_ATTR + "]:hover:not([data-eloize-busy]):not(:disabled) .eloize-tilebody{color:#4b37e0 !important;}",
			"[" + CARD_ATTR + "]:hover:not([data-eloize-busy]):not(:disabled) .eloize-tilebody .eloize-tilebody-bold{color:#4b37e0 !important;}",
			"[" + CARD_ATTR + "]:hover:not([data-eloize-busy]):not(:disabled) .eloize-tileext{color:#4b37e0 !important;}",
			"[" + CARD_ATTR + "]:active:not([data-eloize-busy]):not(:disabled){transform:translateY(0) scale(0.99);}",
			"[" + CARD_ATTR + "]:focus-visible{outline:2px solid #4b37e0;outline-offset:2px;}",
			"[" + CARD_ATTR + "][data-eloize-busy], [" + CARD_ATTR + "]:disabled{cursor:default;}",
			"@media (prefers-reduced-motion: reduce){",
			"[" + CARD_ATTR + "], [" + CARD_ATTR + "]::after, [" + CARD_ATTR + "] .eloize-tile,",
			"[" + CARD_ATTR + "] .eloize-tiletitle, [" + CARD_ATTR + "] .eloize-tilebody,",
			"[" + CARD_ATTR + "] .eloize-tileext{transition:none;}",
			"[" + CARD_ATTR + "]:hover:not([data-eloize-busy]):not(:disabled){transform:none;}",
			"[" + CARD_ATTR + "]:active:not([data-eloize-busy]):not(:disabled){transform:none;}",
			"}",
		].join("");

		/**
		 * Stylesheet tag id, stamped with the generation.
		 *
		 * Versioning matters because the bundle is hot-swapped with no page reload and the
		 * previous bundle's `<style>` element is NOT removed. With a fixed id the new sheet
		 * would be skipped as "already installed" and the OLD rules would keep winning on
		 * equal specificity - which is how a fixed layout kept rendering broken.
		 */
		const STYLE_ID = "@eloize/dsh-shell/shell." + GENERATION + ".css";
		/** Prefix shared by every generation of this plugin's stylesheet tag. */
		const STYLE_PREFIX = "@eloize/dsh-shell/shell";

		/** Inject the shell stylesheet, retiring any earlier generation's sheet first. */
		function installStyles() {
			if (typeof document === "undefined") return;
			retireStaleStyles();
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@eloize/dsh-shell";
			tag.dataset.pluginCss = STYLE_ID;
			tag.textContent = SHELL_CSS;
			document.head.appendChild(tag);
		}

		/** Remove stylesheet tags left behind by an earlier generation of this plugin. */
		function retireStaleStyles() {
			if (typeof document === "undefined") return;
			// One prefix sweep covers every earlier generation, including the
			// unversioned original ("shell.css") and any number the list above
			// never enumerated, so no per-generation id list is needed here.
			for (const tag of document.querySelectorAll("style[data-plugin-css^='" + STYLE_PREFIX + "']")) {
				const id = tag.dataset.pluginCss;
				if (id !== STYLE_ID && tag.parentElement !== null) tag.parentElement.removeChild(tag);
			}
		}

		/**
		 * Remove nodes injected by an earlier generation of this plugin.
		 *
		 * The previous bundle's row and card are still in the document after a hot swap, and
		 * their markers differ only by generation suffix. Without this the new bundle would
		 * see "already injected", keep the STALE markup, and its own corrected stylesheet
		 * would target an attribute the old node does not carry.
		 *
		 * The bound is DERIVED from GENERATION, never a literal: bumping GENERATION is what
		 * retires the generation being replaced, and a hard-coded bound silently stopped
		 * doing so the moment the two drifted apart.
		 */
		function retireStaleNodes() {
			if (typeof document === "undefined") return;
			for (let gen = 1; gen < Number(GENERATION); gen++) {
				for (const prefix of ALL_MARKER_PREFIXES) {
					const attr = prefix + "-" + gen;
					for (const node of document.querySelectorAll("[" + attr + "]")) {
						// A hidden marker sits on a HOST element, so restore it rather than remove it.
						if (prefix === "data-eloize-hidden") node.style.display = "";
						else if (node.parentElement !== null) node.parentElement.removeChild(node);
						node.removeAttribute(attr);
					}
				}
			}
			// The very first generation shipped unversioned markers.
			for (const prefix of ALL_MARKER_PREFIXES) {
				for (const node of document.querySelectorAll("[" + prefix + "]")) {
					if (prefix === "data-eloize-hidden") node.style.display = "";
					else if (node.parentElement !== null) node.parentElement.removeChild(node);
					node.removeAttribute(prefix);
				}
			}
		}
		//#endregion

		//#region actions
		/**
		 * Create an audit from a chosen directory, then open a session in it.
		 *
		 * Uses the host's own navigation path end to end: its OS directory picker, its
		 * workspace creation, and its session start. Nothing new is introduced on the
		 * host side, which is why this needs no backend support.
		 * @param services - injected host services.
		 * @returns a promise settling when the flow finishes or is cancelled.
		 */
		function createAudit(services) {
			return Promise.resolve()
				.then(() =>
					services.uiWorkspace.pickDirectory().catch((reason) => {
						// Cancelling the OS dialog rejects the picker. That is a normal outcome,
						// not a failure, so it resolves to "no path chosen" without a warning.
						if (isCancellation(reason)) return null;
						throw reason;
					}),
				)
				.then((path) => {
					if (path === undefined || path === null) return null;
					return services.workspaces.create({ path });
				})
				.then((workspace) => {
					if (workspace === null) return;
					services.uiWorkspace.startSession(workspace.workspaceId);
				});
		}

		/**
		 * True when a picker rejection is a user cancellation rather than a fault.
		 *
		 * The picker surfaces a structured failure; a cancelled dialog carries no message
		 * distinguishing it, so both a cancelled code and the absence of a message count.
		 * @param reason - the rejection reason.
		 * @returns whether this looks like a cancellation.
		 */
		function isCancellation(reason) {
			if (reason === null || reason === undefined) return true;
			const message = typeof reason === "string" ? reason : String(reason.message ?? "");
			const code = reason.code ?? (reason.error !== undefined ? reason.error.code : undefined);
			if (code === "cancelled" || code === "canceled" || code === "aborted") return true;
			return /cancel/i.test(message);
		}

		/**
		 * True when two host paths name the same directory.
		 *
		 * Both separators fold to "/" and the trailing separator is dropped, so a path that
		 * comes back from the Host with forward slashes (or a trailing one) cannot register
		 * the same folder twice. Windows paths are case-insensitive, hence the lowercase.
		 */
		function sameDirectory(left, right) {
			const normalise = (value) => String(value).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
			return normalise(left) === normalise(right);
		}

		/** The folder name the Host derives as a default Workspace title for the chats path. */
		function chatsFolderName() {
			const segments = String(CHATS_CWD).replace(/\\/g, "/").replace(/\/+$/, "").split("/");
			return segments[segments.length - 1];
		}

		/**
		 * Find the Workspace registered for the chats folder, registering it on first use.
		 *
		 * `workspaces.create` is documented as idempotent ("created or idempotently
		 * resolved"), but the lookup runs first so a differently-cased or differently-separated
		 * path on the Host can never register the same folder twice.
		 *
		 * TITLE AND ORDER ARE THEN REPAIRED IN TWO CASES, and only these two:
		 *  - this plugin has just registered the folder; or
		 *  - the Host's own bootstrap registered it first, because the folder already holds
		 *    session history, titled straight from the folder name (`defaultWorkspaceTitle`
		 *    is `basename`). That happens on any instance restart before the first click here.
		 * Both are untouched Host state, so both are safe to correct. A title the user chose
		 * is never overwritten and a row the user dragged is never moved, because the repair
		 * is keyed strictly on the auto-derived default title.
		 * @param services - injected host services.
		 * @returns the chats Workspace id.
		 */
		async function ensureChatsWorkspace(services) {
			const existing = services.workspaces.list
				.getSnapshot()
				.items.find((workspace) => sameDirectory(workspace.path, CHATS_CWD));
			const workspace = existing ?? (await services.workspaces.create({ path: CHATS_CWD }));

			if (existing === undefined || existing.title === chatsFolderName()) {
				// Cosmetics, best-effort. Either may fail without making the chat unusable, so a
				// failure is logged and stepped over rather than rejecting the whole flow.
				try {
					await services.workspaces.rename(workspace.workspaceId, CHATS_TITLE);
				} catch (reason) {
					console.warn("@eloize/dsh-shell: chats rename failed:", reason);
				}
				try {
					// No anchor appends, which is what puts the chats row after the audit folders.
					await services.workspaces.insertBefore(workspace.workspaceId);
				} catch (reason) {
					console.warn("@eloize/dsh-shell: chats reorder failed:", reason);
				}
			}
			return workspace.workspaceId;
		}

		/**
		 * Start a chat in the dedicated chats folder.
		 *
		 * The folder is a registered Workspace (see CHATS_CWD), so this goes through the
		 * host's OWN "new session in this Workspace" path: `uiWorkspace.startSession`
		 * reuses a blank chat already open there, otherwise creates the session with that
		 * `workspaceId` and opens it. Because the session belongs to a Workspace, the
		 * composer is live on arrival and the folder dropdown still lists every project plus
		 * its "Add project..." entry, so the user can switch to an audit or a new folder.
		 *
		 * If the folder is missing or unreadable the registration is rejected; rather than
		 * leaving a dead session behind, this falls back to the host's own project picker so
		 * the user always ends up somewhere they can type.
		 * @param services - injected host services.
		 * @returns a promise settling when a chat is open or the fallback has run.
		 */
		function createChat(services) {
			return ensureChatsWorkspace(services)
				.then((workspaceId) => {
					services.uiWorkspace.startSession(workspaceId);
				})
				.catch((reason) => {
					console.warn("@eloize/dsh-shell: new chat failed:", reason);
					services.uiWorkspace.startSession();
				});
		}

		/**
		 * Build the Upload transcript CARD (Push 3.1: the pre-Push-2 card, back
		 * on the home). A real BUTTON carrying .eloize-upload-control, so the
		 * transcript plugin wires the click and owns the busy state (spinner +
		 * "Cleaning\u2026", aria-busy, disabled) exactly as it did for the pill.
		 * The visible copy is the design board's card body, kept in the
		 * constants above.
		 * @returns the card element.
		 */
		function buildUploadCard() {
			const tile = applyInlineStyle(el("span", { class: "eloize-tile" }, [
				svg(
					{ width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" },
					["M12 16V4M7 9l5-5 5 5M5 20h14"],
				),
			]), CARD_TILE_STYLE);
			const title = applyInlineStyle(el("span", { class: "eloize-tiletitle", text: UPLOAD_TITLE }), CARD_TITLE_STYLE);
			const body = applyInlineStyle(el("span", { class: "eloize-tilebody" }, [
				document.createTextNode(UPLOAD_BODY + " "),
				applyInlineStyle(el("span", { class: "eloize-tilebody-bold", text: UPLOAD_BODY_BOLD }), { fontWeight: "700" }),
			]), CARD_BODY_STYLE);
			const ext = applyInlineStyle(el("span", { class: "eloize-tileext", text: UPLOAD_EXTS }), CARD_EXT_STYLE);
			const card = el("button", { type: "button", [CARD_ATTR]: "1", class: "eloize-upload-control", title: UPLOAD_TITLE, "aria-label": UPLOAD_TITLE }, [tile, title, body, ext]);
			return applyInlineStyle(card, CARD_STYLE);
		}
		//#endregion

		//#region mounting
		/**
		 * Mount the Upload transcript card under the composer (Push 3.1: the
		 * pre-Push-2 placement).
		 *
		 * The card belongs BELOW the chatbox, not inside the hero heading block. The
		 * composer stack is a flex COLUMN holding the hero, then the workspace row, then the
		 * input bar, so the card is inserted immediately after the bar's own root element -
		 * which puts it beneath the input while staying inside the same centred column.
		 * This is the home surface: the hero only renders on the home empty state, so
		 * chats never carry this card (the pre-Push-2 behaviour, restored).
		 *
		 * Gated on at least one workspace existing: the hero also renders for a brand-new
		 * workspace-less session, and this card belongs to a project/audit home.
		 * @param services - injected host services.
		 */
		function mountUploadCard(services) {
			if (typeof document === "undefined") return;
			if (isAttached(findInjected(CARD_ATTR))) return;
			const headline = document.querySelector(HERO_CLASS);
			if (headline === null) return;
			// The hero's outermost block is the composer column.
			const composer = climbToComposer(headline);
			if (composer === null) return;
			const bar = findComposerBar(composer);
			if (bar === null) return;
			try {
				const snapshot = services.workspaces.list.getSnapshot();
				if (snapshot === undefined || snapshot.items.length === 0) return;
			} catch (error) {
				return;
			}
			composer.insertBefore(buildUploadCard(), bar.nextSibling);
		}

		/**
		 * From the hero headline, climb to the composer column that owns the input bar.
		 *
		 * Identified structurally: it is the nearest ancestor that also contains a text
		 * input or a contenteditable field.
		 * @param headline - the hero headline element.
		 * @returns the composer column, or null.
		 */
		function climbToComposer(headline) {
			let el = headline;
			for (let i = 0; i < 8 && el !== null && el !== document.body; i++) {
				if (el.querySelector(FIELD_SELECTOR) !== null) return el;
				el = el.parentElement;
			}
			return null;
		}

		/**
		 * Find the composer bar's root element inside the composer column.
		 *
		 * That is the element containing the text field itself, which is where the input
		 * UI lives; the card goes directly after it.
		 * @param composer - the composer column.
		 * @returns the bar root, or null.
		 */
		function findComposerBar(composer) {
			const field = composer.querySelector(FIELD_SELECTOR);
			if (field === null) return null;
			let el = field;
			while (el.parentElement !== null && el.parentElement !== composer) el = el.parentElement;
			return el.parentElement === composer ? el : null;
		}

		/**
		 * Find the host's own "New Session" control.
		 *
		 * Matched on its exact label so no other control can be caught. It is hidden rather
		 * than removed: React owns the node and keeps it in the tree, so hiding is what
		 * survives a re-render, and the fallback buttons are inserted as its siblings.
		 * @returns the host button, or null.
		 */
		function findHostNewSession() {
			if (typeof document === "undefined") return null;
			for (const button of document.querySelectorAll("button")) {
				const text = button.textContent;
				if (text === null || text.trim() !== HOST_NEW_SESSION_LABEL) continue;
				return button;
			}
			return null;
		}

		/** Hide the host's own "New Session" control, which the fallback pair replaces. */
		function hideHostNewSession() {
			const button = findHostNewSession();
			if (button === null) return;
			button.setAttribute(HIDDEN_ATTR, "1");
			button.style.display = "none";
		}

		/**
		 * Remove the workspace browser's bottom fade.
		 *
		 * That element paints `linear-gradient(transparent, var(--dsw-specific-sidebar-fill))`.
		 * The sidebar token is now a multi-layer gradient, which is not a valid colour for
		 * that expression, so the fade would render as a dark band over the wash. Removing
		 * it is the fix rather than reverting the sidebar treatment.
		 */
		function dropSidebarFade() {
			if (typeof document === "undefined") return;
			const stack = document.querySelectorAll("div");
			for (const node of stack) {
				if (node.getAttribute(HIDDEN_ATTR) === "1") continue;
				const style = getComputedStyle(node);
				if (style.position !== "absolute" || style.pointerEvents !== "none") continue;
				if (style.backgroundImage.indexOf("gradient") < 0) continue;
				const height = node.offsetHeight;
				if (height < 8 || height > 48) continue;
				node.setAttribute(HIDDEN_ATTR, "1");
				node.style.display = "none";
			}
		}

		/**
		 * The group ROW that owns `label`, found by the host's stable class suffix.
		 *
		 * The row is `div._projectRow`, and it is the element that also holds the folder
		 * glyph and the hover chevron. Walking up to it rather than stopping at the label's
		 * parent is the whole fix: `label.parentElement` is the TITLE's wrapper, and the glyph
		 * is a sibling of that wrapper, so a marker placed there can never reach it.
		 * @param label - the element carrying the group's label text.
		 * @returns the row element, or null when the label is not inside a group row.
		 */
		function chatsGroupRow(label) {
			let node = label;
			while (node !== null && node !== undefined && node !== document.body) {
				const cls = node.className;
				if (typeof cls === "string" && cls.indexOf("projectRow") >= 0) return node;
				node = node.parentElement;
			}
			return null;
		}

		/**
		 * Mark the Chats group so CSS can colour its folder glyph and heading.
		 *
		 * Both the host's own label and the demo's renamed one are accepted, so this does
		 * not depend on the copy plugin having run first. The marker goes on the group's ROW,
		 * which is what the stylesheet's glyph/title/chevron selectors are scoped to, and is
		 * keyed on the exact label so no unrelated element can be caught. A match that is not
		 * inside a group row (a session sharing the label) is held back as a fallback and the
		 * search continues, so it can never displace the real group.
		 *
		 * EVERY matching row is marked, not just the first. Two rows can legitimately carry
		 * this label at once: the chats Workspace row ("Chats") and, while any chat is still
		 * unassigned, the "Ungrouped" row the copy plugin renames to "Chats". Both are the
		 * chats surface, so both take the colour.
		 */
		function markChatsGroup() {
			if (typeof document === "undefined") return;
			let fallback = null;
			let marked = false;
			for (const text of CHATS_LABELS) {
				for (const label of elementsWithText(document.body, text)) {
					const row = chatsGroupRow(label);
					if (row !== null) {
						row.setAttribute(CHATS_ATTR, "1");
						marked = true;
						continue;
					}
					if (fallback === null) fallback = label.parentElement;
				}
			}
			// Only when NO group row matched does the plain wrapper take the marker, which
			// keeps a session that happens to be labelled "Chats" from going purple.
			if (!marked && fallback !== null) fallback.setAttribute(CHATS_ATTR, "1");
		}

		/**
		 * Button geometry matching the host's own New Session control, filled with the SAME
		 * brand gradient as the Upload transcript card (`#6d4cf0 -> #9b7bf7`, Aaron's call:
		 * the primary sidebar CTA and the hero card carry one colour), with white text and
		 * white icon on the card's `#4b37e0` border. The icon is stroked with `currentColor`,
		 * so setting `color` here whites it too.
		 */
		const FALLBACK_BUTTON_STYLE = {
			boxSizing: "border-box",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "6px",
			width: "100%",
			height: "38px",
			margin: "0 2px 8px",
			padding: "8px 16px",
			border: "1px solid #4b37e0",
			borderRadius: "12px",
			background: "linear-gradient(135deg, #6d4cf0 0%, #9b7bf7 100%)",
			color: "#ffffff",
			fontFamily: "'Manrope',ui-sans-serif,system-ui,sans-serif",
			fontSize: "14px",
			fontWeight: "700",
			lineHeight: "22px",
			cursor: "pointer",
			overflow: "hidden",
			whiteSpace: "nowrap",
		};

		/** The fallback chat button: same control shape, quieter fill so it reads as secondary. */
		const FALLBACK_CHAT_STYLE = {
			boxSizing: "border-box",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "6px",
			width: "100%",
			height: "38px",
			margin: "0 2px 8px",
			padding: "8px 16px",
			border: "1px solid rgba(109,76,240,0.32)",
			borderRadius: "12px",
			background: "rgba(255,255,255,0.72)",
			color: "#4b37e0",
			fontFamily: "'Manrope',ui-sans-serif,system-ui,sans-serif",
			fontSize: "14px",
			fontWeight: "600",
			lineHeight: "22px",
			cursor: "pointer",
			overflow: "hidden",
			whiteSpace: "nowrap",
		};

		/**
		 * Build the fallback "New Audit" control.
		 *
		 * The host's own New Session button is hidden rather than restyled, because a React
		 * component owns its label and children; replacing it with our own node keeps the
		 * appearance fully under our control while the create flow stays exactly the one the
		 * injected button used: OS folder picker -> create workspace -> open.
		 * @param services - injected host services.
		 * @returns the button element.
		 */
		function buildFallbackAuditButton(services) {
			const button = el("button", { type: "button", title: LABEL_CREATE_AUDIT, "aria-label": LABEL_CREATE_AUDIT }, [
				svg(
					{ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2.5, "stroke-linecap": "round" },
					["M12 5v14M5 12h14"],
				),
				document.createTextNode(LABEL_CREATE_AUDIT),
			]);
			applyInlineStyle(button, FALLBACK_BUTTON_STYLE);
			button.setAttribute(ROW_ATTR, "1");
			button.addEventListener("click", () => {
				button.disabled = true;
				createAudit(services)
					.catch((reason) => console.warn("@eloize/dsh-shell: new audit failed:", reason))
					.then(() => {
						button.disabled = false;
					});
			});
			return button;
		}

		/**
		 * Build the fallback "New Chat" control, placed on its own line under New Audit.
		 * @param services - injected host services.
		 * @returns the button element.
		 */
		function buildFallbackChatButton(services) {
			const button = el("button", { type: "button", title: LABEL_NEW_CHAT, "aria-label": LABEL_NEW_CHAT }, [
				svg(
					{ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" },
					["M21 12a8 8 0 01-11.6 7.1L4 20l.9-5.4A8 8 0 1121 12z"],
				),
				document.createTextNode(LABEL_NEW_CHAT),
			]);
			applyInlineStyle(button, FALLBACK_CHAT_STYLE);
			button.setAttribute(CHAT_ATTR, "1");
			button.addEventListener("click", () => {
				button.disabled = true;
				createChat(services)
					.catch((reason) => console.warn("@eloize/dsh-shell: new chat failed:", reason))
					.then(() => {
						button.disabled = false;
					});
			});
			return button;
		}

		/**
		 * Mount the fallback pair in place of the host's New Session button.
		 *
		 * Both buttons are inserted as SIBLINGS immediately before the original, so they land
		 * in exactly the same column and position the host control occupied, and the workspace
		 * region below keeps its own line. Idempotent: the markers are checked first.
		 * @param services - injected host services.
		 */
		function mountFallbackButtons(services) {
			if (typeof document === "undefined") return;
			const host = findHostNewSession();
			if (host === null || host.parentElement === null) return;
			const audit = document.querySelector("[" + ROW_ATTR + "]");
			const chat = document.querySelector("[" + CHAT_ATTR + "]");
			if (isAttached(audit) && isAttached(chat)) return;
			const parent = host.parentElement;
			if (!isAttached(chat)) {
				if (isAttached(audit)) audit.parentElement.insertBefore(buildFallbackChatButton(services), audit.nextSibling);
				else {
					parent.insertBefore(buildFallbackAuditButton(services), host);
					parent.insertBefore(buildFallbackChatButton(services), host);
				}
			}
		}

		/** Run one mount pass over every Eloize shell surface. */
		function applyShell(services) {
			retireStaleNodes();
			installStyles();
			installConfidentialStyles();
			hideHostNewSession();
			dropSidebarFade();
			markChatsGroup();
			mountFallbackButtons(services);
			mountUploadCard(services);
		}
		//#endregion

		//#region lifecycle
		/**
		 * Install the Eloize shell surfaces for the lifetime of the plugin.
		 *
		 * Activated `immediately`, so this can run before the shell has mounted anything.
		 * A boot observer on `document.body` covers that window; without it the very first
		 * pass would find no anchors and nothing would ever mount. This is the same
		 * ordering trap the copy plugin hit, so it is handled the same way.
		 * @param services - injected host services.
		 * @returns a disposer removing every marker and style this plugin added.
		 */
		function installShell(services) {
			if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
				return () => {};
			}
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
					applyShell(services);
				} finally {
					observer.disconnect();
					observer.observe(document.body, { childList: true, subtree: true });
				}
			}

			run();

			return () => {
				observer.disconnect();
				for (const attr of [ROW_ATTR, CHAT_ATTR, CARD_ATTR]) {
					const node = findInjected(attr);
					if (node !== null && node.parentElement !== null) node.parentElement.removeChild(node);
				}
				for (const node of document.querySelectorAll("[" + HIDDEN_ATTR + "]")) {
					node.style.display = "";
					node.removeAttribute(HIDDEN_ATTR);
				}
				for (const node of document.querySelectorAll("[" + CHATS_ATTR + "]")) node.removeAttribute(CHATS_ATTR);
			};
		}
		//#endregion

		//#region slot occupant
		/**
		 * Confidential mode toggle CSS.
		 *
		 * Supplied by Aaron and used VERBATIM apart from two documented deviations. Scoped
		 * entirely under `.eloize-confidential-toggle`, so nothing leaks into DSH's other
		 * styles. `--size: 50px` is fixed and must not change: `.tick_mark` uses a hardcoded
		 * `top: 9px`, so the X goes out of alignment at any other size.
		 *
		 * Deviations:
		 *  1. The CHECKED gradient is the brand purple instead of the supplied
		 *     "#f7805c -> #fb4545 -> #e1236a", per Aaron: the pressed state must carry the
		 *     company colouring, not red. Every other checked property is unchanged.
		 *  2. `label:after` adds the off state's white centre dot inside the supplied white
		 *     oval, so the off state reads as "gradient ring with a white centre" as in the
		 *     supplied reference. Both pseudo-elements are hidden in the checked state.
		 */
		const CONFIDENTIAL_CSS = [
			/* ---------- One-row contract (Step 3 v3 Push 1) ----------
			   While the live confidential plugin is loaded it marks the body
			   with data-eloize-confidential-live; this rule hides the inert
			   placeholder row. No generation numbers here: switching the
			   confidential plugin off removes the attribute and this row
			   comes back. */
			"body[data-eloize-confidential-live] .eloize-confidential-placeholder{display:none !important;}",
			/* ---------- Unchecked: Confidential OFF (gradient ring) ---------- */
			".eloize-confidential-toggle .checkbox-wrapper *{-webkit-tap-highlight-color:transparent;outline:none;}",
			".eloize-confidential-toggle .checkbox-wrapper input[type=\"checkbox\"]{display:none;}",
			".eloize-confidential-toggle .checkbox-wrapper label{--size:50px;--shadow:calc(var(--size) * 0.07) calc(var(--size) * 0.1);",
			"--centre:calc(var(--size) * 0.7);position:relative;display:block;width:var(--size);height:var(--size);margin:0 auto;",
			"background-color:#4158d0;background-image:linear-gradient(43deg, #4158d0 0%, #c850c0 46%, #ffcc70 100%);",
			"border-radius:50%;box-shadow:0 var(--shadow) #ffbeb8;cursor:pointer;",
			"transition:0.2s ease transform, 0.2s ease background-color, 0.2s ease box-shadow;overflow:hidden;z-index:1;}",
			".eloize-confidential-toggle .checkbox-wrapper label:before{content:\"\";position:absolute;top:50%;right:0;left:0;",
			"width:var(--centre);height:var(--centre);margin:0 auto;background-color:#fff;",
			"transform:translateY(-50%);border-radius:50%;box-shadow:inset 0 var(--shadow) #ffbeb8;",
			"transition:0.2s ease width, 0.2s ease height;}",
			".eloize-confidential-toggle .checkbox-wrapper label:after{content:\"\";position:absolute;top:50%;right:0;left:0;",
			"width:calc(var(--centre) - 6px);height:calc(var(--centre) - 6px);margin:0 auto;border-radius:50%;",
			"background-color:var(--dsw-alias-bg-base, #fff);transform:translateY(-50%);",
			"transition:0.2s ease width, 0.2s ease height;}",
			".eloize-confidential-toggle .checkbox-wrapper label:hover:before{width:calc(var(--size) * 0.55);height:calc(var(--size) * 0.55);",
			"box-shadow:inset 0 var(--shadow) #ff9d96;}",
			".eloize-confidential-toggle .checkbox-wrapper label:hover:after{width:calc(var(--size) * 0.55 - 6px);height:calc(var(--size) * 0.55 - 6px);}",
			".eloize-confidential-toggle .checkbox-wrapper label:active{transform:scale(0.9);}",
			".eloize-confidential-toggle .checkbox-wrapper .tick_mark{position:absolute;top:9px;left:2px;right:0;",
			"width:calc(var(--size) * 0.6);height:calc(var(--size) * 0.6);margin:0 auto;",
			"margin-left:calc(var(--size) * 0.14);transform:rotateZ(-92deg);}",
			".eloize-confidential-toggle .checkbox-wrapper .tick_mark:before,",
			".eloize-confidential-toggle .checkbox-wrapper .tick_mark:after{content:\"\";position:absolute;background-color:#fff;",
			"border-radius:2px;opacity:0;transition:0.2s ease transform, 0.2s ease opacity;}",
			".eloize-confidential-toggle .checkbox-wrapper .tick_mark:before{left:0;bottom:0;width:calc(var(--size) * 0.1);",
			"height:calc(var(--size) * 0.3);box-shadow:-2px 0 5px rgba(0, 0, 0, 0.23);",
			"transform:translateY(calc(var(--size) * -0.68));}",
			".eloize-confidential-toggle .checkbox-wrapper .tick_mark:after{left:0;bottom:0;width:100%;",
			"height:calc(var(--size) * 0.1);box-shadow:0 3px 5px rgba(0, 0, 0, 0.23);",
			"transform:translateX(calc(var(--size) * 0.78));}",
			/* ---------- Checked: Confidential ON (brand purple circle with X) ---------- */
			".eloize-confidential-toggle .checkbox-wrapper input[type=\"checkbox\"]:checked + label{background-color:#4b37e0;",
			"background-image:linear-gradient(43deg, #3a28c4 0%, #4b37e0 46%, #8a5cf6 100%);",
			"box-shadow:rgba(75, 55, 224, 0.3) 0px 19px 38px, rgba(75, 55, 224, 0.22) 0px 15px 12px;}",
			".eloize-confidential-toggle .checkbox-wrapper input[type=\"checkbox\"]:checked + label:before{width:0;height:0;}",
			".eloize-confidential-toggle .checkbox-wrapper input[type=\"checkbox\"]:checked + label:after{width:0;height:0;}",
			".eloize-confidential-toggle .checkbox-wrapper input[type=\"checkbox\"]:checked + label .tick_mark:before,",
			".eloize-confidential-toggle .checkbox-wrapper input[type=\"checkbox\"]:checked + label .tick_mark:after{",
			"background-color:#fff;width:calc(var(--size) * 0.4);height:calc(var(--size) * 0.1);left:50%;top:50%;",
			"transform:translate(-50%, -50%);opacity:1;}",
			".eloize-confidential-toggle .checkbox-wrapper input[type=\"checkbox\"]:checked + label .tick_mark:before{",
			"transform:translate(-50%, -50%) rotate(45deg);}",
			".eloize-confidential-toggle .checkbox-wrapper input[type=\"checkbox\"]:checked + label .tick_mark:after{",
			"transform:translate(-50%, -50%) rotate(-45deg);}",
			/* ---------- Reduced motion (matches the board's convention) ---------- */
			"@media (prefers-reduced-motion: reduce){",
			".eloize-confidential-toggle .checkbox-wrapper label,",
			".eloize-confidential-toggle .checkbox-wrapper label:before,",
			".eloize-confidential-toggle .checkbox-wrapper label:after,",
			".eloize-confidential-toggle .checkbox-wrapper .tick_mark:before,",
			".eloize-confidential-toggle .checkbox-wrapper .tick_mark:after{transition:none;}}",
		].join("");

		/** Stable id for the toggle sheet, so it is injected once per generation. */
		const CONFIDENTIAL_STYLE_ID = "@eloize/dsh-shell/confidential." + GENERATION + ".css";

		/** Inject the Confidential toggle stylesheet once. */
		function installConfidentialStyles() {
			if (typeof document === "undefined") return;
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(CONFIDENTIAL_STYLE_ID) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@eloize/dsh-shell";
			tag.dataset.pluginCss = CONFIDENTIAL_STYLE_ID;
			tag.textContent = CONFIDENTIAL_CSS;
			document.head.appendChild(tag);
		}

		/** Row layout for the footer control: the supplied checkbox beside the labels. */
		const CONFIDENTIAL_ROW_STYLE = {
			display: "flex",
			alignItems: "center",
			gap: "12px",
			width: "100%",
			boxSizing: "border-box",
			textAlign: "left",
			padding: "4px 0",
		};

		/**
		 * Render the Confidential mode row.
		 *
		 * The markup is the supplied structure and its ORDER matters: the CSS selects the
		 * label with the adjacent-sibling combinator `input:checked + label`, so the input
		 * must come immediately before the label.
		 *
		 * Presentation only: clicking flips the row so the demo can show both states, but
		 * NOTHING is enforced - no network restriction, no tool restriction, no model change.
		 * @returns the confidential-mode row.
		 */
		function ConfidentialRow() {
			const [on, setOn] = React.useState(false);
			const input = React.createElement("input", {
				type: "checkbox",
				id: CONFIDENTIAL_INPUT_ID,
				checked: on,
				onChange: (event) => setOn(event.target.checked),
			});
			const label = React.createElement(
				"label",
				{ htmlFor: CONFIDENTIAL_INPUT_ID, "aria-label": CONFIDENTIAL_TITLE },
				React.createElement("div", { className: "tick_mark" }),
			);
			const wrapper = React.createElement("div", { className: "checkbox-wrapper" }, input, label);
			const toggle = React.createElement("div", { className: "eloize-confidential-toggle" }, wrapper);
			const title = React.createElement(
				"span",
				{ style: { fontWeight: 700, color: "#241c4a", fontSize: "13px", lineHeight: 1.3 } },
				CONFIDENTIAL_TITLE,
			);
			const sub = React.createElement(
				"span",
				{ style: { color: on ? "#4b37e0" : "rgba(60,48,110,0.78)", fontSize: "13px", lineHeight: 1.3 } },
				on ? CONFIDENTIAL_SUB_ON : CONFIDENTIAL_SUB_OFF,
			);
			const text = React.createElement("span", { style: { display: "flex", flexDirection: "column" } }, title, sub);
			// The stable one-row contract: while the live confidential plugin is
			// loaded (body[data-eloize-confidential-live]) this inert row is
			// hidden by CSS; switching that plugin off brings it back.
			return React.createElement("div", { className: "eloize-confidential-placeholder", style: CONFIDENTIAL_ROW_STYLE }, toggle, text);
		}
		//#endregion

		/**
		 * Required services.
		 *
		 * `uiWorkspace` is the client navigation service - it subclasses the cordis
		 * `Service` and registers itself under that name - while `workspaces` is the client
		 * Workspace controller it composes. Both must be listed here because `ctx.<name>`
		 * access is gated by this declaration.
		 *
		 * `sessions` is deliberately NOT listed: chats are Workspace sessions created through
		 * `uiWorkspace.startSession`, so this plugin never touches the Session controller.
		 */
		const inject = ["slots", "uiWorkspace", "workspaces"];

		/**
		 * Register the Eloize shell contributions.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			const services = {
				uiWorkspace: ctx.uiWorkspace,
				workspaces: ctx.workspaces,
			};

			ctx.effect(() => installShell(services));

			// Confidential mode is a real list slot, so it composes with the host footer
			// instead of being injected: `sidebar.footer.action` is additive and renders
			// directly above Settings, exactly where the design board places it.
			ctx.slots.inject("sidebar.footer.action", function* () {
				yield ctx.slots.register(
					{ name: "sidebar.footer.action", id: "eloize-confidential", order: 10, label: CONFIDENTIAL_TITLE },
					ConfidentialRow,
				);
			});
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});


