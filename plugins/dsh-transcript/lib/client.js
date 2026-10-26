window.__ModuleLoader__.load({
	id: "@eloize/dsh-transcript",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		//#region editable constants
		/**
		 * Generation stamp for every marker and style tag this plugin owns.
		 * Same rule as the other Eloize plugins: bump it whenever the injected markup
		 * or stylesheet changes shape, because a hot-swapped bundle does not clean up
		 * after its predecessor.
		 *
		 * 2 = fix pass: toast icon slot rebuilt (loader and tick share one fixed
		 * square), and the post-clean name sweep added.
		 * 3 = Push 2: the entry point no longer takes a caller's services object
		 * (the Confidential-mode inject trap: the confidential bundle's ctx gated
		 * remote.workspaceFiles, so every in-mode upload died at the first stat);
		 * every pipeline step logs [eloize-transcript] ok|FAILED; failures toast
		 * "Couldn't clean transcript (<step>)"; the whole run has a timeout; the
		 * busy state now covers .eloize-upload-control buttons (spinner +
		 * "Cleaning\u2026", aria-busy, disabled) and clears on every exit path.
		 * 4 = Push 3: the number backstop replaces runs of 8+ digits (groups
		 * split by single spaces or hyphens) with [ID] after the model's pass,
		 * and dollar amounts are escaped ($ -> \$) in the WRITTEN file so the
		 * right panel's math renderer shows them as plain text. The ids step
		 * joins the loud logging.
		 * 5 = Push 3.1: the shell's restored home CARD carries
		 * .eloize-upload-control (a real button), so the busy state must not
		 * double-handle it: cards WITH the control class are busy-swapped by
		 * the control path only (spinner + "Cleaning\u2026" replaces the whole
		 * content, aria-busy/disabled), while the stable data-eloize-busy
		 * flag still lands on every card so the shell's hover inversion stays
		 * gated during a run. Legacy title-swap support (cards without the
		 * class) is unchanged.
		 */
		const GENERATION = "5";

		/** Local model endpoint and call shape. Thinking is OFF for redaction. */
		const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
		const OLLAMA_MODEL = "Qwen3-8B-Q6_K";
		const OLLAMA_TEMPERATURE = 0;

		/** Only these extensions are processed; anything else gets the unsupported toast. */
		const SUPPORTED_EXTS = [".txt", ".md"];
		const PICKER_ACCEPT = ".txt,.md";
		const UNSUPPORTED_TOAST = "Only .txt and .md transcripts are supported";

		/** Busy copy shown while a run is in flight (Aaron's wording; shows on the toast and on the card title). */
		const BUSY_TEXT = "cleaning transcript securely..";
		/** Busy copy shown on the upload buttons while a run is in flight (Push 2 wording). */
		const BUTTON_BUSY_TEXT = "Cleaning\u2026";
		/** Success toast prefix; the folder title is appended. */
		const SUCCESS_TOAST_PREFIX = "Transcript cleaned \u00b7 saved to ";
		/** Failure toast prefix; the failing step is appended. */
		const FAILURE_TOAST_PREFIX = "Couldn't clean transcript (";

		/** Saved file suffix: <original-name>-clean.md, then -clean (2).md and so on. */
		const CLEAN_SUFFIX = "-clean";
		const CLEAN_EXT = ".md";

		/** Guards. */
		const MAX_CONTEXT_TOKENS = 40960;
		const MAX_OUTPUT_TOKENS = 8192;
		/** Headroom for the prompt itself, so the transcript alone never fills the window. */
		const PROMPT_TOKEN_HEADROOM = 512;
		const MIN_OUTPUT_RATIO = 0.7;

		/** How long the plugin waits for a session folder after the host picker flow. */
		const FOLDER_WAIT_MS = 20000;
		/**
		 * How long the WHOLE pipeline may take before it fails as a timeout.
		 * Covers every step after the pick (model calls, sweep, write): the busy
		 * toast and the busy button must clear even when nothing ever settles.
		 */
		const RUN_TIMEOUT_MS = 600000;

		/**
		 * The class every upload control carries (the shell's normal-mode pill and
		 * the confidential plugin's in-mode pill). The busy state swaps its content
		 * for a spinner + "Cleaning\u2026" while a run is in flight, whichever
		 * plugin owns the button - this bundle owns the pipeline, so it owns the
		 * busy state.
		 */
		const UPLOAD_CONTROL_CLASS = "eloize-upload-control";

		/** "+" menu registration. */
		const MENU_NAME = "upload-transcript";
		const MENU_LABEL = "Upload transcript";

		/**
		 * The redaction prompt. Edit freely; it is the single source of what the local
		 * model is asked to do. Identities only - money, dates, roles and products stay.
		 */
		const REDACTION_PROMPT = `You are redacting a meeting transcript for confidentiality. Your ONLY job is to return the full transcript word for word with sensitive identities replaced.

Use these exact placeholder tokens, WITH square brackets, and the same token every time (never numbered):
- a person's name -> [NAME]
- a business or organisation name -> [COMPANY]
- an email address -> [EMAIL]
- a phone number -> [PHONE]
- a street address -> [ADDRESS]
- an ABN, ACN, bank, card or other ID number -> [ACCOUNT]
This includes bank details: BSB numbers and account numbers each become [ACCOUNT] (for example "BSB 013-100, account 4821 3399" becomes "BSB [ACCOUNT], account [ACCOUNT]").
Replace EVERY business or organisation name, including the interviewer's own employer (for example "I'm Sarah from Eloize" becomes "I'm [NAME] from [COMPANY]").

Speaker labels: ONLY at the very start of a line, where a speaker's name appears before their words, replace the name with a role label in bold:
- anyone from the client's side (the people describing their business) -> **Client:**
- anyone from the Eloize side (the interviewer running the session) -> **Speaker:**
The interviewer is usually the one asking the questions and running the session. If several client people speak, every one of them is **Client:**.
Role labels NEVER appear inside the dialogue. Every name mentioned inside a line - addressed, referred to, or self-introduced - becomes [NAME] with the brackets. Never write **NAME**, and never use a role label in the middle of a line.

Example:
Input:
Alice Example: Thanks for making time, Bob.
Bob Sample: Sure. We made $10k at Acme in June.
Output:
**Speaker:** Thanks for making time, [NAME].
**Client:** Sure. We made $10k at [COMPANY] in June.

Keep everything else EXACTLY word for word. Do not change or omit:
- dollar amounts, revenue figures and prices
- dates and times
- suburbs and cities that are not part of a street address
- job titles and roles
- product names
- the conversation itself, its line breaks and formatting

Return ONLY the redacted transcript. No summary, no commentary, no notes, nothing before the first speaker line and nothing after the last.`;

		/**
		 * The name-sweep extraction prompt (fix pass B). Editable like the redaction
		 * prompt. It asks the local model to LIST the identities still present in the
		 * cleaned text, never to rewrite it, and the reply is structured with
		 * EXTRACTION_FORMAT so the output is machine-readable.
		 */
		const EXTRACTION_PROMPT = `You are checking an already-redacted meeting transcript for identities that are STILL visible as plain text.

List ONLY two kinds of things:
- names: real people's names still written in the text
- companies: business or organisation names still written in the text

Rules:
- Ignore everything inside square brackets - those are already-redacted placeholders.
- Ignore role labels at the start of a line, like "Speaker:" or "Client:".
- Do NOT list: acronyms and jargon (for example AI, ATO, ASIC, PDF, ELS, ABCD), government bodies and regulators, states and cities, months and days, dollar figures, percentages, counts, job titles, and product names.
- Do list every remaining identity, including names mentioned inside sentences, possessive names like "Joel's", and names written in ALL CAPS.

Return ONLY a JSON object with exactly this shape, nothing else:
{"names": ["..."], "companies": ["..."]}
Use empty arrays when nothing is left.`;

		/** Ollama structured-output schema for the extraction call. */
		const EXTRACTION_FORMAT = {
			type: "object",
			properties: {
				names: { type: "array", items: { type: "string" } },
				companies: { type: "array", items: { type: "string" } },
			},
			required: ["names", "companies"],
		};

		/**
		 * Bundled common first-names list for the deterministic backstop (fix pass B).
		 * Offline by construction - it ships inside this bundle and makes no network
		 * call at runtime. Matched only against tokens in Title Case or ALL CAPS, and
		 * never against the stoplist or the keep list below.
		 */
		const COMMON_FIRST_NAMES = [
			"Abby", "Abigail", "Adam", "Adrian", "Aidan", "Aiden", "Alan",
			"Alex", "Alexandra", "Alice", "Alison", "Amanda", "Amelia", "Amy",
			"Andrea", "Andrew", "Andy", "Angela", "Angus", "Anna", "Anne", "Anthony",
			"Archie", "Ash", "Ashley", "Audrey", "Ava", "Barbara", "Barry", "Bec",
			"Ben", "Benjamin", "Bernie", "Beth", "Bethany", "Bianca", "Blake", "Bob",
			"Brad", "Bradley", "Brendan", "Brett", "Brianna", "Bridget", "Bronwyn",
			"Brooke", "Bruce", "Caitlin", "Caleb", "Callum", "Cameron", "Candice",
			"Carla", "Carl", "Carmen", "Carol", "Caroline", "Casey", "Cassie",
			"Catherine", "Cathy", "Charlotte", "Chelsea", "Chloe", "Chris",
			"Christian", "Christine", "Christopher", "Cindy", "Claire", "Claudia",
			"Colin", "Connor", "Corey", "Courtney", "Craig", "Crystal", "Damien",
			"Dan", "Dana", "Daniel", "Danielle", "Danny", "Darcy", "Darlene",
			"Darren", "Dave", "David", "Dean", "Deb", "Debbie", "Deborah", "Debra",
			"Declan", "Denise", "Dennis", "Derek", "Diana", "Diane", "Dianne",
			"Dominic", "Donna", "Doug", "Douglas", "Dylan", "Eddie", "Edward",
			"Eleanor", "Eliza", "Elizabeth", "Ella", "Elliot", "Emily", "Emma",
			"Eric", "Erin", "Ethan", "Eva", "Evan", "Evelyn", "Felicity", "Fiona",
			"Flynn", "Frances", "Fraser", "Fred", "Freya", "Gabrielle", "Gail",
			"Garry", "Gary", "Gavin", "Gemma", "Geoff", "Geoffrey", "George",
			"Georgia", "Geraldine", "Gina", "Glen", "Glenn", "Gordon", "Grace",
			"Graham", "Greg", "Gregory", "Gus", "Hamish", "Hannah", "Harry",
			"Harvey", "Hayden", "Hayley", "Hazel", "Heather", "Heidi", "Helen",
			"Henry", "Holly", "Hugh", "Hugo", "Hunter", "Ian", "Imogen", "Irene",
			"Isaac", "Isabel", "Isabella", "Isabelle", "Jack", "Jackson", "Jacob",
			"Jade", "Jake", "James", "Jamie", "Jan", "Jane", "Janet", "Janine",
			"Jared", "Jasmine", "Jason", "Jasper", "Jayden", "Jean", "Jen", "Jenna",
			"Jennifer", "Jenny", "Jeremy", "Jess", "Jesse", "Jessica", "Jessie",
			"Jill", "Jim", "Jo", "Joan", "Joanne", "Jodie", "Joe", "Joel", "John",
			"Jon", "Jonathan", "Jordan", "Joseph", "Josh", "Joshua", "Joyce", "Jude",
			"Judith", "Judy", "Julia", "Julian", "Julie", "Justin", "Kai", "Karen",
			"Karly", "Kate", "Katherine", "Kathleen", "Kathryn", "Katie", "Katrina",
			"Kay", "Kayla", "Keith", "Kelly", "Ken", "Kendra", "Kerry", "Kevin",
			"Kim", "Kylie", "Lachlan", "Lance", "Lara", "Larry", "Laura", "Lauren",
			"Laurie", "Lawrence", "Layla", "Leah", "Leanne", "Lee", "Leigh", "Leo",
			"Leon", "Lesley", "Leslie", "Levi", "Liam", "Lillian", "Lily", "Lincoln",
			"Linda", "Lindsay", "Lisa", "Liz", "Logan", "Lorraine", "Louise", "Lucas",
			"Lucy", "Luke", "Lydia", "Lyn", "Lynda", "Lynette", "Maddie", "Maddison",
			"Madeleine", "Madison", "Maeve", "Maggie", "Malcolm", "Mandy", "Marcus",
			"Margaret", "Margot", "Maria", "Marie", "Marilyn", "Marion", "Marjorie",
			"Marnie", "Martin", "Marty", "Mary", "Matilda", "Matt", "Matthew", "Maya",
			"Megan", "Mel", "Melanie", "Melissa", "Meredith", "Mia", "Michael",
			"Michelle", "Mike", "Millie", "Miranda", "Mitchell", "Molly", "Monique",
			"Morgan", "Naomi", "Nat", "Natalie", "Nathan", "Neil", "Neville",
			"Nicholas", "Nick", "Nicola", "Nicole", "Nigel", "Nina", "Noah", "Noel",
			"Nora", "Norm", "Norman", "Oliver", "Olivia", "Oscar", "Owen", "Paige",
			"Pam", "Pamela", "Patricia", "Patrick", "Paul", "Paula", "Pauline",
			"Penny", "Peter", "Phil", "Philip", "Philippa", "Phoebe", "Piper",
			"Poppy", "Rachel", "Ralph", "Raymond", "Rebecca", "Reece", "Renee", "Rex",
			"Rhys", "Richard", "Rick", "Ricky", "Riley", "Rob", "Robert", "Roberta",
			"Robin", "Robyn", "Rochelle", "Rodney", "Roger", "Ron", "Ronald", "Rory",
			"Roslyn", "Ross", "Rowan", "Ruby", "Russell", "Ruth", "Ryan", "Sally",
			"Sam", "Samantha", "Samuel", "Sandra", "Sandy", "Sarah", "Sasha",
			"Savannah", "Scarlett", "Sean", "Sebastian", "Shane", "Shannon",
			"Sharon", "Shaun", "Shayne", "Shelley", "Sheryl", "Sian", "Simon",
			"Simone", "Skye", "Sonia", "Sophie", "Stacey", "Stanley", "Stella",
			"Steph", "Stephanie", "Stephen", "Steve", "Steven", "Stuart", "Susan",
			"Susannah", "Suzy", "Tamara", "Tanya", "Tara", "Taylor", "Terry", "Theo",
			"Thomas", "Tiffany", "Tim", "Timothy", "Tina", "Toby", "Tom", "Tony",
			"Tracey", "Tracy", "Travis", "Trent", "Trevor", "Tricia", "Trish",
			"Troy", "Tyler", "Vanessa", "Vera", "Vicki", "Vicky", "Victor",
			"Victoria", "Vince", "Vincent", "Violet", "Wade", "Walter", "Warwick",
			"Wayne", "Wendy", "William", "Willow", "Wilson", "Xavier", "Yasmin",
			"Yvonne", "Zac", "Zach", "Zachary", "Zoe", "Zara",
		];

		/**
		 * Ambiguity stoplist (fix pass B): first names that are also everyday words.
		 * The backstop never replaces these on its own; it replaces one only when the
		 * extraction call (step 1) explicitly flagged it as an identity. Months and
		 * days are excluded entirely from the names list above, and kept by
		 * EXTRACTION_KEEP below, so they can never be redacted.
		 */
		const AMBIGUOUS_NAME_STOPLIST = [
			// NOTE: every entry here is inert until it also appears in
			// COMMON_FIRST_NAMES below - the guard at buildSweepCandidates only ever
			// compares COMMON_FIRST_NAMES values against this list. "Jan" is the
			// month that IS in COMMON_FIRST_NAMES and is NOT covered here, so a
			// Title-Case "Jan" is currently redacted as a name.
			"Will", "May", "June", "April", "August", "Mark", "Grant", "Bill",
			"Rich", "Pat", "Hope", "Joy", "Faith", "Rose", "Summer", "Chase",
			"Drew", "Guy", "Frank", "Miles", "Ray", "Max", "Sunny", "Art", "Sue",
		];

		/**
		 * Eloize staff names (fix pass B). These are ALWAYS replaced, whatever the
		 * stoplist or the extraction call says. Edit freely.
		 */
		// EDIT ME: your own staff first names, always redacted by the backstop.
		const ALWAYS_REDACT = ["Alex", "Sam"];

		/**
		 * Entities the extraction call must never cause to be redacted (fix pass B):
		 * acronyms and jargon, government bodies, states and cities, months and days.
		 * Matched case-insensitively against each extracted entity before replacement.
		 */
		const EXTRACTION_KEEP = [
			"AI", "ATO", "ASIC", "WA", "Perth", "PDF", "ABCD", "ELS",
			"January", "February", "March", "April", "May", "June", "July",
			"August", "September", "October", "November", "December",
			"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
		];

		/** Marker attributes, stamped with the generation. */
		const TOAST_ATTR = "data-eloize-transcript-toast-" + GENERATION;
		const BUSY_ATTR = "data-eloize-transcript-busy-" + GENERATION;
		const PICKER_ATTR = "data-eloize-transcript-picker-" + GENERATION;
		const WIRED_ATTR = "data-eloize-transcript-wired-" + GENERATION;
		/**
		 * Every marker prefix this plugin has ever used, so an older bundle's nodes can
		 * be retired. The busy marker is deliberately absent: it is transient (cleared
		 * on every exit path) and sits on the shell plugin's card, which must never be
		 * removed by the retirement pass.
		 */
		const ALL_MARKER_PREFIXES = [
			"data-eloize-transcript-toast",
			"data-eloize-transcript-picker",
			"data-eloize-transcript-wired",
		];
		/** The shell plugin's upload-card marker; any generation is accepted (handover). */
		const CARD_MARKER_PREFIX = "data-eloize-upload";
		/** The shell card's title span, swapped for the busy copy while a run is in flight. */
		const CARD_TITLE_CLASS = "eloize-tiletitle";
		/** Stylesheet tag id and prefix, generation-keyed like the shell plugin's. */
		const STYLE_ID = "@eloize/dsh-transcript/transcript." + GENERATION + ".css";
		const STYLE_PREFIX = "@eloize/dsh-transcript/transcript";
		//#endregion

		//#region dom helpers
		/** True while the node is still rendered. */
		function isAttached(node) {
			if (node === null || node === undefined) return false;
			if (typeof document === "undefined") return false;
			return document.contains(node);
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

		/** Apply a style object as inline styles (inline beats a stale stylesheet). */
		function applyInlineStyle(node, style) {
			for (const key of Object.keys(style)) node.style[key] = style[key];
			return node;
		}

		/** Build an inline SVG from path specs. */
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

		//#region styles
		/**
		 * Stylesheet for what inline styles cannot express: the loader-cube keyframes
		 * Aaron supplied (Uiverse.io by mobinkakei), scaled down to toast size via the
		 * inline geometry on the cube elements themselves.
		 */
		const TRANSCRIPT_CSS = [
			"@keyframes eloize-loadtwo{50%{transform:rotate(-80deg)}}",
		].join("");

		/** Inject the stylesheet, retiring any earlier generation's sheet first. */
		function installStyles() {
			if (typeof document === "undefined") return;
			retireStaleStyles();
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@eloize/dsh-transcript";
			tag.dataset.pluginCss = STYLE_ID;
			tag.textContent = TRANSCRIPT_CSS;
			document.head.appendChild(tag);
		}

		/** Remove stylesheet tags left behind by an earlier generation of this plugin. */
		function retireStaleStyles() {
			if (typeof document === "undefined") return;
			for (const tag of document.querySelectorAll("style[data-plugin-css^='" + STYLE_PREFIX + "']")) {
				const id = tag.dataset.pluginCss;
				if (id !== STYLE_ID && tag.parentElement !== null) tag.parentElement.removeChild(tag);
			}
		}

		/** Remove nodes injected by an earlier generation of this plugin. */
		function retireStaleNodes() {
			if (typeof document === "undefined") return;
			for (const prefix of ALL_MARKER_PREFIXES) {
				const selectors = ["[" + prefix + "]"];
				for (let gen = 1; gen <= 20; gen++) {
					// Only OTHER generations are retired; the current one is live.
					if (String(gen) !== GENERATION) selectors.push("[" + prefix + "-" + gen + "]");
				}
				for (const selector of selectors) {
					const attr = selector.slice(1, -1);
					for (const node of document.querySelectorAll(selector)) {
						// A wired marker sits on the shell plugin's card; unwiring restores
						// its old listener-less state.
						if (prefix === "data-eloize-transcript-wired") node.removeAttribute(attr);
						else if (node.parentElement !== null) node.parentElement.removeChild(node);
					}
				}
			}
		}
		//#endregion

		//#region toast
		/** Inline geometry for the toast; inline so a stale sheet cannot restyle it away. */
		const TOAST_STYLE = {
			position: "fixed",
			bottom: "28px",
			left: "50%",
			transform: "translateX(-50%)",
			display: "flex",
			alignItems: "center",
			gap: "10px",
			background: "#241c4a",
			color: "#ffffff",
			borderRadius: "12px",
			padding: "10px 18px",
			fontFamily: "'Manrope',ui-sans-serif,system-ui,sans-serif",
			fontSize: "14px",
			fontWeight: "600",
			lineHeight: "20px",
			boxShadow: "0 8px 24px rgba(29,27,38,0.28)",
			zIndex: "99999",
			maxWidth: "min(90vw, 560px)",
			boxSizing: "border-box",
		};

		/**
		 * The supplied loader cube, sized for a toast (fix pass A). The gradient and
		 * the `eloize-loadtwo` keyframes stay verbatim as supplied; only the geometry
		 * changed: the loader is a real 20x20 relative box and both cube layers are
		 * pinned to it with inset:0, so they fill the slot exactly instead of being
		 * placed by their static position. No scale() and no centring transform - the
		 * slot centres the loader with flex/grid, and rotate in the keyframes is the
		 * only transform the animated layer ever carries.
		 */
		function busyCube() {
			const glowing = el("span", { class: "eloize-loader-cube--glowing" }, []);
			applyInlineStyle(glowing, {
				position: "absolute", inset: "0", borderRadius: "20%",
				backgroundColor: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)",
			});
			const color = el("span", { class: "eloize-loader-cube--color" }, []);
			applyInlineStyle(color, {
				position: "absolute", inset: "0", borderRadius: "20%",
				filter: "blur(1px)", background: "linear-gradient(135deg, #1afbf0, #da00ff)",
				animation: "eloize-loadtwo 2.5s ease-in-out infinite",
			});
			const loader = el("span", { class: "eloize-loader" }, [glowing, color]);
			applyInlineStyle(loader, { position: "relative", width: "20px", height: "20px", display: "block" });
			return loader;
		}

		/**
		 * The fixed square icon slot every toast state shares (fix pass A): 20x20,
		 * grid-centred. The 20px loader fills it while busy; the 18px tick and the
		 * 18px warning glyph sit centred in the same box, so when the tick replaces
		 * the loader it lands in exactly the same spot with no layout shift.
		 */
		function iconSlot(icon) {
			return el("span", { style: "flex:0 0 20px;width:20px;height:20px;display:grid;place-items:center;" }, [icon]);
		}

		/**
		 * Show one toast at the bottom of the screen. Success carries a tick, error a
		 * warning glyph, busy the loader cube; success and error dismiss after about
		 * five seconds, busy stays until the run clears it.
		 * @param text - the one-line copy.
		 * @param kind - "success", "error", "busy" or "clear".
		 */
		function showToast(text, kind) {
			if (typeof document === "undefined") return;
			const existing = document.querySelector("[" + TOAST_ATTR + "]");
			if (existing !== null && existing.parentElement !== null) existing.parentElement.removeChild(existing);
			if (kind === "clear") return;
			let icon;
			if (kind === "success") {
				icon = svg(
					{ width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "#34d399", "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round" },
					["M20 6L9 17l-5-5"],
				);
			} else if (kind === "error") {
				icon = svg(
					{ width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "#fbbf24", "stroke-width": 2.5, "stroke-linecap": "round" },
					["M12 9v4M12 17h.01", "M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"],
				);
			} else {
				icon = busyCube();
			}
			const toast = el("div", { [TOAST_ATTR]: "1", role: "status" }, [iconSlot(icon), el("span", { text: text })]);
			applyInlineStyle(toast, TOAST_STYLE);
			document.body.appendChild(toast);
			if (kind !== "busy") {
				setTimeout(() => {
					if (toast.parentElement !== null) toast.parentElement.removeChild(toast);
				}, 5000);
			}
		}

		/** One readable line from any thrown value. */
		function oneLineReason(reason) {
			if (reason === null || reason === undefined) return "Something went wrong";
			const message = typeof reason === "string" ? reason : String(reason.message ?? reason);
			const line = message.split("\n")[0].trim();
			return line === "" ? "Something went wrong" : line;
		}

		/** True when a rejection is a user cancellation rather than a fault. */
		function isCancellation(reason) {
			if (reason === null || reason === undefined) return true;
			const message = typeof reason === "string" ? reason : String(reason.message ?? "");
			const code = reason.code ?? (reason.error !== undefined ? reason.error.code : undefined);
			if (code === "cancelled" || code === "canceled" || code === "aborted") return true;
			return /cancel/i.test(message);
		}
		//#endregion

		//#region busy state on the shell's upload card
		/** Every shell upload card currently in the document, any generation. */
		function findAllUploadCards() {
			if (typeof document === "undefined") return [];
			const candidates = [];
			candidates.push(...document.querySelectorAll("[" + CARD_MARKER_PREFIX + "]"));
			for (let gen = 1; gen <= 20; gen++) {
				candidates.push(...document.querySelectorAll("[" + CARD_MARKER_PREFIX + "-" + gen + "]"));
			}
			return candidates.filter((card) => isAttached(card));
		}

		/** The shell plugin's upload card, whichever generation it was built with. */
		function findUploadCard() {
			return findAllUploadCards()[0] ?? null;
		}

		let busyTitle = null;
		let busyTitleOriginal = "";
		/** Upload controls currently swapped to the busy look, restored on clear. */
		const busyControls = [];

		/**
		 * Flip every upload surface to the busy state and back. The run's busy UI
		 * is owned here (this bundle owns the pipeline), so every exit path -
		 * success, error, timeout - goes through setBusy(false) once.
		 *
		 * Three surfaces:
		 *  1. shell cards WITHOUT the control class (legacy generations): the
		 *     title span swaps to the busy copy, and every card takes the
		 *     generation busy marker plus the stable data-eloize-busy flag the
		 *     shell stylesheet keys off;
		 *  2. shell cards WITH .eloize-upload-control (the Push 3.1 home card):
		 *     the stable busy flag + generation marker land on the card, and the
		 *     CONTENT swap is the control path's job (below) - the title swap
		 *     must skip these, or its mutation would be snapshotted into the
		 *     restored children and the card would keep the busy copy forever;
		 *  3. .eloize-upload-control buttons (the confidential sidebar button):
		 *     content swaps to the spinner + "Cleaning\u2026", aria-busy and
		 *     aria-disabled set, button disabled while running.
		 * @param on - whether a run is now in flight.
		 */
		function setBusy(on) {
			if (typeof document === "undefined") return;
			for (const card of findAllUploadCards()) {
				const hasControlClass = String(card.getAttribute("class") ?? "").split(/\s+/).includes(UPLOAD_CONTROL_CLASS);
				if (on) {
					// Control-class cards get ONLY the stable busy flag here: the
					// generation busy marker is the control path's own gate, and
					// setting it here would make the control loop skip the card
					// (it treats an already-marked control as already swapped).
					if (!hasControlClass && card.getAttribute(BUSY_ATTR) !== "1") card.setAttribute(BUSY_ATTR, "1");
					card.setAttribute("data-eloize-busy", "1");
					if (hasControlClass) continue;
					if (busyTitle === null) {
						const title = card.querySelector("." + CARD_TITLE_CLASS);
						if (title !== null) {
							busyTitle = title;
							busyTitleOriginal = title.textContent;
							title.textContent = BUSY_TEXT;
						}
					}
				} else {
					if (busyTitle !== null && busyTitle.parentElement !== null) busyTitle.textContent = busyTitleOriginal;
					busyTitle = null;
					busyTitleOriginal = "";
					card.removeAttribute(BUSY_ATTR);
					card.removeAttribute("data-eloize-busy");
				}
			}
			for (const control of document.querySelectorAll("." + UPLOAD_CONTROL_CLASS)) {
				if (!isAttached(control)) continue;
				if (on) {
					if (control.getAttribute(BUSY_ATTR) === "1") continue;
					control.setAttribute(BUSY_ATTR, "1");
					control.setAttribute("aria-busy", "true");
					control.setAttribute("aria-disabled", "true");
					try {
						control.disabled = true;
					} catch (reason) {
						// non-button controls have no disabled property
					}
					busyControls.push({ node: control, children: Array.prototype.slice.call(control.childNodes) });
					control.replaceChildren(busyCube(), document.createTextNode(BUTTON_BUSY_TEXT));
				} else {
					for (let i = busyControls.length - 1; i >= 0; i--) {
						if (busyControls[i].node !== control) continue;
						control.replaceChildren(...busyControls[i].children);
						busyControls.splice(i, 1);
					}
					control.removeAttribute(BUSY_ATTR);
					control.removeAttribute("aria-busy");
					control.removeAttribute("aria-disabled");
					try {
						control.disabled = false;
					} catch (reason) {
						// non-button controls have no disabled property
					}
				}
			}
		}
		//#endregion

		//#region pipeline
		/** Lowercased extension of a file name, with the dot, or "" when there is none. */
		function extensionOf(name) {
			const i = String(name).lastIndexOf(".");
			return i < 0 ? "" : String(name).slice(i).toLowerCase();
		}

		/** Read a picked file in the browser only; the bytes never leave memory to disk. */
		function readFileAsText(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result ?? ""));
				reader.onerror = () => reject(new Error("Could not read the file"));
				reader.readAsText(file);
			});
		}

		/**
		 * Deterministic Markdown conversion. Per Aaron: no heading and no date line are
		 * added. .md input passes through unchanged; .txt input only has its line
		 * endings normalised so paragraphs survive the model call intact.
		 */
		function toMarkdown(name, raw) {
			if (extensionOf(name) === ".md") return raw;
			return String(raw).replace(/\r\n?/g, "\n");
		}

		/** Rough token estimate; the guard only has to refuse what cannot fit. */
		function estimateTokens(text) {
			return Math.ceil(String(text).length / 4);
		}

		/** Ask the local model to redact; thinking off, temperature from the constant. */
		async function callOllama(markdown) {
			let response;
			try {
				response = await fetch(OLLAMA_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						model: OLLAMA_MODEL,
						stream: false,
						think: false,
						options: { temperature: OLLAMA_TEMPERATURE },
						prompt: REDACTION_PROMPT + "\n\nTranscript:\n" + markdown,
					}),
				});
			} catch (reason) {
				throw new Error("The local model could not be reached");
			}
			if (!response.ok) throw new Error("The local model returned HTTP " + response.status);
			let json;
			try {
				json = await response.json();
			} catch (reason) {
				throw new Error("The local model returned an unreadable reply");
			}
			let out = String(json.response ?? "");
			// Strip any thinking that still comes back despite think:false.
			out = out.replace(/<think[\s\S]*?<\/think>/g, "");
			return out.trim();
		}

		/** Base name of the clean file for one input name. */
		function cleanBaseName(name) {
			const dot = String(name).lastIndexOf(".");
			return (dot < 0 ? String(name) : String(name).slice(0, dot)) + CLEAN_SUFFIX + CLEAN_EXT;
		}

		//#region name sweep (fix pass B)
		/** Escape a string for safe use inside a RegExp. */
		function escapeRegExp(value) {
			return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}

		/**
		 * Sanitize one extracted entity for matching. Rejects empty/short values,
		 * anything without a letter, anything touching a placeholder, and the keep
		 * list (acronyms, regulators, places, months, days). Leading/trailing
		 * punctuation is trimmed so "Suzy." from a sentence end matches "Suzy".
		 */
		function sanitizeEntity(value) {
			const raw = String(value).trim().replace(/^[\s"'(\[.]+|[\s"')\].:;,!?]+$/g, "").trim();
			if (raw.length < 2) return null;
			if (!/[A-Za-z]/.test(raw)) return null;
			if (/[\[\]]/.test(raw)) return null;
			const lower = raw.toLowerCase();
			for (const keep of EXTRACTION_KEEP) {
				if (keep.toLowerCase() === lower) return null;
			}
			return raw;
		}

		/**
		 * Build the union of step 1 (the extraction call) and step 2 (the
		 * deterministic backstop), plus the ALWAYS_REDACT staff names. Deduped
		 * case-insensitively; a string flagged as both name and company is replaced
		 * as [NAME]. Backstop entries carry a source marker so the Title Case /
		 * ALL CAPS gate can be applied at match time; model and staff entries are
		 * replaced whatever their casing.
		 */
		function buildSweepCandidates(extracted) {
			const seen = new Map();
			const add = (entity, kind, source) => {
				const value = sanitizeEntity(entity);
				if (value === null) return;
				const key = value.toLowerCase();
				const existing = seen.get(key);
				if (existing === undefined || (existing.kind === "COMPANY" && kind === "NAME")) {
					seen.set(key, { entity: value, kind, source });
				}
			};
			for (const name of extracted.names) add(name, "NAME", "model");
			for (const company of extracted.companies) add(company, "COMPANY", "model");
			for (const name of ALWAYS_REDACT) add(name, "NAME", "staff");
			for (const name of COMMON_FIRST_NAMES) {
				if (AMBIGUOUS_NAME_STOPLIST.indexOf(name) >= 0) continue;
				if (seen.has(name.toLowerCase())) continue;
				add(name, "NAME", "backstop");
			}
			return [...seen.values()];
		}

		/**
		 * One deterministic replacement pass. Existing [PLACEHOLDER] tokens are
		 * matched first and returned untouched, so a candidate can never match inside
		 * one. Candidates are ordered longest first, so "Joel Smith" goes before
		 * "Joel". Matching is case-insensitive on word boundaries (non-alphanumeric
		 * lookarounds), which also keeps possessives intact: Joel's -> [NAME]'s and
		 * Joel's (curly apostrophe) -> [NAME]'s.
		 * @returns { text, replaced } - the replaced text and the number of hits.
		 */
		function sweepEntities(text, candidates) {
			const sorted = candidates.slice().sort((a, b) => b.entity.length - a.entity.length);
			if (sorted.length === 0) return { text, replaced: 0 };
			// Group 1 is the placeholder guard; every candidate is its own capture
			// group so the replacer can tell which one matched (and from which source).
			const parts = ["(\\[[A-Z][A-Z]*\\])"];
			for (const candidate of sorted) {
				const inner = escapeRegExp(candidate.entity).replace(/\s+/g, "\\s+");
				parts.push("(?<![A-Za-z0-9])(" + inner + ")(?![A-Za-z0-9])");
			}
			const matcher = new RegExp(parts.join("|"), "gi");
			let replaced = 0;
			const out = String(text).replace(matcher, (...args) => {
				const full = args[0];
				const groups = args.slice(1, args.length - 2);
				if (groups[0] !== undefined) return full; // existing [PLACEHOLDER] - untouched
				for (let i = 1; i < groups.length; i++) {
					if (groups[i] === undefined) continue;
					const candidate = sorted[i - 1];
					// Backstop names only match Title Case or ALL CAPS tokens; lowercase is ignored.
					if (candidate.source === "backstop" && !/^[A-Z]/.test(full)) return full;
					replaced += 1;
					return candidate.kind === "COMPANY" ? "[COMPANY]" : "[NAME]";
				}
				return full;
			});
			return { text: out, replaced };
		}

		/**
		 * Step 1: one short structured extraction call to the local model on the
		 * cleaned text. Thinking off, temperature 0, JSON-schema output via Ollama's
		 * `format`. Any failure throws - the caller falls back to the deterministic
		 * steps 2-4 and still saves the file.
		 */
		async function callOllamaEntities(markdown) {
			let response;
			try {
				response = await fetch(OLLAMA_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						model: OLLAMA_MODEL,
						stream: false,
						think: false,
						format: EXTRACTION_FORMAT,
						options: { temperature: OLLAMA_TEMPERATURE },
						prompt: EXTRACTION_PROMPT + "\n\nTranscript:\n" + markdown,
					}),
				});
			} catch (reason) {
				throw new Error("entity extraction could not reach the local model");
			}
			if (!response.ok) throw new Error("entity extraction returned HTTP " + response.status);
			let json;
			try {
				json = await response.json();
			} catch (reason) {
				throw new Error("entity extraction returned an unreadable reply");
			}
			let out = String(json.response ?? "").replace(/<think[\s\S]*?<\/think>/g, "").trim();
			if (out === "") throw new Error("entity extraction returned nothing");
			let parsed = null;
			try {
				parsed = JSON.parse(out);
			} catch (reason) {
				const block = /\{[\s\S]*\}/.exec(out);
				if (block !== null) {
					try {
						parsed = JSON.parse(block[0]);
					} catch (reason2) {
						parsed = null;
					}
				}
			}
			if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
				throw new Error("entity extraction returned invalid JSON");
			}
			const names = Array.isArray(parsed.names)
				? parsed.names.filter((item) => typeof item === "string").map((item) => item.trim()).filter((item) => item !== "")
				: [];
			const companies = Array.isArray(parsed.companies)
				? parsed.companies.filter((item) => typeof item === "string").map((item) => item.trim()).filter((item) => item !== "")
				: [];
			return { names, companies };
		}

		/**
		 * The whole sweep, run after the clean pass and after the 70% length guard:
		 * 1) extraction call, 2) deterministic backstop, 3) deterministic replace,
		 * 4) re-check. The entity list exists in memory only - only counts are logged
		 * (by the caller, under the pipeline's step logging), never the names
		 * themselves. When the extraction call errors, steps 2-4 still run and the
		 * cleaned file is still saved.
		 * @returns { text, replaced, extractionFailed }.
		 */
		async function nameSweep(cleaned) {
			let extracted = { names: [], companies: [] };
			let extractionFailed = false;
			try {
				extracted = await callOllamaEntities(cleaned);
			} catch (reason) {
				extractionFailed = true;
			}
			let text = cleaned;
			let total = 0;
			for (let pass = 0; pass < 3; pass++) {
				const result = sweepEntities(text, buildSweepCandidates(extracted));
				text = result.text;
				total += result.replaced;
				if (result.replaced === 0) break;
			}
			return { text, replaced: total, extractionFailed };
		}
		//#endregion

		//#region number backstop + dollar escape (Push 3, upload only)
		/**
		 * The number backstop (Push 3): after Qwen's pass, replace any run of
		 * 8+ digits whose groups are split by SINGLE spaces or hyphens with
		 * [ID] - ABNs, account numbers and phone numbers the model left behind.
		 *
		 * The regex matches digits plus single spaces/hyphens only, so a match can
		 * never itself contain a comma, a decimal point or a currency sign: grouped
		 * figures ("$1,420,000") and short numbers (2026) are never touched, and a
		 * leading "$" is skipped by the adjacency test below so "$14200000" survives.
		 * KNOWN GAP: a run immediately ADJACENT to a comma or a decimal point is still
		 * replaced ("12345678.90" -> "[ID].90"); that adjacency is not tested.
		 * Existing [PLACEHOLDER] tokens contain no digits and pass through.
		 * @returns { text, replaced } - the scrubbed text and the hit count.
		 */
		function numberBackstop(text) {
			let replaced = 0;
			const out = String(text).replace(/[0-9]+(?:[ -][0-9]+)+|[0-9]{8,}/g, (match, offset, whole) => {
				const digits = match.replace(/[^0-9]/g, "");
				if (digits.length < 8) return match;
				if (offset > 0 && whole.charAt(offset - 1) === "$") return match;
				replaced += 1;
				return "[ID]";
			});
			return { text: out, replaced };
		}

		/**
		 * Escape dollar signs in the WRITTEN file (Push 3): the right panel's
		 * markdown preview treats $...$ as inline maths, so "$1.42m, up from
		 * $980k" rendered as italic "1.42m,upfrom980k". The renderer is baked
		 * into the shared frontend and no plugin surface reaches it, so the
		 * escape happens here, at write time: \$ renders as a literal $ in
		 * every markdown renderer and never opens a maths span. The raw
		 * transcript in memory is never touched.
		 */
		function escapeDollars(text) {
			return String(text).replace(/\$/g, "\\$");
		}
		//#endregion

		/** The numbered variant: <base>-clean (2).md and so on. */
		function numberedName(base, n) {
			return base.slice(0, base.length - CLEAN_EXT.length) + " (" + n + ")" + CLEAN_EXT;
		}

		/**
		 * First free name in the session folder: <name>-clean.md, then -clean (2).md...
		 * Existence is checked through the workspace-files stat; only a not-found result
		 * counts as free, any other failure is surfaced rather than risking an overwrite.
		 */
		async function uniqueCleanName(services, sessionId, originalName) {
			const base = cleanBaseName(originalName);
			let candidate = base;
			for (let n = 2; n <= 99; n++) {
				const res = await services.remote.workspaceFiles.stat(sessionId, candidate, new AbortController().signal);
				if (res.ok) {
					candidate = numberedName(base, n);
					continue;
				}
				const code = res.error === undefined ? undefined : res.error.code;
				if (code === "workspace-file/not-found") return candidate;
				throw res.error ?? new Error("Could not check the folder");
			}
			throw new Error("Could not find a free file name");
		}

		/** UTF-8 to base64 for the write call's wire format. */
		function utf8ToBase64(text) {
			const bytes = new TextEncoder().encode(text);
			let bin = "";
			for (let i = 0; i < bytes.length; i += 0x8000) {
				bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
			}
			return btoa(bin);
		}

		/** dsh-resource address of one file in one session, the grammar file cards use. */
		function fileAddress(sessionId, name) {
			const segment = (value) => encodeURIComponent(value).replace(/%3A/gi, ":");
			return "dsh-resource://file/session/" + segment(sessionId) + "/" + segment(name);
		}

		/** The folder title the success toast shows: the workspace title, else the folder name. */
		function folderTitleOf(services, sessionId, cwd) {
			try {
				const snapshot = services.workspaces.list.getSnapshot();
				const workspace = (snapshot.items ?? []).find((w) => Array.isArray(w.sessionIds) && w.sessionIds.includes(sessionId));
				if (workspace !== undefined && typeof workspace.title === "string" && workspace.title !== "") return workspace.title;
			} catch (reason) {
				// best effort only; fall through to the folder name
			}
			const parts = String(cwd).replace(/\\/g, "/").replace(/\/+$/, "").split("/");
			return parts[parts.length - 1] || String(cwd);
		}

		/**
		 * Resolve where the clean file goes: the current session's folder (cwd). This
		 * one function covers every context - the home page's hero-picked workspace
		 * (selecting it opens the blank session in that folder), an audit session, and
		 * Chats sessions (their cwd is CHATS_CWD).
		 *
		 * Confidential mode does NOT come through here: its caller
		 * (`__eloizeTranscript.runUploadWithTarget`) passes an explicit target, which
		 * `runPipeline` uses instead of calling this function at all.
		 *
		 * With no folder at all, the host's folder picker flow runs (Aaron's call):
		 * pick -> register workspace -> open its session -> wait for its cwd.
		 * @returns { sessionId, cwd, title }, or null when the picker was cancelled or
		 *   no folder appeared in time.
		 */
		async function resolveTargetFolder(services) {
			const snapshot = services.sessions.list.getSnapshot();
			const current = snapshot.current;
			const row = current === undefined ? undefined : snapshot.byId[current];
			if (row !== undefined && row.cwd !== undefined && row.cwd !== "") {
				return { sessionId: current, cwd: row.cwd, title: folderTitleOf(services, current, row.cwd) };
			}

			let path = null;
			try {
				path = await services.uiWorkspace.pickDirectory();
			} catch (reason) {
				if (isCancellation(reason)) return null;
				throw reason;
			}
			if (path === null || path === undefined) return null;
			const workspace = await services.workspaces.create({ path });
			services.uiWorkspace.startSession(workspace.workspaceId);
			const resolved = await waitForCurrentFolder(services, FOLDER_WAIT_MS);
			if (resolved === FOLDER_WAIT_TIMED_OUT) throw new Error("Could not find the audit folder");
			return resolved;
		}

		/** Wait until the current session carries a folder, bounded by a timeout. */
		function waitForCurrentFolder(services, timeoutMs) {
			return new Promise((resolve) => {
				let settled = false;
				const timer = setTimeout(() => done(FOLDER_WAIT_TIMED_OUT), timeoutMs);
				const unsubscribe = services.sessions.list.subscribe(checkNow);
				function checkNow() {
					if (settled) return;
					const snapshot = services.sessions.list.getSnapshot();
					const current = snapshot.current;
					const row = current === undefined ? undefined : snapshot.byId[current];
					if (row !== undefined && row.cwd !== undefined && row.cwd !== "") {
						done({ sessionId: current, cwd: row.cwd, title: folderTitleOf(services, current, row.cwd) });
					}
				}
				function done(value) {
					if (settled) return;
					settled = true;
					clearTimeout(timer);
					try {
						unsubscribe();
					} catch (reason) {
						// nothing to clean up
					}
					resolve(value);
				}
				checkNow();
			});
		}

		/** Sentinel: the folder wait ran out without a session folder appearing. */
		const FOLDER_WAIT_TIMED_OUT = { timedOut: true };

		/** One run is enough: repeat clicks and menu picks are ignored while in flight. */
		let inFlight = false;

		/**
		 * A Context Files refresh is owed after a successful write (bug fix): the
		 * right panel's file tree lists the session folder once when its tab first
		 * mounts and never reloads on its own, so a file written later stays
		 * invisible until the user clicks its reload control. This flag is set when
		 * the write succeeds and cleared once the tree's reload button is clicked
		 * (see refreshFilesTreeIfPending), so the -clean.md shows up in the folder
		 * view without a manual reload.
		 */
		let pendingFilesRefresh = false;

		/**
		 * One loud log line per pipeline step. IDs and step names only, never chat
		 * or transcript content (v3 rule).
		 */
		function stepLog(step, message) {
			console.log("[eloize-transcript] " + step + ": " + message);
		}

		/** Tag a thrown value with its pipeline step, so the outer catch names it. */
		function stepError(step, reason) {
			const err = reason instanceof Error ? reason : new Error(oneLineReason(reason));
			try {
				err.eloizeStep = step;
			} catch (ignored) {
				// a frozen error keeps its own message; the step is still the caller's
			}
			return err;
		}

		/** Record a failed step: log the reason, then toast the fixed copy. */
		function stepFailed(step, reason) {
			stepLog(step, "FAILED " + oneLineReason(reason));
			showToast(FAILURE_TOAST_PREFIX + step + ")", "error");
		}

		/**
		 * The pipeline body, separated from runUpload so the timeout can race it.
		 * Returns { done: true } on success or { cancelled: true } when the folder
		 * picker was cancelled; rejects with a step-tagged error otherwise.
		 * The raw transcript exists only in memory: only the swept clean text is
		 * ever written, and only under the -clean.md name.
		 */
		async function runPipeline(services, file, explicitTarget, controller) {
			const raw = await readFileAsText(file).catch((reason) => {
				throw stepError("read", reason);
			});
			if (controller.aborted) return { done: false };
			if (raw.trim() === "") throw stepError("read", new Error("The transcript file is empty"));
			stepLog("read", "ok");
			const markdown = toMarkdown(file.name, raw);
			if (estimateTokens(markdown) > MAX_CONTEXT_TOKENS - MAX_OUTPUT_TOKENS - PROMPT_TOKEN_HEADROOM) {
				throw stepError("size", new Error("The transcript is too large to clean in one pass"));
			}
			stepLog("size", "ok");
			// An explicit target (the Confidential folder, supplied by the
			// confidential plugin) skips the current-folder/host-picker resolution
			// entirely: no picker can open and the clean file lands exactly there.
			let target;
			if (explicitTarget !== undefined && explicitTarget !== null) {
				target = explicitTarget;
				stepLog("folder", "ok id=" + target.sessionId + " (explicit)");
			} else {
				target = await resolveTargetFolder(services).catch((reason) => {
					throw stepError("folder", reason);
				});
				if (target === null) {
					// Folder picker cancelled; abort quietly - no toast, no file.
					showToast("", "clear");
					stepLog("folder", "cancelled");
					return { cancelled: true };
				}
				stepLog("folder", "ok id=" + target.sessionId);
			}
			if (controller.aborted) return { done: false };
			const cleaned = await callOllama(markdown).catch((reason) => {
				throw stepError("clean", reason);
			});
			if (controller.aborted) return { done: false };
			if (cleaned.length < markdown.length * MIN_OUTPUT_RATIO) {
				throw stepError("clean", new Error("The local model returned too little text, so nothing was saved"));
			}
			stepLog("clean", "ok");
			// Name sweep (fix pass B). Deliberately AFTER the 70% length guard, which
			// stays measured on the clean-pass output alone, and BEFORE the write.
			const swept = await nameSweep(cleaned).catch((reason) => {
				throw stepError("sweep", reason);
			});
			if (controller.aborted) return { done: false };
			stepLog("sweep", "ok " + (swept.extractionFailed ? "extraction failed, backstop only: " : "") + swept.replaced + " replaced");
			// Push 3: number backstop after the model's pass, then the dollar
			// escape applied to the WRITTEN file only.
			const ids = numberBackstop(swept.text);
			stepLog("ids", "ok " + ids.replaced + " replaced");
			const finalText = escapeDollars(ids.text);
			let name;
			try {
				name = await uniqueCleanName(services, target.sessionId, file.name);
			} catch (reason) {
				throw stepError("save", reason);
			}
			const write = await services.remote.workspaceFiles.write(
				target.sessionId,
				name,
				utf8ToBase64(finalText),
				new AbortController().signal,
			).catch((reason) => {
				throw stepError("save", reason);
			});
			if (!write.ok) throw stepError("save", write.error ?? new Error("Could not save the cleaned transcript"));
			if (controller.aborted) return { done: false };
			stepLog("save", "ok id=" + target.sessionId);
			try {
				services.sidebarRight.openResource(fileAddress(target.sessionId, name));
			} catch (reason) {
				throw stepError("open", reason);
			}
			// The panel opens the file preview, so the Context Files tab's body is
			// unmounted right now; the owed refresh fires when it next mounts.
			pendingFilesRefresh = true;
			stepLog("open", "ok id=" + target.sessionId);
			showToast(SUCCESS_TOAST_PREFIX + target.title, "success");
			return { done: true };
		}

		/**
		 * The whole pipeline: validate -> read (browser only) -> convert -> size guard
		 * -> folder -> local model -> sanity guard (70%, on the clean output) -> name
		 * sweep -> unique name -> write -> open in the right-hand panel -> toast.
		 *
		 * Push 2 contract: every step logs ok|FAILED, a failure toasts
		 * "Couldn't clean transcript (<step>)", the whole run races a timeout, and
		 * the busy toast + busy button clear on EVERY exit path (success, error,
		 * timeout, cancellation) through the single finally.
		 */
		async function runUpload(services, file, explicitTarget) {
			if (inFlight) return;
			const ext = extensionOf(file.name);
			if (SUPPORTED_EXTS.indexOf(ext) < 0) {
				showToast(UNSUPPORTED_TOAST, "error");
				return;
			}
			inFlight = true;
			setBusy(true);
			showToast(BUSY_TEXT, "busy");
			const controller = { aborted: false };
			let timer = null;
			try {
				const outcome = await Promise.race([
					runPipeline(services, file, explicitTarget, controller),
					new Promise((resolve) => {
						timer = setTimeout(() => resolve({ timedOut: true }), RUN_TIMEOUT_MS);
					}),
				]);
				if (outcome !== undefined && outcome !== null && outcome.timedOut === true) {
					controller.aborted = true;
					stepFailed("timeout", new Error("The cleaning run timed out"));
				}
			} catch (reason) {
				if (controller.aborted) return; // the timeout already reported
				if (isCancellation(reason)) {
					// Folder picker cancelled; abort quietly - no toast, no file.
					showToast("", "clear");
					return;
				}
				const step = reason && typeof reason.eloizeStep === "string" ? reason.eloizeStep : "run";
				stepFailed(step, reason);
			} finally {
				clearTimeout(timer);
				inFlight = false;
				setBusy(false);
			}
		}

		/**
		 * The entry point the confidential plugin calls: the SAME pipeline,
		 * parameterised with an explicit target folder, and bound to THIS bundle's
		 * services. Push 2 fix: the caller no longer passes its own services object
		 * - that object was the confidential bundle's ctx, whose inject gate threw
		 * `cannot get property "remote.workspaceFiles" without inject` the moment
		 * the pipeline touched the folder, after the local model had already run.
		 * @param file - the picked File.
		 * @param target - { sessionId, cwd, title } of the Confidential folder.
		 * @returns a promise settling when the run finishes (success or failure).
		 */
		window.__eloizeTranscript = {
			runUploadWithTarget: (file, target) => runUpload(boundServices, file, target),
		};
		exports.runUploadWithTarget = (file, target) => runUpload(boundServices, file, target);

		/** Open the file picker; the chosen file starts the pipeline. */
		function openPicker(services) {
			if (typeof document === "undefined") return;
			if (inFlight) return;
			const input = el("input", { type: "file", accept: PICKER_ACCEPT, style: "display:none" });
			input.setAttribute(PICKER_ATTR, "1");
			input.addEventListener("change", () => {
				const file = (input.files ?? [])[0];
				input.remove();
				if (file === undefined || file === null) return;
				runUpload(services, file);
			});
			document.body.appendChild(input);
			input.click();
		}
		//#endregion

		//#region card handover from the shell plugin
		/**
		 * Wire the shell plugin's inert upload card to the picker. The card stays owned
		 * by the shell plugin; this adds a click/keydown listener and a marker. A boot
		 * observer re-wires whenever the shell re-renders its card. Native BUTTON
		 * elements get only the click listener: their Enter/Space activation is built
		 * in, so a keydown handler with preventDefault would double-fire or break it.
		 *
		 * KNOWN GAP (unfixed): the disposer drops WIRED_ATTR but cannot remove these
		 * anonymous listeners, so after an HMR swap or a plugin stop the node still
		 * routes a click into the disposed bundle's `openPicker`. The `inFlight` guard
		 * keeps that harmless today (the second run is dropped), but with this plugin
		 * truly removed the card is NOT inert - it opens a picker that goes nowhere.
		 */
		function wireUploadCard(services) {
			if (typeof document === "undefined") return;
			for (const card of findAllUploadCards()) {
				if (card.getAttribute(WIRED_ATTR) === "1") continue;
				card.setAttribute(WIRED_ATTR, "1");
				card.addEventListener("click", () => openPicker(services));
				if (String(card.tagName).toUpperCase() === "BUTTON") continue;
				card.addEventListener("keydown", (event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						openPicker(services);
					}
				});
			}
		}
		//#endregion

		//#region mounting
		/**
		 * Click the Context Files tree's reload control when a refresh is owed.
		 *
		 * The shipped files tree lists the session folder once per tab mount and has
		 * no live refresh, so a -clean.md written after that listing stays invisible
		 * in the folder view. Its reload button (`data-files-reload`, a stable
		 * attribute in the shipped bundle) re-lists every expanded level. The button
		 * only exists while the Context Files tab's body is mounted (the dock renders
		 * the active tab only), so this runs from the boot observer's pass: the
		 * moment that tab mounts, the click fires in the same microtask turn and the
		 * tree re-lists before the stale entries can paint. Idempotent: the flag
		 * clears on the first click.
		 */
		function refreshFilesTreeIfPending() {
			if (!pendingFilesRefresh || typeof document === "undefined") return;
			const button = document.querySelector("[data-files-reload]");
			if (button === null || button.tagName !== "BUTTON" || !isAttached(button)) return;
			pendingFilesRefresh = false;
			button.click();
		}

		/** Run one mount pass: retire stale artifacts, styles, then re-wire the card. */
		function applyTranscriptPass(services) {
			retireStaleNodes();
			installStyles();
			wireUploadCard(services);
			refreshFilesTreeIfPending();
		}

		/**
		 * Install the transcript surfaces for the lifetime of the plugin, with a boot
		 * observer so the card is wired however late the shell mounts it - the same
		 * ordering trap the shell and copy plugins handle the same way.
		 * @returns a disposer.
		 */
		function installTranscript(services) {
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
					applyTranscriptPass(services);
				} finally {
					observer.observe(document.body, { childList: true, subtree: true });
				}
			}
			run();
			return () => {
				observer.disconnect();
				pendingFilesRefresh = false;
				for (const attr of [TOAST_ATTR, PICKER_ATTR]) {
					const node = document.querySelector("[" + attr + "]");
					if (node !== null && node.parentElement !== null) node.parentElement.removeChild(node);
				}
				const card = findUploadCard();
				if (card !== null) {
					card.removeAttribute(WIRED_ATTR);
					card.removeAttribute(BUSY_ATTR);
					card.removeAttribute("data-eloize-busy");
				}
				// Restore any upload control still swapped to the busy look.
				for (const entry of busyControls.splice(0, busyControls.length)) {
					try {
						entry.node.replaceChildren(...entry.children);
					} catch (reason) {
						// node gone; nothing to restore
					}
					entry.node.removeAttribute(BUSY_ATTR);
					entry.node.removeAttribute("aria-busy");
					entry.node.removeAttribute("aria-disabled");
					try {
						entry.node.disabled = false;
					} catch (reason) {
						// non-button controls have no disabled property
					}
				}
			};
		}
		//#endregion

		/**
		 * Required services. `remote.workspaceFiles` is the write/stat namespace of
		 * DSH's own workspace file API, confined to the session folder by the host.
		 * Any `remote.<namespace>` this bundle reads must stay declared here - the
		 * cordis inject trap throws on undeclared namespaces at runtime (inject-scan
		 * verifies this).
		 */
		const inject = ["sessions", "commandUi", "remote", "remote.workspaceFiles", "workspaces", "uiWorkspace", "sidebarRight"];

		/**
		 * This bundle's services, closed over by the cross-plugin entry point. The
		 * confidential plugin's calls go through runUploadWithTarget, which is bound
		 * HERE - a caller's services object is never used, so the caller's inject
		 * declarations cannot gate the pipeline's remote namespaces.
		 */
		let boundServices = null;

		/**
		 * Register the Eloize transcript contributions.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			const services = {
				sessions: ctx.sessions,
				commandUi: ctx.commandUi,
				remote: ctx.remote,
				workspaces: ctx.workspaces,
				uiWorkspace: ctx.uiWorkspace,
				sidebarRight: ctx.sidebarRight,
			};
			boundServices = services;

			ctx.effect(() => installTranscript(services));

			// The composer "+" menu item. The command menu shows client contributions
			// next to host commands; picking the action row runs it for the session.
			// Registration dies with the plugin, which removes the item.
			ctx.effect(() => ctx.commandUi.register({
				name: MENU_NAME,
				description: () => MENU_LABEL,
				available: () => true,
				ui: { kind: "action", run: () => openPicker(services) },
			}));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});
