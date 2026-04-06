---
paths:
  - "**/*.ts"
---

- No `any` — use `unknown` + type narrowing
- No default exports — named exports only
- Prefer `interface` over `type` for object shapes
- Export types alongside the functions that consume them
- `src/edam/` is generated — do not edit (run `task thrift`)
- Run `task check` (lint + typecheck) before committing
