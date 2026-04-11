# Patentscope

CLI for searching and retrieving Google Patents via SerpApi. Three commands: `search`, `get`, `serve` (MCP server).

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SERPAPI_API_KEY` | SerpApi API key (or use `patentscope login`) |

## Commands

```bash
# Setup
bun install                          # Install dependencies
task build                           # Compile TypeScript to build/
task clean                           # Remove build/ and dist/

# Quality
task lint                            # Lint with Biome
task format                          # Format with Biome (write)
task test                            # Run tests (bun test)
task check                           # Lint + typecheck + tests

# Pipelines
task ci                              # Full CI locally: clean -> install -> format:check -> check -> build

# Release
task compile                         # Build standalone binary for current platform
task compile:all                     # Build binaries for all 6 platforms

# Auth
bun run src/index.ts login           # Store API key in OS keychain
bun run src/index.ts logout          # Remove stored credentials

# Run (dev, without compiling)
bun run src/index.ts serve           # Start MCP server
bun run src/index.ts search "query"  # Search patents
bun run src/index.ts get <patent-id> # Get patent details
```

## Architecture

```text
src/
  index.ts          # Thin entry point (shebang + run())
  server.ts         # MCP tool registration
  config.ts         # Env config (SERPAPI_API_KEY)
  logger.ts         # Structured logger with log levels
  types.ts          # Shared TypeScript types
  cli/
    app.ts          # Top-level subcommands (serve, search, get) + run()
    format.ts       # Structured text formatters for CLI output
    commands/
      serve.ts      # Start MCP server
      search.ts     # Patent search command
      get.ts        # Patent details command
    plugins/
      json-output.ts  # --json global flag plugin
  services/
    serpapi.ts      # SerpApi HTTP client
    patent.ts       # Patent fetch + HTML parsing
  tools/
    index.ts        # Re-exports tool definitions
    search-patents.ts  # search_patents tool implementation
    get-patent.ts      # get_patent tool implementation
  utils/
    constants.ts         # Application constants and default values
    patent-data-extractor.ts  # Extract structured data from patent HTML
    patent-id-resolver.ts     # Normalize patent IDs (EP, US, WO...)
    content-truncator.ts      # Truncate long patent content
tests/
  unit/                          # Bun unit tests
  integration-mocked-api.test.ts # Full MCP flow with mock SerpApi
  e2e-real-api.test.ts           # Real SerpApi (needs key)
  helpers/                       # Shared test utilities
```

## Principles

### Forward-Looking Approach

- Never implement backward compatibility
- Refactor boldly when better approaches are identified
- Embrace breaking changes when they lead to better design

### Communication Style

- Do not output verbose summaries of work done
- Be concise and direct — let the code speak for itself

### Documentation

- Do not generate documentation files unless explicitly asked
- Document current state only, never changes or history

## MCP Server

- Follow the official Model Context Protocol specification
- Proper error handling and validation for all tool inputs
- Clear, descriptive tool names and parameter definitions
- Comprehensive tool descriptions for AI consumption
