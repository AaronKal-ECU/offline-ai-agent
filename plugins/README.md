# DSH plugins

Six plugins that turn stock DeepSeek Harness (DSH) into a branded audit assistant with a local transcript scrubber and a local-only confidential mode. Published as a **reference**: they were built for a demo against DSH `0.1.5-rc.2` and never deployed. DSH's internals may change between versions.

What each one does, and how they fit together: **→ [How the custom harness is built](../docs/custom-harness.md)**

| Folder | Package |
|---|---|
| `dsh-branding` | `@eloize/dsh-branding` |
| `dsh-copy` | `@eloize/dsh-copy` |
| `dsh-shell` | `@eloize/dsh-shell` |
| `dsh-transcript` | `@eloize/dsh-transcript` |
| `dsh-confidential` | `@eloize/dsh-confidential` |
| `dsh-trims` | `@eloize/dsh-trims` |

## Running them locally

Requirements: DSH installed, Ollama running with the `Qwen3-8B-Q6_K` model (see the [setup guide](../docs/setup-guide.md)).

1. **Create a profile.** Copy [`configs/dsh/profile-demo`](../configs/dsh/profile-demo) to `%USERPROFILE%\.dsh\profiles\demo\`.
2. **Edit the paths marked `EDIT ME`.** Pick two folders on your machine:
   - Confidential folder: `CONFIDENTIAL_CWD` in `dsh-confidential/lib/index.js` **and** `lib/client.js` (they must match)
   - Chats folder: `CHATS_CWD` in `dsh-shell/lib/client.js`
   - Optionally, `ALWAYS_REDACT` in `dsh-transcript/lib/client.js`: first names that should always be redacted
3. **Link the plugins into the profile** (no package manager needed). From this `plugins` folder, in Command Prompt:
   ```bat
   mkdir "%USERPROFILE%\.dsh\profiles\demo\node_modules\@eloize"
   for %p in (branding copy shell transcript confidential trims) do mklink /J "%USERPROFILE%\.dsh\profiles\demo\node_modules\@eloize\dsh-%p" "%CD%\dsh-%p"
   ```
4. **Add the confidential agent preset.** Copy [`configs/dsh/agent-presets/eloize-confidential`](../configs/dsh/agent-presets/eloize-confidential) to `%USERPROFILE%\.dsh\.agent-presets\`.
5. **Launch:**
   ```powershell
   dsh --profile demo --port 3081
   ```
   Open the URL it prints, including its `?token=…`. The bare port returns 401 by design.

The instance binds to `127.0.0.1` only. Don't expose it to a network; it was never designed to be hosted.

## Network behaviour

- The transcript scrubber and confidential mode only call Ollama on `127.0.0.1:11434`.
- `dsh-branding` loads its two fonts (Sora, Manrope) from Google Fonts. No user data is sent; remove the `@import` if you need zero outbound requests from the UI.

## Notes on the code

- Each `client.js` starts with a **generation changelog**. DSH hot-swaps plugin bundles without cleaning up the old DOM, so every marker and style tag is stamped with a generation number, bumped whenever the markup changes.
- The confidential node half has **no imports at all**, deliberately: an earlier version crashed DSH at boot through one static import. Everything it needs comes through `ctx`.
- Comments reference "pushes" and "fix passes": the rounds of build → test → fix this went through.
