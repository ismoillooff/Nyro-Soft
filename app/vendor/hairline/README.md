# Vendored Hairline kernel

- `kernel.js` is the Hairline kernel from the local `hairline-create` skill
  (`~/.agents/skills/hairline-create/kernel.js`), the same `src/core` that ships
  inside `@lucasmarkes/hairline` 0.5.1. It is copied byte for byte and never
  edited: its first line carries a sha256 of the code under it, and the copy
  matches it. License: MIT, see `LICENSE` (© 2026 Lucas Marques).
- The kernel is a classic script that declares `var HL`. `vite.config.ts`
  appends one line, `export default HL;`, at build time (plugin
  `nyro:hairline-kernel`), so `import HL from "./kernel.js"` works while the
  file on disk stays unchanged. `kernel.d.ts` types that default export.
- `nyro.js` is the site's own figure, the layered Nyro N. It is generated from
  `figures/nyro.js` by `node figures/export.mjs`, which also re-captures the
  static rest copy in `app/components/hairline/nyro-rest.ts`. Edit the source
  in `figures/`, check it with the skill's `look.mjs`, then run the export.
- `live.ts` mounts the figure in the browser. It is only ever loaded by a
  dynamic import from `NyroMark`, never during prerender.

To update the kernel, copy a newer `kernel.js` from the skill unchanged, run
`node figures/export.mjs`, and look at the hero again.
