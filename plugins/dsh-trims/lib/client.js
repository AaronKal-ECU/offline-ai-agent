window.__ModuleLoader__.load({
	id: "@eloize/dsh-trims",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		//#region copy and constants
		/**
		 * Generation stamp for this plugin's stylesheet tag.
		 *
		 * BUMP THIS whenever the hidden set or any rule below changes shape. The
		 * client bundle is hot-swapped without a page reload and a swap does NOT
		 * clean up after the previous bundle: its <style> element stays in the
		 * document. With a fixed id the new bundle would be skipped as "already
		 * installed" and the OLD rules would keep winning on equal specificity.
		 *
		 * 1 = pass 1 of the demo-day trim set. What this plugin hides:
		 *   - the chat box's "+" button (the command/slash menu launcher), which
		 *     frees the commands plugin's own menu from needing the in-mode filter;
		 *   - the access dropdown (the host permission select: Full access /
		 *     Read Only / Project Write) in the composer;
		 *   - the mode dropdown (the host agent-preset seat: "Standard mode" in
		 *     normal mode, the confidential preset in offline mode) in the composer.
		 *
		 * All three are CSS hides with no listener and no state change, so every
		 * plugin behind them keeps working: the host permission preset stays on
		 * whatever it is set to (Full access on this demo machine) and every
		 * session keeps the agent preset it was created with. In offline mode the
		 * preset is `eloize-confidential` because the confidential plugin's enter
		 * flow puts it there - this plugin never touches it.
		 *
		 * Scope note: the host renders the permission select in two places (the
		 * composer and the General-settings default row) and the agent-preset seat
		 * in the composer plus the settings section. Only the COMPOSER surfaces are
		 * hidden here, per Aaron's answer: the chat box loses these controls, the
		 * Settings screens keep theirs.
		 */
		const GENERATION = "1";

		/**
		 * The composer's "+" button.
		 *
		 * Its accessible name is the host locale string `input.commands` ("Commands"),
		 * verified in the shipped ui-conversation bundle. The paperclip button in the
		 * same tool row shares its hashed class but carries `file.attach` as its own
		 * accessible name, so the aria-label match is what keeps this to the "+" alone.
		 */
		const PLUS_SELECTOR = "button[aria-label=\"Commands\"]";

		/**
		 * The access dropdown: the host permission select's trigger.
		 *
		 * `Sh0Q9G_` is the permission-select module's own hash prefix (verified in the
		 * shipped ui-conversation bundle), so the stable-substring match survives a
		 * re-hash of the rest of the module. The settings row for the same preset uses
		 * a different module (`oY77xG_`), which is why that one is untouched.
		 */
		const ACCESS_SELECTOR = "[class*='Sh0Q9G_trigger']";

		/**
		 * The mode dropdown: the host agent-preset seat (the "Standard mode" chip).
		 *
		 * `cubgiG_` is the agent-preset seat module's hash prefix (verified in the
		 * shipped ui-agent-preset bundle). The settings section, the settings-card
		 * labels and the session-header label all live in other modules, so only the
		 * composer chip is caught by this.
		 *
		 * The seat hides while its own dropdown is closed; the popup it opens is
		 * rendered elsewhere and is unreachable once the chip is gone.
		 */
		const MODE_SELECTOR = "[class*='cubgiG_seat']";

		/**
		 * The whole hidden set, as one stylesheet.
		 *
		 * `!important` is deliberate and narrow: the host's own rules for these
		 * controls set `display:inline-flex`, and this sheet must win regardless of
		 * the order the host's sheets were injected in. Nothing else is styled, no
		 * colour and no geometry is touched, and both modes are covered because no
		 * rule here is scoped to a mode attribute.
		 */
		const TRIMS_CSS = [
			PLUS_SELECTOR + "{display:none !important;}",
			ACCESS_SELECTOR + "{display:none !important;}",
			MODE_SELECTOR + "{display:none !important;}",
		].join("");

		/** Stable id for the sheet, generation-stamped so hot swaps retire stale rules. */
		const STYLE_ID = "@eloize/dsh-trims/trims." + GENERATION + ".css";
		/** Prefix shared by every generation of this plugin's stylesheet tag. */
		const STYLE_PREFIX = "@eloize/dsh-trims/trims";
		//#endregion

		/**
		 * Inject the trims stylesheet, retiring earlier generations first.
		 *
		 * A hot-swapped bundle leaves its predecessor's sheet behind, so the prefix
		 * sweep runs before the "already installed" guard.
		 */
		function installStyles() {
			if (typeof document === "undefined") return;
			for (const tag of document.querySelectorAll("style[data-plugin-css^='" + STYLE_PREFIX + "']")) {
				if (tag.dataset.pluginCss !== STYLE_ID && tag.parentElement !== null) tag.parentElement.removeChild(tag);
			}
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@eloize/dsh-trims";
			tag.dataset.pluginCss = STYLE_ID;
			tag.textContent = TRIMS_CSS;
			document.head.appendChild(tag);
		}

		/** Remove this plugin's stylesheet. Called when the row is switched off. */
		function removeStyles() {
			if (typeof document === "undefined") return;
			for (const tag of document.querySelectorAll("style[data-plugin-css^='" + STYLE_PREFIX + "']")) {
				if (tag.parentElement !== null) tag.parentElement.removeChild(tag);
			}
		}

		/**
		 * Apply the Eloize demo trims.
		 *
		 * No service is injected: the whole trim is one stylesheet, so switching this
		 * plugin off removes the sheet and every hidden control comes straight back.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			installStyles();
			ctx.effect(() => removeStyles);
		}

		exports.apply = apply;
		return module.exports;
	},
});
