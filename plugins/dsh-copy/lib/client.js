window.__ModuleLoader__.load({
	id: "@eloize/dsh-copy",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		//#region demo copy
		/** Home greeting. Single editable constant - confirmed by Aaron. */
		const GREETING = "what are we auditing today?";
		/** Home subline. Single editable constant. */
		const SUBLINE =
			"Drop in a transcript and I'll clean it on this machine before we start building.";

		/**
		 * Offline (Confidential mode) home copy - pass 3 of the demo-day set.
		 *
		 * Shown ONLY while the confidential plugin has the mode on
		 * (`body[data-eloize-confidential-mode="on"]`, the same flag every other
		 * plugin keys off). Normal mode keeps the two constants above unchanged.
		 * Editable in one place each.
		 */
		const OFFLINE_HEADLINE = "off the record.";
		const OFFLINE_SUBLINE = "Local model only. Nothing leaves this machine.";

		/**
		 * Chat box placeholder copy - pass 3 of the demo-day set.
		 *
		 * The host renders its own placeholder string into TWO places and re-renders
		 * both: a `data-placeholder` attribute on the contenteditable, and the text of
		 * the absolutely-positioned `[data-composer-placeholder]` div that is actually
		 * visible. Both are written directly by `applyPlaceholder` on every pass, which
		 * is why this is data rather than CSS: the `content`-swap stylesheet tried first
		 * did not reach the page.
		 *
		 * The ellipsis is written as an escape to keep this bundle pure ASCII.
		 */
		const PLACEHOLDER = "Ask Eloize anything\u2026";
		/**
		 * Offline (Confidential) placeholder. Offline is the mode whose whole point is
		 * that the local model does the work and the sidebar carries the transcript
		 * upload, so the chat box invites the file instead of a question.
		 */
		const PLACEHOLDER_OFFLINE = "Upload sensitive files\u2026";

		/**
		 * The three host-rendered strings this plugin rewrites by text match.
		 *
		 * These are host-rendered i18n values with no configuration surface: the
		 * locale service throws on any duplicate `(namespace, locale)` pair, so they
		 * cannot be overridden through `locale.register`, and the hero region has no
		 * seat a plugin can occupy. Rewriting the rendered text is the only route
		 * short of reimplementing the host's components.
		 *
		 * This list is the TEXT half only: `ensureSubline` also inserts a subline and
		 * `removePreviewBadge` deletes the host's pill (see the region below).
		 *
		 * Each key was verified to be a UNIQUE string across every shipped client
		 * package, so a match cannot land on unrelated UI.
		 */
		const REPLACEMENTS = [
			// Home empty-state headline (locale key `hero.headline`).
			{ from: "Into the Unknown", to: GREETING },
			// Sidebar section heading (locale key `section.workspaces`).
			{ from: "Projects", to: "Audits" },
			// Sidebar grouping for sessions with no audit (locale key `group.ungrouped`).
			{ from: "Ungrouped", to: "Chats" },
		];

		/** Styling for the injected subline, matched to the design board. */
		const SUBLINE_STYLE =
			"display:block;width:100%;text-align:center;font-size:14px;line-height:22px;" +
			"font-weight:400;color:var(--dsw-alias-label-secondary);margin-top:6px;";

		/**
		 * Anchors used to scope every write to a bounded container.
		 *
		 * Walking the whole document and mutating text nodes anywhere caused React to
		 * fight these writes on unrelated subtrees, which broke session interaction in
		 * the sidebar. Every replacement now happens only inside a container found by
		 * climbing from a known anchor, so untouched regions of the tree are never
		 * modified at all.
		 */
		const ANCHOR_TEXT = "Projects";
		const HERO_CLASS = '[class*="headline"]';
		/** Our injected subline, found again by its own marker on every pass. */
		const SUBLINE_MARKER = "data-eloize-subline";
		/**
		 * The injected headline marker (owned by the branding plugin, which builds the
		 * element; this plugin only sets its text).
		 */
		const HEADLINE_MARKER = "data-eloize-headline";

		/**
		 * The host's "Preview" pill, rendered unconditionally in the hero.
		 *
		 * Verified against the shipped bundle (`dsh-client-ui-conversation`): the hero
		 * renders `headline > span[titleGroup] > [headline span, previewBadge span]`, and
		 * the badge is a plain sibling of the headline with no slot, prop or fallback that
		 * could suppress it. `renderSlot` returns a single occupant and is called for the
		 * fish hitbox, NOT for this pill, so occupying a slot cannot remove it.
		 *
		 * It is therefore removed from the DOM, scoped to the anchored hero group (the
		 * headline's own parent) so no other subtree is ever touched. The observer that
		 * installs the copy re-runs this on every hero mutation, so a React re-render that
		 * reintroduces the pill has it taken back out on the next microtask.
		 */
		const PREVIEW_BADGE_TEXT = "Preview";

		/** The offline-mode flag, set on <body> by the confidential plugin. */
		const MODE_ATTR = "data-eloize-confidential-mode";
		//#endregion

		/** Cached scoped containers, rediscovered when they detach. */
		let sidebarRoot = null;
		let heroRoot = null;

		/** True when the node is still in the rendered document. */
		function isAttached(node) {
			if (node === null || typeof document === "undefined") return false;
			return document.contains(node);
		}

		/** True while the confidential plugin reports offline (Confidential) mode. */
		function offlineMode() {
			if (typeof document === "undefined" || document.body === null) return false;
			return document.body.getAttribute(MODE_ATTR) === "on";
		}

		/**
		 * Find the nearest ancestor of a text node whose subtree is a reasonable
		 * container, without ever falling back to `document.body`.
		 * @param text - the anchor text to search for.
		 * @param levels - how many ancestors to climb.
		 * @returns the container, or null when the anchor is absent.
		 */
		function containerForText(text, levels) {
			if (typeof document === "undefined") return null;
			const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
			let node = walker.nextNode();
			while (node !== null) {
				const value = node.nodeValue;
				if (value !== null && value.trim() === text) {
					let el = node.parentElement;
					for (let i = 0; i < levels && el !== null; i++) el = el.parentElement;
					if (el !== null && el !== document.body) return el;
				}
				node = walker.nextNode();
			}
			return null;
		}

		/** Resolve the sidebar container, reusing the cached one while it is attached. */
		function findSidebarRoot() {
			if (isAttached(sidebarRoot)) return sidebarRoot;
			// Climb from the section label, which always sits inside the sidebar.
			sidebarRoot = containerForText(ANCHOR_TEXT, 2);
			return sidebarRoot;
		}

		/** Resolve the hero container, reusing the cached one while it is attached. */
		function findHeroRoot() {
			if (isAttached(heroRoot)) return heroRoot;
			const headline = document.querySelector(HERO_CLASS);
			heroRoot = headline === null ? null : headline.parentElement;
			return heroRoot;
		}

		/**
		 * Rewrite one text node, preserving the surrounding whitespace so the host's
		 * flex layout and spacing are untouched.
		 * @param node - the text node to inspect.
		 * @param replacements - the active replacement list.
		 * @returns true when the node was rewritten.
		 */
		function patchTextNode(node, replacements) {
			const value = node.nodeValue;
			if (value === null) return false;
			const trimmed = value.trim();
			if (trimmed === "") return false;
			for (let i = 0; i < replacements.length; i++) {
				const rule = replacements[i];
				if (trimmed !== rule.from) continue;
				const at = value.indexOf(trimmed);
				node.nodeValue = value.slice(0, at) + rule.to + value.slice(at + trimmed.length);
				return true;
			}
			return false;
		}

		/** Rewrite every matching text node inside ONE container. */
		function patchWithin(root, replacements) {
			if (root === null || !isAttached(root)) return 0;
			let count = 0;
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
			let node = walker.nextNode();
			while (node !== null) {
				if (patchTextNode(node, replacements)) count++;
				node = walker.nextNode();
			}
			return count;
		}

		/** The subline copy for the current mode. */
		function sublineText() {
			return offlineMode() ? OFFLINE_SUBLINE : SUBLINE;
		}

		/**
		 * Fill the hero headline and subline copy and keep it in step with the mode.
		 *
		 * The host unmounts its OWN headline shortly after boot, so the copy can no
		 * longer be a text rewrite of a host node. The branding plugin injects a
		 * persistent headline/subline pair (markers `data-eloize-headline` and
		 * `data-eloize-subline`) into the surviving hero stack; this pass owns their
		 * TEXT, re-setting it on every pass so the offline toggle swaps the copy.
		 * Both writes are idempotent: an already-correct node is left untouched.
		 */
		function ensureHeroText() {
			if (typeof document === "undefined") return;
			const offline = offlineMode();
			const wantedHeadline = offline ? OFFLINE_HEADLINE : GREETING;
			const wantedSubline = offline ? OFFLINE_SUBLINE : SUBLINE;
			const headline = document.querySelector("[" + HEADLINE_MARKER + "]");
			if (headline !== null && headline.textContent !== wantedHeadline) headline.textContent = wantedHeadline;
			const subline = document.querySelector("[" + SUBLINE_MARKER + "]");
			if (subline !== null && subline.textContent !== wantedSubline) subline.textContent = wantedSubline;
		}

		/**
		 * Take the host's "Preview" pill out of the hero, once per render.
		 *
		 * Scoped to the headline's own subtree and keyed on the pill's own text, so it
		 * cannot match anything outside the hero even if the build's hashed class names
		 * change. The pill is a GRANDCHILD of the headline (headline > titleGroup >
		 * previewBadge), so the walk descends one level: the headline's own children are
		 * the fish slot and the title group, and the pill is the latter's plain-text child.
		 * @returns the number of badges removed (0 when already absent).
		 */
		function removePreviewBadge() {
			if (typeof document === "undefined") return 0;
			const headline = document.querySelector(HERO_CLASS);
			if (headline === null) return 0;
			let removed = 0;
			for (const container of headline.children) {
				for (const span of container.children) {
					if (span.textContent.trim() !== PREVIEW_BADGE_TEXT) continue;
					if (span.querySelector("*") !== null) continue;
					span.remove();
					removed++;
				}
			}
			return removed;
		}

		/**
		 * Apply every replacement, strictly inside the scoped containers.
		 *
		 * If neither container can be resolved, this does nothing at all rather than
		 * reaching for a broader target: a no-op is always safer than touching the
		 * document, and a later pass picks the copy up once the UI mounts.
		 *
		 * The subline and the Preview removal are driven off the hero alone, so they are
		 * attempted independently of whether any text node needed rewriting: on a re-render
		 * the host may restore its own headline while the subline and the pill stay put.
		 * @returns the number of text nodes rewritten.
		 */
		function applyReplacements() {
			if (typeof document === "undefined") return 0;
			let count = 0;
			count += patchWithin(findSidebarRoot(), REPLACEMENTS);
			count += patchWithin(findHeroRoot(), REPLACEMENTS);
			ensureHeroText();
			removePreviewBadge();
			applyPlaceholder();
			return count;
		}
		//#endregion

		/**
		 * Point the chat box placeholder at the mode's copy.
		 *
		 * Written to BOTH host surfaces so they cannot disagree:
		 *  - `[data-composer-placeholder]` is the absolutely-positioned div the user
		 *    actually reads while the draft is empty;
		 *  - `data-placeholder` sits on the contenteditable itself and is re-read by the
		 *    host whenever the draft changes, so it is the one that survives typing and
		 *    the one a screen reader announces.
		 *
		 * Both writes are guarded on "already correct", so re-running on every mutation
		 * cannot loop through the observer, and React's own re-renders are simply
		 * corrected on the next pass.
		 */
		function applyPlaceholder() {
			if (typeof document === "undefined") return;
			const wanted = offlineMode() ? PLACEHOLDER_OFFLINE : PLACEHOLDER;
			for (const node of document.querySelectorAll("[data-composer-placeholder]")) {
				if (node.textContent !== wanted) node.textContent = wanted;
			}
			for (const editor of document.querySelectorAll("[data-placeholder]")) {
				if (editor.getAttribute("data-placeholder") !== wanted) editor.setAttribute("data-placeholder", wanted);
				if (editor.getAttribute("aria-label") !== wanted) editor.setAttribute("aria-label", wanted);
			}
		}

		/**
		 * Install the copy replacements for the lifetime of the plugin.
		 *
		 * This plugin is activated `immediately`, which means it can run BEFORE the
		 * shell has mounted the hero or the sidebar. Observing only the scoped
		 * containers is therefore not enough on its own: with both anchors absent there
		 * would be nothing to observe and the copy would never apply, because no later
		 * mutation could ever reach this code. A boot observer on `document.body` covers
		 * that window and is released as soon as the real containers are found.
		 *
		 * The observer stays on `document.body` for the plugin's lifetime. Push 3.2
		 * widened it from the two scoped containers so the hero is caught when it
		 * re-attaches after a confidential-mode exit; observation is wide, writes stay
		 * scoped inside `applyReplacements`. It is disconnected around every write pass
		 * so its own mutations cannot re-trigger it.
		 *
		 * KNOWN GAP (unfixed): the disposer only disconnects the observer. React never
		 * re-renders the text nodes this plugin mutated in place, and the injected
		 * subline is never removed, so switching the plugin off does NOT by itself
		 * restore the host strings or the Preview pill - a hard refresh does.
		 * @param ctx - client root context.
		 */
		function installCopy() {
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
					applyReplacements();
				} finally {
					// Push 3.2: observe the whole document instead of only the
					// scoped sidebar/hero containers. A scoped observer can miss
					// the hero re-attaching after a confidential-mode exit (the
					// hero detaches while ON and re-renders on OFF), which left
					// the host heading "Into the Unknown · Preview" unreplaced.
					// Writes stay scoped (applyReplacements only patches the
					// sidebar and hero roots), so only observation widens.
					if (document.body !== null) {
						// `attributes: true` makes the offline copy follow the mode the
						// instant the confidential plugin flips
						// body[data-eloize-confidential-mode], rather than relying on the
						// indirect childList mutations that accompany it.
						observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
					}
				}
			}

			run();

			return () => {
				observer.disconnect();
				sidebarRoot = null;
				heroRoot = null;
			};
		}

		/** Apply the Eloize demo copy. */
		function apply(ctx) {
			ctx.effect(() => installCopy());
		}

		exports.apply = apply;
		return module.exports;
	},
});
