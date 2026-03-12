# Project Overview

MCP server exposing Google Patents search and retrieval via SerpApi. Two tools: `search_patents` and `get_patent`. Requires `SERPAPI_KEY` env var.

## Key Files & Directories

```
src/
  index.ts          # Entry point, MCP server setup
  server.ts         # Tool registration
  config.ts         # Env config (SERPAPI_KEY)
  types.ts          # Shared TypeScript types
  services/
    serpapi.ts      # SerpApi HTTP client
    patent.ts       # Patent fetch + HTML parsing
  tools/
    search-patents.ts
    get-patent.ts
  utils/
    patent-data-extractor.ts
    patent-id-resolver.ts  # Normalise patent IDs (EP, US, WO…)
    content-truncator.ts
tests/
  unit/             # Vitest unit tests
  integration-mocked-api.test.ts  # Full MCP flow with mock SerpApi
  e2e-real-api.test.ts            # Real SerpApi (needs key)
  helpers/          # Shared test utilities
.github/workflows/
  ci.yml            # Lint → unit → build → integration
  release.yml       # Tag push → cross-compiled binaries
Taskfile.yml        # Developer commands (task check, task test…)
Dockerfile          # Container image
```

# Project Constitution

Core principles guiding this project's development.

## Development Philosophy

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

## Documentation Philosophy

- **Do not generate documentation files unless explicitly asked**
- Document the current, latest state only
- Never document changes or differences versus previous or historic implementation
- Focus on clarity and accuracy in current state documentation

# Coding Standards

Technical standards and practices for code quality.

## TypeScript Best Practices

- Use latest stable Node.js and TypeScript syntax
- Ensure all code is correctly typed (no `any` types unless absolutely necessary)
- Prefer functional style over classes
- Follow clean code principles: DRY, SOLID, meaningful names, small functions
- Use modern JavaScript/TypeScript features (async/await, destructuring, optional chaining, nullish coalescing)
- Prefer pure functions and immutability
- Avoid side effects where possible
- Use composition over inheritance
- Keep functions small and focused on single responsibility

## Testing Requirements

- Write unit tests for major features
- Maintain test coverage for critical functionality
- Tests should be clear, focused, and maintainable
- **Add a unit test for every relevant bug fix** to prevent regression

## Build Verification

- After each major code change (not markdown documents), run:
  - `task check` - to verify code quality and types
  - `task test` - to ensure all tests pass

# MCP Server Best Practices

Standards specific to Model Context Protocol server implementation.

- Follow the official Model Context Protocol specification
- Implement proper error handling and validation for all tool inputs
- Use clear, descriptive tool names and parameter definitions
- Provide comprehensive tool descriptions for AI consumption
