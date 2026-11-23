# SleepBanana Community Translations (`sleepbanana-i18n`)

Public internationalization (i18n) repository for **SleepBanana** ([sleepbanana.com](https://sleepbanana.com)) — the local-first Markdown, code, spreadsheet, and document workspace for Chrome, Edge, Arc, and Firefox.

SleepBanana ships with **English (`en`)**, **Polski (`pl`)**, **Español (`es`)**, and **Deutsch (`de`)** built-in (0 ms offline). Every additional language in this repository can be installed live inside **SleepBanana → Settings → Language → Browse GitHub** with one click — no browser store release required!

---

## Available Languages

| Code | Language | Native Name | Dir | Type | Coverage | Pack |
|---|---|---|---|---|---|---|
| `en` | English | English | `ltr` | Built-in | 100% (1081/1081) | [`locales/en.json`](locales/en.json) |
| `pl` | Polish | Polski | `ltr` | Built-in | 100% (1081/1081) | [`locales/pl.json`](locales/pl.json) |
| `es` | Spanish | Español | `ltr` | Built-in | 100% (1081/1081) | [`locales/es.json`](locales/es.json) |
| `de` | German | Deutsch | `ltr` | Built-in | 100% (1081/1081) | [`locales/de.json`](locales/de.json) |
| `zh` | Chinese (Simplified) | 中文 (简体) | `ltr` | Community | 100% (1081/1081) | [`locales/zh.json`](locales/zh.json) |

---

## Install a Community Language in SleepBanana

1. Open **SleepBanana → Settings (`Cmd/Ctrl + ,`) → Language**.
2. Click **Browse GitHub** to load the live directory from `traylinx/sleepbanana-i18n`.
3. Click **Install** next to any language (for example **中文 (简体)**) — SleepBanana validates, caches it offline in your browser, and switches live in 0 ms!

Or paste any GitHub file URL (regular `github.com/.../blob/...` or `raw.githubusercontent.com/...`) directly into the URL field and click **Load**.

---

## Contribute a New Language (3 Minutes)

1. **Copy [`locales/en.json`](locales/en.json)** to `locales/<code>.json` (standard BCP-47 code like `fr.json`, `ja.json`, `pt-BR.json`, `uk.json`, `ar.json`).
2. **Update `_meta` and translate `messages`:**
   - Set `"dir": "rtl"` for right-to-left languages (Arabic, Hebrew, Persian, Urdu).
   - **Never translate `{placeholders}`** such as `{name}`, `{count}`, `{pct}`.
   - Partial translations are safe — missing keys automatically fall back to English.
3. **Register your file** in [`locales/registry.json`](locales/registry.json) with `"bundled": false`.
4. **Validate locally** and open a Pull Request:
   ```bash
   node scripts/validate.mjs --update-registry
   ```

GitHub Actions automatically validates every PR for JSON syntax, `{placeholder}` parity, and `registry.json` registration. As soon as your PR merges into `main`, every SleepBanana user worldwide can install your language immediately!
