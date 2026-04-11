# Source Code

## Module Guide

- **index.ts** — Thin entry point (shebang + `run()`)
- **server.ts** — MCP server setup and tool registration
- **config.ts** — Environment config (`SERPAPI_API_KEY` resolution)
- **logger.ts** — Structured logger with configurable levels (stderr only)
- **types.ts** — Shared TypeScript types for patents, search results

### auth/

OS keychain credential storage via Bun Secrets API: `login` stores key, `logout` removes it. Env var `SERPAPI_API_KEY` overrides stored credential.

### cli/

Clerc CLI framework:
- **app.ts** — Top-level subcommands (`serve`, `search`, `get`) + `run()`
- **format.ts** — Structured text formatters for patent data
- **commands/** — One file per command (`serve.ts`, `search.ts`, `get.ts`)
- **plugins/json-output.ts** — `--json` global flag plugin

### services/

- **serpapi.ts** — SerpApi HTTP client (search queries, pagination)
- **patent.ts** — Patent fetch + HTML parsing for detailed content

### tools/

MCP tool implementations:
- **search-patents.ts** — `search_patents` tool (query → patent list)
- **get-patent.ts** — `get_patent` tool (patent ID → full details)
- **index.ts** — Re-exports tool definitions for server registration

### utils/

- **patent-data-extractor.ts** — Extract structured data (claims, description, citations) from patent HTML
- **patent-id-resolver.ts** — Normalize patent IDs across formats (EP, US, WO, JP, etc.)
- **content-truncator.ts** — Truncate long patent content for MCP response limits
- **constants.ts** — Application constants and default values

## Key Patterns

- **CLI and MCP share services** — Both `cli/commands/` and `tools/` delegate to `services/` for data fetching
- **Patent ID normalization** — All patent IDs go through `patent-id-resolver.ts` before API calls
- **HTML parsing pipeline** — `patent.ts` fetches raw HTML → `patent-data-extractor.ts` extracts structured data
- **Content truncation** — Long patent descriptions/claims are truncated to fit MCP response size limits
- **MCP tool registration** — Tools defined in `tools/`, registered in `server.ts` with Zod schemas for input validation
