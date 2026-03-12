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
