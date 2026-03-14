# Patentscope

MCP server exposing Google Patents search and retrieval via SerpApi. Two tools: `search_patents` and `get_patent`. Requires `SERPAPI_API_KEY` env var.

## Key Files & Directories

```
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
.github/workflows/
  ci.yml       # Lint → unit → build → integration
  release.yml  # Tag push → cross-compiled binaries
Taskfile.yml   # Developer commands (task check, task test...)
Dockerfile     # Container image
```

## Principles

### Forward-Looking Approach

- **Never implement backward compatibility**
- Always implement according to the latest insight and best practices
- Refactor boldly when better approaches are identified
- Embrace breaking changes when they lead to better design

### Communication Style

- **Do not output verbose summaries of work done or changes implemented**
- Be concise and direct in responses
- Focus on what matters now, not what changed
- Let the code speak for itself

### Documentation

- **Do not generate documentation files unless explicitly asked**
- Document the current, latest state only
- Never document changes or differences versus previous or historic implementation

## Coding Standards

### TypeScript

- Use latest stable Bun and TypeScript syntax
- Ensure all code is correctly typed (no `any` types unless absolutely necessary)
- Prefer functional style over classes
- Follow clean code principles: DRY, SOLID, meaningful names, small functions
- Use modern JavaScript/TypeScript features (async/await, destructuring, optional chaining, nullish coalescing)
- Prefer pure functions and immutability
- Avoid side effects where possible
- Use composition over inheritance
- Keep functions small and focused on single responsibility

### Runtime

This project runs exclusively on Bun. Never use Node.js polyfills or Node-specific packages:

- Use global `fetch` — do NOT import `node-fetch`
- Use Bun's built-in APIs where available
- Do not add `@types/node` or configure Node-specific settings

### Testing

- Write unit tests for major features
- Maintain test coverage for critical functionality
- Tests should be clear, focused, and maintainable
- **Add a unit test for every relevant bug fix** to prevent regression

### Build Verification

After each major code change (not markdown documents), run:

- `task format` — format code
- `task check` — verify code quality and types
- `task test` — ensure all tests pass

### GitHub Actions

- Always pin actions to full semver tags (e.g., `actions/checkout@v6.0.2`, not `@v4` or `@v6`)
- To discover the latest version of an action before pinning, use:
  `gh api repos/<owner>/<action>/releases/latest --jq '.tag_name'`

## Release Process

- Releases are triggered by pushing a semver tag (`v*`) to the repository
- Use `task compile` to build a binary for the current platform locally
- Use `task compile:all` to build all 4 platform binaries locally

## MCP Server Best Practices

- Follow the official Model Context Protocol specification
- Implement proper error handling and validation for all tool inputs
- Use clear, descriptive tool names and parameter definitions
- Provide comprehensive tool descriptions for AI consumption
