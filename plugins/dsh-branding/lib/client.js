window.__ModuleLoader__.load({
	id: "@eloize/dsh-branding",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		//#region brand data
		/**
		 * The Eloize mark, reproduced from the site's own logo asset
		 * (framerusercontent 8m2YwYsx6cFVQABWpgtGR6xmiw.svg, 33x33).
		 *
		 * The authored paths use `fill="#000"`; both path groups are grouped and
		 * filled with `currentColor` here so the mark picks up the surrounding
		 * label colour instead of painting black on a dark navy surface.
		 */
		const MARK_PATH_A =
			"M19.402.225h13.062v13.06c-7.214 0-13.062-5.847-13.062-13.06m13.063 18.808v13.061H19.404c0-7.213 5.847-13.06 13.06-13.06z";
		const MARK_CIRCLE = { cx: 20.45, cy: 16.29, r: 3.918 };
		const MARK_PATH_B = "M.465.225h13.453v31.869H.465z";

		/** Product name shown beside the mark and in the browser tab. */
		const PRODUCT_NAME = "Eloize";
		/**
		 * Role line beside the assistant badge on the home empty state, matching the
		 * design board. Edit here to change it in one place.
		 */
		const HERO_ROLE_LINE = "Your audit assistant";
		/** Eloize accent: the reference's link/accent indigo, used for the hero badge. */
		const INDIGO = "#4b37e0";
		/** Text primary from the reference. */
		const INK = "#1d1b26";

		/**
		 * Offline (Confidential mode) logo treatment - pass 3 of the demo-day set.
		 *
		 * Shown ONLY while the confidential plugin reports the mode on; normal-mode
		 * logos are untouched.
		 *
		 *  - Home hero badge: the gradient RING comes off and the mark is swapped
		 *    for the real Eloize mark in white on an Eloize-purple shield (see
		 *    OFFLINE_CSS + createShieldNode).
		 *  - Sidebar brand row: a small WHITE padlock is appended after the "Eloize"
		 *    wordmark (see installSidebarPadlock).
		 */
		const MODE_ATTR = "data-eloize-confidential-mode";
		const OFFLINE_PURPLE = "#4b37e0";
		/** Class on the hero badge's ring element, so the offline sheet can take it off. */
		const RING_CLASS = "eloize-ring";
		/** Class on the hero badge's mark element (the mode-aware swap target). */
		const MARK_CLASS = "eloize-ring-mark";
		/** Class on the injected shield. Hidden by default, shown by OFFLINE_CSS. */
		const SHIELD_CLASS = "eloize-offline-shield";
		/** Marker on the injected sidebar padlock, so later passes do not duplicate it. */
		const PADLOCK_ATTR = "data-eloize-offline-padlock";
		/** Class the branding sheet reads to colour the padlock when the mode is on. */
		const PADLOCK_CLASS = "eloize-offline-padlock";
		/**
		 * The shield outline, drawn to fill a 52x52 viewBox (classic flat-top shield).
		 * Sized 44px in the badge so it matches the ring's box in normal mode.
		 */
		const SHIELD_PATH = "M26 3 46 11v14c0 11.5-8 19.5-20 24C14 44.5 6 36.5 6 25V11z";

		/** Hero badge DOM marker, so the injected node is found again on later passes. */
		const BADGE_ATTR = "data-eloize-hero-badge";
		/** React marker on the inline slot occupant, used to hide it once repositioned. */
		const BADGE_INLINE_MARKER = "data-eloize-hero-badge-inline";
		/** The hero's headline wrapper; stable substring of the host's hashed class name. */
		const HERO_CLASS = '[class*="headline"]';
		/**
		 * The persistent hero container. The host unmounts its OWN headline/fish/
		 * body shortly after boot, but the hero stack (`pXSMma_stack`) survives as
		 * an empty flex column. The whole header is injected HERE so it outlives the
		 * host's headline, instead of anchoring on the transient `[class*="headline"]`.
		 */
		const STACK_SELECTOR = ".pXSMma_stack";
		/** Marker on the injected header block (badge + headline + subline). */
		const HERO_ROOT_ATTR = "data-eloize-hero";
		/** Marker on the injected headline; the copy plugin owns its text. */
		const HERO_HEADLINE_ATTR = "data-eloize-headline";
		/** Marker on the injected subline; shared with the copy plugin's marker. */
		const HERO_SUBLINE_ATTR = "data-eloize-subline";
		/** Fallback headline/subline copy, used only when the copy plugin is off. */
		const HERO_HEADLINE = "what are we auditing today?";
		const HERO_SUBLINE = "Drop in a transcript and I'll clean it on this machine before we start building.";

		/**
		 * Geometry for the hero badge, shared by the React slot occupant and the DOM copy.
		 *
		 * One source of truth: the occupant renders it as React, and the repositioned badge
		 * is built as plain DOM (React is only used for slot components), so without this
		 * the two could drift apart.
		 */
		const BADGE_STYLE = {
			root: {
				display: "inline-flex",
				flexDirection: "row",
				alignItems: "center",
				gap: "10px",
				color: INDIGO,
			},
			ring: {
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: "44px",
				height: "44px",
				flex: "0 0 auto",
				borderRadius: "9999px",
				background: "linear-gradient(43deg, #4158d0 0%, #c850c0 46%, #ffcc70 100%)",
				boxShadow: "0 3px 5px #ffbeb8",
			},
			ringInner: {
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: "36px",
				height: "36px",
				borderRadius: "9999px",
				background: "var(--dsw-alias-bg-base)",
				color: "var(--dsw-alias-label-primary)",
			},
			text: {
				display: "inline-flex",
				flexDirection: "column",
				alignItems: "flex-start",
				lineHeight: 1.15,
				textAlign: "left",
			},
			name: {
				fontFamily: "'Sora', ui-sans-serif, system-ui, sans-serif",
				fontWeight: 600,
				fontSize: "15px",
				letterSpacing: "-0.01em",
				color: "var(--dsw-alias-label-primary)",
			},
			role: {
				fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif",
				fontWeight: 400,
				fontSize: "11px",
				color: "var(--dsw-alias-label-secondary)",
				whiteSpace: "nowrap",
			},
		};

		/**
		 * The Eloize mark as inline React SVG.
		 * @param props - `size` in pixels.
		 * @returns the mark element.
		 */
		function EloizeMark({ size }) {
			const px = typeof size === "number" ? size : 28;
			return React.createElement(
				"svg",
				{
					xmlns: "http://www.w3.org/2000/svg",
					width: px,
					height: px,
					viewBox: "0 0 33 32.1",
					fill: "none",
					"aria-label": PRODUCT_NAME,
					role: "img",
					style: { display: "block", flex: "0 0 auto" },
				},
				React.createElement(
					"g",
					{ fill: "currentColor" },
					React.createElement("path", { d: MARK_PATH_A }),
					React.createElement("circle", MARK_CIRCLE),
					React.createElement("path", { d: MARK_PATH_B }),
				),
			);
		}

		/**
		 * The Eloize mark as inline DOM SVG, for the repositioned badge.
		 * @param size - pixel size.
		 * @returns the mark element.
		 */
		function createMarkNode(size) {
			const NS = "http://www.w3.org/2000/svg";
			const node = document.createElementNS(NS, "svg");
			node.setAttribute("xmlns", NS);
			node.setAttribute("width", String(size));
			node.setAttribute("height", String(size));
			node.setAttribute("viewBox", "0 0 33 32.1");
			node.setAttribute("fill", "none");
			node.setAttribute("aria-label", PRODUCT_NAME);
			node.setAttribute("role", "img");
			node.setAttribute("style", "display:block;flex:0 0 auto");
			const group = document.createElementNS(NS, "g");
			group.setAttribute("fill", "currentColor");
			for (const shape of [
				{ tag: "path", attrs: { d: MARK_PATH_A } },
				{ tag: "circle", attrs: { cx: String(MARK_CIRCLE.cx), cy: String(MARK_CIRCLE.cy), r: String(MARK_CIRCLE.r) } },
				{ tag: "path", attrs: { d: MARK_PATH_B } },
			]) {
				const el = document.createElementNS(NS, shape.tag);
				for (const key of Object.keys(shape.attrs)) el.setAttribute(key, shape.attrs[key]);
				group.appendChild(el);
			}
			node.appendChild(group);
			return node;
		}

		/**
		 * The offline hero shield as inline DOM SVG: an Eloize-purple shield carrying the
		 * real Eloize mark in white (the same three paths as the ring badge), drawn as SVG
		 * shapes so it needs no font file and no external URL (offline mode makes no web
		 * requests). The fill reads the brand variable with a hard #4b37e0 fallback.
		 * @param size - pixel size of the square badge it must fill.
		 * @returns the shield element.
		 */
		function createShieldNode(size) {
			const NS = "http://www.w3.org/2000/svg";
			const node = document.createElementNS(NS, "svg");
			node.setAttribute("class", SHIELD_CLASS);
			node.setAttribute("xmlns", NS);
			node.setAttribute("width", String(size));
			node.setAttribute("height", String(size));
			node.setAttribute("viewBox", "0 0 52 52");
			node.setAttribute("fill", "none");
			node.setAttribute("aria-label", PRODUCT_NAME);
			node.setAttribute("role", "img");
			// Hidden by default: normal mode shows the gradient RING + mark. The
			// offline stylesheet flips this to `display:block !important`, which beats
			// the inline `display:none`, so the shield appears only in offline mode.
			node.setAttribute("style", "display:none;flex:0 0 auto");
			const shield = document.createElementNS(NS, "path");
			shield.setAttribute("d", SHIELD_PATH);
			shield.setAttribute("fill", "var(--eloize-purple, " + OFFLINE_PURPLE + ")");
			// The real Eloize mark (the same three shapes as the ring badge), white,
			// scaled and centred inside the shield's body - not a typed initial. No
			// font and no external URL, so the mark stays intact in offline mode.
			const mark = document.createElementNS(NS, "g");
			mark.setAttribute("fill", "#ffffff");
			mark.setAttribute("transform", "translate(16 17) scale(0.6)");
			for (const shape of [
				{ tag: "path", attrs: { d: MARK_PATH_A } },
				{ tag: "circle", attrs: { cx: String(MARK_CIRCLE.cx), cy: String(MARK_CIRCLE.cy), r: String(MARK_CIRCLE.r) } },
				{ tag: "path", attrs: { d: MARK_PATH_B } },
			]) {
				const el = document.createElementNS(NS, shape.tag);
				for (const key of Object.keys(shape.attrs)) el.setAttribute(key, shape.attrs[key]);
				mark.appendChild(el);
			}
			node.appendChild(shield);
			node.appendChild(mark);
			return node;
		}

		/**
		 * The offline padlock as inline DOM SVG, for the sidebar brand row.
		 *
		 * `fill:none` + `stroke:currentColor` so it takes the colour of the row it sits
		 * in; the sheet pins it WHITE while the offline mode is on (the sidebar's own
		 * text goes white in that mode, and the padlock sits after the wordmark).
		 * @param size - pixel size.
		 * @returns the padlock element.
		 */
		function createPadlockNode(size) {
			const NS = "http://www.w3.org/2000/svg";
			const node = document.createElementNS(NS, "svg");
			node.setAttribute("class", PADLOCK_CLASS);
			node.setAttribute("xmlns", NS);
			node.setAttribute("width", String(size));
			node.setAttribute("height", String(size));
			node.setAttribute("viewBox", "0 0 24 24");
			node.setAttribute("fill", "none");
			node.setAttribute("stroke", "currentColor");
			node.setAttribute("stroke-width", "2");
			node.setAttribute("stroke-linecap", "round");
			node.setAttribute("stroke-linejoin", "round");
			node.setAttribute("aria-hidden", "true");
			node.setAttribute("style", "display:block;flex:0 0 auto");
			const body = document.createElementNS(NS, "rect");
			body.setAttribute("x", "4");
			body.setAttribute("y", "11");
			body.setAttribute("width", "16");
			body.setAttribute("height", "10");
			body.setAttribute("rx", "2");
			const shackle = document.createElementNS(NS, "path");
			shackle.setAttribute("d", "M8 11V7a4 4 0 1 1 8 0v4");
			node.appendChild(body);
			node.appendChild(shackle);
			return node;
		}

		/**
		 * The Eloize wordmark without its independently slotted mark.
		 *
		 * eloize.io renders "Eloize" as live text rather than as artwork, so the
		 * wordmark is set in the brand face rather than traced, which also keeps it
		 * crisp at any zoom and localised by the browser.
		 * @returns the Eloize wordmark.
		 */
		function EloizeWordmark() {
			return React.createElement(
				"span",
				{
					className: "eloize-wordmark",
					style: {
						fontFamily: "'Sora', ui-sans-serif, system-ui, sans-serif",
						fontWeight: 600,
						fontSize: "17px",
						letterSpacing: "-0.01em",
						lineHeight: 1.1,
						// Indirection so the confidential mode's stylesheet can
						// whiten the wordmark: the inline style reads the
						// overridable custom property first (Push 3).
						color: "var(--eloize-wordmark-color, var(--dsw-alias-label-primary))",
						display: "inline-flex",
						alignItems: "center",
					},
				},
				PRODUCT_NAME,
			);
		}

		/**
		 * Build the hero badge as plain DOM.
		 *
		 * The host renders `conversation.hero.brand.mark` INLINE inside its headline flex
		 * row, so a slot occupant can never sit above the headline. The slot is still
		 * occupied (that is what displaces the official fish), but the visible badge is
		 * this node, inserted before the headline and centred, which is the arrangement the
		 * design board shows.
		 * @returns the badge element.
		 */
		function createHeroBadgeNode() {
			const styleOf = (obj) => Object.keys(obj).map((k) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + ":" + obj[k]).join(";");
			const mark = createMarkNode(20);
			mark.setAttribute("class", MARK_CLASS);
			const ringInner = document.createElement("span");
			ringInner.setAttribute("style", styleOf(BADGE_STYLE.ringInner));
			ringInner.appendChild(mark);
			// The offline shield rides inside the ring container so the swap keeps the
			// badge's box identical in both modes; OFFLINE_CSS shows one and hides the
			// other. The shield is inert in normal mode (display:none from the sheet).
			ringInner.appendChild(createShieldNode(52));

			const ring = document.createElement("span");
			ring.setAttribute("class", RING_CLASS);
			ring.setAttribute("style", styleOf(BADGE_STYLE.ring));
			ring.appendChild(ringInner);

			const name = document.createElement("span");
			name.setAttribute("style", styleOf(BADGE_STYLE.name));
			name.textContent = PRODUCT_NAME;

			const role = document.createElement("span");
			role.setAttribute("style", styleOf(BADGE_STYLE.role));
			role.textContent = HERO_ROLE_LINE;

			const text = document.createElement("span");
			text.setAttribute("style", styleOf(BADGE_STYLE.text));
			text.appendChild(name);
			text.appendChild(role);

			const root = document.createElement("span");
			root.setAttribute(BADGE_ATTR, "1");
			root.setAttribute("class", "eloize-hero-badge");
			root.setAttribute("style", styleOf(BADGE_STYLE.root) + ";display:flex;justify-content:center;width:100%;margin-bottom:14px;");
			root.appendChild(ring);
			root.appendChild(text);
			return root;
		}

		/**
		 * Build the persistent hero header block: the badge, then a headline and a
		 * subline whose text the copy plugin owns. The host's own headline is removed
		 * by React after boot, so the header is self-contained and re-inserted into
		 * the surviving hero stack on every pass.
		 * @returns the header element.
		 */
		function buildHeroHeader() {
			const header = document.createElement("div");
			header.setAttribute(HERO_ROOT_ATTR, "1");
			header.setAttribute("class", "eloize-hero");
			header.setAttribute(
				"style",
				"display:flex;flex-direction:column;align-items:center;width:100%;" +
					"box-sizing:border-box;padding:6px 0 4px;text-align:center;",
			);
			const badge = createHeroBadgeNode();
			badge.style.marginBottom = "14px";
			header.appendChild(badge);
			const headline = document.createElement("h1");
			headline.setAttribute(HERO_HEADLINE_ATTR, "1");
			headline.setAttribute(
				"style",
				"display:block;width:100%;margin:0;text-align:center;" +
					"font-family:'Sora',ui-sans-serif,system-ui,sans-serif;" +
					"font-weight:600;font-size:26px;line-height:1.15;letter-spacing:-0.01em;" +
					"color:var(--dsw-alias-label-primary);",
			);
			headline.textContent = HERO_HEADLINE;
			header.appendChild(headline);
			const subline = document.createElement("p");
			subline.setAttribute(HERO_SUBLINE_ATTR, "1");
			subline.setAttribute(
				"style",
				"display:block;width:100%;margin:6px 0 0;text-align:center;" +
					"font-family:'Manrope',ui-sans-serif,system-ui,sans-serif;" +
					"font-weight:400;font-size:14px;line-height:22px;" +
					"color:var(--dsw-alias-label-secondary);",
			);
			subline.textContent = HERO_SUBLINE;
			header.appendChild(subline);
			return header;
		}

		/**
		 * Place the persistent hero header at the top of the surviving hero stack
		 * and retire the inline slot badge.
		 *
		 * Idempotent: the injected block carries a marker, so later passes only
		 * re-assert its position instead of duplicating it.
		 * @returns whether a header is now in place.
		 */
		function installHeroHeader() {
			if (typeof document === "undefined") return false;
			const stack = document.querySelector(STACK_SELECTOR);
			if (stack === null) return false;
			let header = document.querySelector("[" + HERO_ROOT_ATTR + "]");
			if (header === null || !document.contains(header)) {
				header = buildHeroHeader();
				stack.insertBefore(header, stack.firstChild);
			} else if (stack.firstChild !== header) {
				stack.insertBefore(header, stack.firstChild);
			}
			hideInlineBadge();
			return true;
		}

		/** Hide the inline slot occupant, now that the visible badge sits above the headline. */
		function hideInlineBadge() {
			if (typeof document === "undefined") return;
			for (const node of document.querySelectorAll("[" + BADGE_INLINE_MARKER + "]")) {
				node.style.display = "none";
			}
		}

		/**
		 * Offline top-logo padlock: append the small white padlock AFTER the sidebar
		 * "Eloize" wordmark while the mode is on, and take it out again when the mode is
		 * off. Placing it after the wordmark (rather than inside the mark) keeps the
		 * logo-to-wordmark gap identical in both modes.
		 *
		 * React owns the brand name's children (its slot occupant is a React element), but
		 * it does not manage a node it did not render, so appending here survives a
		 * re-render; the pass is idempotent and re-runs on every observer tick anyway, so a
		 * re-render that does drop it gets it back on the next microtask.
		 */
		function installSidebarPadlock() {
			if (typeof document === "undefined") return;
			const offline = document.body !== null && document.body.getAttribute(MODE_ATTR) === "on";
			const existing = document.querySelector("[" + PADLOCK_ATTR + "]");
			if (!offline) {
				if (existing !== null && existing.parentElement !== null) existing.parentElement.removeChild(existing);
				return;
			}
			if (existing !== null && isAttached(existing)) return;
			const name = document.querySelector("[class*='brandName']");
			if (name === null) return;
			const padlock = createPadlockNode(13);
			padlock.setAttribute(PADLOCK_ATTR, "1");
			name.appendChild(padlock);
		}

		/** True while the node is still rendered (local helper for the padlock pass). */
		function isAttached(node) {
			if (node === null || typeof document === "undefined") return false;
			return document.contains(node);
		}

		/**
		 * Keep the repositioned badge in place across renders.
		 *
		 * `apply` runs immediately, before the hero exists, so one pass is not enough; the
		 * observer re-runs the placement when the shell mounts or the hero re-renders, and
		 * is disconnected around each write so its own mutations cannot re-trigger it. The
		 * inline occupant is re-hidden on every pass because a React re-render restores it.
		 * @returns a disposer stopping the watcher and removing the injected badge.
		 */
		function installHeroBadgeWatcher() {
			installHeroHeader();
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
					hideInlineBadge();
					installHeroHeader();
					installSidebarPadlock();
				} finally {
					observer.disconnect();
					if (document.body !== null && document.body !== undefined) {
						// `attributes: true` catches the confidential plugin flipping
						// body[data-eloize-confidential-mode], so the padlock and the
						// shield swap follow the mode without waiting on an unrelated
						// childList mutation.
						observer.observe(document.body, { childList: true, subtree: true, attributes: true });
					}
				}
			}

			run();

			return () => {
				observer.disconnect();
				const node = document.querySelector("[" + HERO_ROOT_ATTR + "]");
				if (node !== null && node.parentElement !== null) node.parentElement.removeChild(node);
				const padlock = document.querySelector("[" + PADLOCK_ATTR + "]");
				if (padlock !== null && padlock.parentElement !== null) padlock.parentElement.removeChild(padlock);
			};
		}
		//#endregion

		/**
		 * Home-empty-state assistant badge: the Eloize mark inside the brand gradient
		 * ring, with the product name and role line beside it.
		 *
		 * This occupies `conversation.hero.brand.mark`, which the shell renders
		 * INLINE inside its headline flex row (`align-items:center`, `gap:12px 10px`)
		 * next to the host headline, and passes `size: 34`. It is therefore sized as
		 * a compact badge rather than a stacked block, so the headline stays on the
		 * same line as the board shows.
		 * @returns the assistant badge.
		 */
		function EloizeHero() {
			return React.createElement(
				"span",
				{
					className: "eloize-hero-badge",
					[BADGE_INLINE_MARKER]: "1",
					style: BADGE_STYLE.root,
				},
				React.createElement(
					"span",
					{ style: BADGE_STYLE.ring },
					React.createElement(
						"span",
						{ style: BADGE_STYLE.ringInner },
						React.createElement(EloizeMark, { size: 20 }),
					),
				),
				React.createElement(
					"span",
					{ className: "eloize-hero-badge-text", style: BADGE_STYLE.text },
					React.createElement("span", { style: BADGE_STYLE.name }, PRODUCT_NAME),
					React.createElement("span", { style: BADGE_STYLE.role }, HERO_ROLE_LINE),
				),
			);
		}
		//#endregion

		//#region theme
		/**
		 * Eloize palette and typography, expressed on the harness's own `--dsw-*`
		 * tokens so every existing component inherits the brand instead of being
		 * restyled component by component.
		 *
		 * Every colour here comes from `board-home-reference.html` (the authoritative
		 * source); the values previously taken from the PNG and from eloize.io are
		 * superseded. Two deliberate deviations, both confirmed with Aaron:
		 *
		 *  - The sidebar carries a soft pastel wash sampled from the brand asset
		 *    `Eloize logo and text.avif`, not the flat `#ffffff` in the reference table.
		 *    It is painted onto `--dsw-specific-sidebar-fill`, which the sidebar module
		 *    uses as its only background, so the gradient lands on the sidebar surface
		 *    itself and every child row paints over it unchanged.
		 *  - Dark theme is intentionally left on stock DSH tokens: the demo is light-only,
		 *    so a dark override would be unverifiable code.
		 *
		 * The `@import` must stay the FIRST rule inside the <style> element - it is only
		 * honoured at the top of a stylesheet. Fonts are loaded from Google Fonts (the
		 * same origin the reference HTML uses); the fallback stack below keeps the surface
		 * legible if that request is unavailable.
		 */
		const PALETTE_CSS = [
			"@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');",

			// --- base surfaces -------------------------------------------------
			"body{",
			"--eloize-indigo:" + INDIGO + ";",
			"--eloize-ink:" + INK + ";",
			"--dsw-alias-bg-base:#ffffff!important;",
			"--dsw-alias-bg-layer-1:#faf9ff!important;",
			"--dsw-alias-bg-layer-2:#f4f2fb!important;",
			"--dsw-alias-bg-overlay:#ffffff!important;",

			// --- borders -------------------------------------------------------
			"--dsw-alias-border-l1:#ebe8f5!important;",
			"--dsw-alias-border-l2:#e6e2f4!important;",

			// --- text ----------------------------------------------------------
			"--dsw-alias-label-primary:#1d1b26!important;",
			"--dsw-alias-label-secondary:#5c586b!important;",
			"--dsw-alias-label-tertiary:#5c586b!important;",
			"--dsw-alias-label-caption:#6b6780!important;",

			// --- accent --------------------------------------------------------
			// Drives solid CTAs: the host derives --dsw-alias-button-primary-fill
			// from --dsw-alias-brand-primary, so one token restyles every primary
			// button with no markup selector.
			"--dsw-alias-brand-primary:#4b37e0!important;",
			"--dsw-alias-button-primary-hover:#3a28c4!important;",
			"--dsw-alias-link:#4b37e0!important;",

			// The send arrow, and every other "business state" accent, is painted with
			// --dsw-alias-state-business-primary, whose stock value is
			// var(--dsw-static-deepseek-500) - the DeepSeek blue. Aaron asked for the
			// Eloize purple EVERYWHERE that token is used, so it is overridden globally
			// here rather than scoped to the composer.
			"--dsw-alias-state-business-primary:#4b37e0!important;",
			"--dsw-alias-state-business-tertiary:#f0edfe!important;",
			"--dsw-alias-label-primary-bluish:#4b37e0!important;",

			// The user's own message bubble is the ONLY surface painted with
			// --dsw-specific-bubble (stock light value #edf3fe, a pale blue). Aaron asked for
			// the Eloize purple, so it takes the same solid INDIGO as the send arrow and the
			// primary buttons. Deliberately the shared token rather than a rule on the chat
			// bubble's class: the goal plugin's user-style bubble reads the same token, and
			// overriding it here is what keeps the two identical with nothing left to drift.
			"--dsw-specific-bubble:" + INDIGO + "!important;",
			// The bubble's own rule paints its text with --dsw-alias-label-primary (dark ink),
			// which is unreadable on the purple, so the bubble text is forced white. Scoped to
			// the bubble element: the per-message action icons and the reference summary are
			// SIBLINGS of the bubble rather than children, so they keep their own colours, and
			// children carrying their own colour (inline chips) keep it too.
			"[class*='_bubble']{color:#ffffff!important;}",

			// --- interaction ---------------------------------------------------
			"--dsw-alias-interactive-bg-hover:#f0edfe!important;",
			"--dsw-alias-interactive-bg-active:#f0edfe!important;",
			"--dsw-alias-interactive-bg-hover-solid:#f0edfe!important;",
			"--dsw-specific-sidebar-nav-item-active:#f0edfe!important;",
			"--dsw-specific-sidebar-nav-item-hover:#f0edfe!important;",
			"--dsw-specific-sidebar-nav-item-active-accent:#2a1f8f!important;",

			// --- sidebar: light purple fading to white ----------------------------
			// Deliberately gentle: a light lavender that fades toward white so the sidebar
			// stays low-contrast against the rest of the light UI, while still reading as the
			// brand purple. Aaron asked for this after the first, much stronger purple.
			"--dsw-specific-sidebar-fill:"
				+ "linear-gradient(180deg, #ffffff 0%, #f7f3ff 14%, #eee7ff 44%, #e0d6ff 74%, #d2c4fb 100%)"
				+ "!important;",
			"}",

			// The surface is LIGHT, so the sidebar's own text stays in the dark ink the host
			// already uses. A token override alone is not enough: the body rules above carry
			// `!important`, so these sidebar-scoped values have to match that weight.
			// `[class*='hHd-']` is the sidebar module's hash prefix - a stable substring,
			// not a full hashed class name. Muted steps are a purple-tinted grey so they
			// still read against the lavender rather than the flat grey used on white.
			"[class*='hHd-']{color:#241c4a!important;}",
			"[class*='hHd-'] [class*='_sectionLabel']{color:rgba(60,48,110,0.72)!important;}",
			"[class*='hHd-'] [class*='_sectionHeader']{color:rgba(60,48,110,0.72)!important;}",
			"[class*='hHd-'] [class*='_row']:hover,[class*='hHd-'] [class*='_list'] [class*='_row']:hover{background:rgba(255,255,255,0.55)!important;}",
			"[class*='hHd-'] [class*='_iconButton']{color:#3c2f6e!important;}",
			"[class*='hHd-'] [class*='_iconButton']:hover{background:rgba(255,255,255,0.62)!important;}",

			// --- chat area: the soft pastel wash, moved off the sidebar -----------
			// Sampled from `Eloize logo and text.avif`: lavender upper corners, a pink bloom
			// centre-left and a rose-peach wash across the lower half. The base layer stays
			// white so message text keeps its contrast.
			"[class*='wSkVaW_root']{"
				+ "background-image:"
				+ "radial-gradient(127% 57% at 95% 2%, rgba(213,204,254,0.85) 0%, rgba(213,204,254,0) 68%),"
				+ "radial-gradient(126% 58% at 3% 84%, rgba(249,207,214,0.82) 0%, rgba(249,207,214,0) 70%),"
				+ "radial-gradient(122% 52% at 6% 2%, rgba(226,211,252,0.62) 0%, rgba(226,211,252,0) 66%),"
				+ "linear-gradient(173deg, #ece1fa 0%, #ffffff 40%, #ffffff 58%, #fae4ed 100%)"
				+ "!important;"
				+ "}",
			// The scroll body and composer seat must not paint over it.
			"[class*='wSkVaW_scrollBody'],[class*='wSkVaW_body']{background-color:transparent!important;}",

			// --- typography ----------------------------------------------------
			// Headings in Sora, body in Manrope, per the authoritative reference.
			"h1,h2,h3,h4,h5,h6,strong,b{",
			"font-family:'Sora',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;",
			"}",
			"body,button,input,textarea,select{",
			"font-family:'Manrope',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;",
			"}",
			"code,pre,kbd,samp{",
			"font-family:ui-monospace,'SF Mono','Cascadia Mono',Consolas,monospace;",
			"}",

			// --- offline-mode logos (pass 3) --------------------------------------
			// Scoped to the flag the confidential plugin sets, so normal-mode logos
			// are byte-for-byte untouched. Only the two surfaces below are styled.
			//
			// Home hero badge: the ring comes off (transparent background, no shadow,
			// no inner disc) and the mark swaps to the shield, which keeps the same
			// 44px box so the badge cannot shift when the toggle flips.
			"body[" + MODE_ATTR + "=\"on\"] ." + RING_CLASS + "{width:auto !important;height:auto !important;background:none !important;box-shadow:none !important;border-radius:0 !important;}",
			"body[" + MODE_ATTR + "=\"on\"] ." + RING_CLASS + " > span{background:none !important;width:auto !important;height:auto !important;border-radius:0 !important;}",
			"body[" + MODE_ATTR + "=\"on\"] ." + MARK_CLASS + "{display:none !important;}",
			"." + SHIELD_CLASS + "{display:none;}",
			"body[" + MODE_ATTR + "=\"on\"] ." + SHIELD_CLASS + "{display:block !important;}",
			// Sidebar brand row: the padlock is WHITE in the mode, matching the whitened
			// wordmark. Pinned with !important because the wordmark's inline colour and
			// the mode's own sidebar rules both target the row the padlock now sits in,
			// and the padlock inherits `currentColor`.
			"." + PADLOCK_CLASS + "{color:#ffffff !important;}",
			// The host renders its OWN hero headline (fish + "Into the Unknown" +
			// "Preview") and an empty body, and either keeps or unmounts them depending
			// on a boot race. Our injected header (data-eloize-hero) owns the badge +
			// headline + subline, so the host's headline and body are hidden so a
			// duplicated greeting can never appear regardless of which side wins the race.
			".pXSMma_stack > .pXSMma_headline, .pXSMma_stack > .pXSMma_body{display:none !important;}",
			"::-webkit-scrollbar-thumb{border-radius:9999px;}",
		].join("");

		/** Inject the brand palette once, keyed by a stable tag id so HMR never duplicates it. */
		function installPalette() {
			const tagId = "@eloize/dsh-branding/palette.css";
			if (typeof document === "undefined") return;
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@eloize/dsh-branding";
			tag.dataset.pluginCss = tagId;
			tag.textContent = PALETTE_CSS;
			document.head.appendChild(tag);
		}

		/**
		 * The shared Eloize button style (Step 3 v4 plan, section 2, adapted from the
		 * Uiverse "Codecite" button). Owned by the branding plugin because it owns
		 * the brand gradient; other plugins only add class names. With branding
		 * off, the class rules are gone and the buttons keep the host look.
		 *
		 * Variables:
		 *  - --eloize-grad-on: the Upload transcript card's 135deg gradient, with
		 *    the lightest stop darkened (#9b7bf7 -> #7a57f2) so the WHITE label
		 *    reaches 4.5:1 on it (the plan's "darken that stop for buttons only").
		 *  - --eloize-glow-on: that gradient's end stop at 50% alpha.
		 *  - --eloize-purple: brand purple (#4b37e0; 6.8:1 on white).
		 *  - --eloize-purple-35: brand purple at 35% alpha.
		 *  - --eloize-glow-off: brand purple at 20% alpha.
		 *  - --eloize-focus: brand purple normally, #fff under the confidential
		 *    mode attribute (the attribute the confidential plugin sets).
		 *
		 * Rules: no `transition: all`, no external font or URL (offline mode makes
		 * no web requests), 16px inline SVG icons, aria-pressed toggles,
		 * aria-busy while working, reduced motion respected.
		 */
		const BUTTON_CSS = [
			"body{",
			"--eloize-grad-on:linear-gradient(135deg,#6d4cf0 0%,#7a57f2 100%);",
			"--eloize-glow-on:rgba(122,87,242,0.5);",
			"--eloize-purple:#4b37e0;",
			"--eloize-purple-35:rgba(75,55,224,0.35);",
			"--eloize-glow-off:rgba(75,55,224,0.2);",
			"--eloize-focus:#4b37e0;",
			"}",
			"body[data-eloize-confidential-mode=\"on\"]{--eloize-focus:#ffffff;}",
			".eloize-btn{",
			"display:inline-flex;align-items:center;gap:6px;",
			"height:32px;padding:0 14px;border-radius:999px;",
			"border:1px solid transparent;font:inherit;font-size:13px;font-weight:600;",
			"cursor:pointer;",
			"transition:transform .3s ease-in-out,box-shadow .3s ease-in-out,opacity .3s ease-in-out;",
			"}",
			".eloize-btn--on{background-image:var(--eloize-grad-on);color:#fff;",
			"box-shadow:0 10px 16px -6px var(--eloize-glow-on);}",
			".eloize-btn--off{background-image:linear-gradient(135deg,#fff 0%,#ede9fe 100%);",
			"color:var(--eloize-purple);border-color:var(--eloize-purple-35);",
			"box-shadow:0 10px 16px -6px var(--eloize-glow-off);}",
			".eloize-btn:hover:not([aria-disabled=\"true\"]){transform:translateY(3px);box-shadow:none;}",
			".eloize-btn:active:not([aria-disabled=\"true\"]){opacity:.5;}",
			".eloize-btn:focus-visible{outline:2px solid var(--eloize-focus);outline-offset:2px;}",
			".eloize-btn[aria-disabled=\"true\"]{cursor:default;}",
			"@media (prefers-reduced-motion: reduce){",
			".eloize-btn{transition:none;}",
			".eloize-btn:hover:not([aria-disabled=\"true\"]){transform:none;}",
			"}",
		].join("");

		/** Inject the .eloize-btn sheet once, keyed by a stable tag id. */
		function installButtons() {
			const tagId = "@eloize/dsh-branding/buttons.css";
			if (typeof document === "undefined") return;
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@eloize/dsh-branding";
			tag.dataset.pluginCss = tagId;
			tag.textContent = BUTTON_CSS;
			document.head.appendChild(tag);
		}

		/**
		 * Set the browser tab title, and restore it when the plugin is withdrawn.
		 *
		 * The shipped title is baked into the shared frontend dist as static HTML
		 * (`<title>DeepSeek Harness</title>`), and both profiles serve that same
		 * dist, so it must not be edited on disk. Owning it from this profile-scoped
		 * plugin is what keeps 3080 on the default title.
		 *
		 * The host rewrites the title whenever a session opens ("<title> — DeepSeek
		 * Harness") or the view returns home ("DeepSeek Harness"), so a one-shot
		 * write is not enough: a watcher on the <title> element re-applies the
		 * Eloize brand to every rewrite - "<title> — Eloize" in chats, "Eloize" on
		 * the home - and is idempotent (a rewrite that already carries the brand
		 * writes nothing, so the watcher can never loop).
		 * @returns a disposer restoring the previous title.
		 */
		function titleFor(current) {
			const suffix = " \u2014 DeepSeek Harness";
			if (current === "DeepSeek Harness") return PRODUCT_NAME;
			if (current.endsWith(suffix)) return current.slice(0, current.length - suffix.length) + " \u2014 " + PRODUCT_NAME;
			return current;
		}

		function installTitle() {
			if (typeof document === "undefined") return () => {};
			const previous = document.title;
			const apply = () => {
				const wanted = titleFor(document.title);
				if (wanted !== document.title) document.title = wanted;
			};
			apply();
			let observer = null;
			if (typeof MutationObserver !== "undefined" && typeof document.querySelector === "function") {
				const titleElement = document.querySelector("title");
				if (titleElement !== null && titleElement !== undefined) {
					observer = new MutationObserver(() => apply());
					observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
				}
			}
			return () => {
				if (observer !== null) observer.disconnect();
				document.title = previous;
			};
		}
		//#endregion

		/** Required service: the UI slot registry. */
		const inject = ["slots"];

		/**
		 * Occupy the Eloize brand surfaces as one declaration-aware set, the same
		 * composition route the shipped official brand package uses.
		 *
		 * `sidebar.brand.mark` and `sidebar.brand.name` are single-kind slots, so the
		 * profile disables the official occupant row (`ui-brand-official`) in
		 * `cordis.patch.yml` rather than stacking a second occupant.
		 * `conversation.hero.brand.mark` is left vacant by the official package, so
		 * taking it removes the animated fish hero on this profile only.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			installPalette();
			installButtons();
			ctx.effect(() => installTitle());

			// The hero badge must sit ABOVE the headline, but the host renders the
			// `conversation.hero.brand.mark` seat inline inside the headline flex row, so a
			// slot occupant cannot achieve that placement. The slot is still occupied (which
			// is what displaces the official fish); the visible badge is a DOM node placed
			// above the headline, kept in step by an observer because `apply` is activated
			// immediately and the hero does not exist yet.
			ctx.effect(() => installHeroBadgeWatcher());

			ctx.slots.inject("sidebar.brand.mark", () =>
				ctx.slots.inject("sidebar.brand.name", function* () {
					yield ctx.slots.register({ name: "sidebar.brand.mark" }, EloizeMark);
					yield ctx.slots.register({ name: "sidebar.brand.name" }, EloizeWordmark);
				}),
			);

			ctx.slots.inject("conversation.hero.brand.mark", function* () {
				yield ctx.slots.register({ name: "conversation.hero.brand.mark" }, EloizeHero);
			});
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});
