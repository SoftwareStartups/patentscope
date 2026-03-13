# Google Patents MCP Server (`google-patents-mcp`)

[![smithery badge](https://smithery.ai/badge/@SoftwareStartups/google-patents-mcp)](https://smithery.ai/server/@SoftwareStartups/google-patents-mcp)
[![npm version](https://badge.fury.io/js/%40softwarestartups%2Fgoogle-patents-mcp.svg)](https://badge.fury.io/js/%40softwarestartups%2Fgoogle-patents-mcp)

This project provides a Model Context Protocol (MCP) server that allows
searching Google Patents information via the
[SerpApi Google Patents API](https://serpapi.com/google-patents-api).

## Credits

This project is a fork of the original [google-patents-mcp](https://github.com/KunihiroS/google-patents-mcp) by [Kunihiro Sasayama](https://github.com/KunihiroS). We extend our gratitude for the foundational work and inspiration.

## Installing via Smithery

To install Google Patents MCP Server for Claude Desktop automatically via
[Smithery](https://smithery.ai/server/@SoftwareStartups/google-patents-mcp):

```bash
npx -y @smithery/cli install @SoftwareStartups/google-patents-mcp --client claude
```

## Features

* Provides two focused MCP tools for patent research:
  * `search_patents` - Fast metadata search via SerpApi
  * `get_patent` - Comprehensive patent data retrieval (claims, description, family members, citations, metadata)
* Uses SerpApi for both search and detailed patent information via structured endpoints.
* Can be run directly using `bunx` without local installation.

## Prerequisites

* **Bun:** Version 1.0 or higher is recommended.
* **SerpApi API Key:** You need a valid API key from
  [SerpApi](https://serpapi.com/) to use the Google Patents API.

## Quick Start

The easiest way to run this server is using `bunx`:

```bash
bunx @softwarestartups/google-patents-mcp serve
```

The server will start and listen for MCP requests on standard input/output.

## CLI Usage

```
Usage: google-patents-mcp <command> [flags]

Commands:
  serve    Start the MCP server on stdio

Flags:
  -h, --help      Show this help message
  -v, --version   Show version information
      --json      Output as JSON (use with --help or --version)
```

The `serve` command is required — bare invocation without a command prints help and exits with an error.

All human-readable output goes to **stderr**. Stdout is reserved for the MCP JSON-RPC transport and for `--json` structured output.

### JSON output mode

Combine `--json` with `--version` or `--help` to get structured output on stdout, suitable for programmatic consumption:

```bash
# Version info as JSON
bunx @softwarestartups/google-patents-mcp --version --json
# → {"name":"@softwarestartups/google-patents-mcp","version":"1.0.0"}

# Help as JSON
bunx @softwarestartups/google-patents-mcp --help --json
# → {"commands":[...],"flags":[...]}
```

## Configuration

The server requires your SerpApi API key. You can provide it in one of the
following ways:

1. **Environment Variable (Recommended for MCP Hosts):**
   Set the `SERPAPI_API_KEY` environment variable when running the server.

   Example MCP Host configuration snippet (`config.json` or similar):

   ```json
   {
     "mcpServers": {
       "google-patents-mcp": {
         "command": "bunx",
         "args": [
           "@softwarestartups/google-patents-mcp",
           "serve"
         ],
         "env": {
           "SERPAPI_API_KEY": "YOUR_ACTUAL_SERPAPI_KEY"
         }
       }
     }
   }
   ```

2. **.env File:**
   Create a `.env` file in the directory where you run the command
   (for local testing or if not using an MCP Host), or in your home directory
   (`~/.google-patents-mcp.env`), with the following content:

   ```dotenv
   SERPAPI_API_KEY=YOUR_ACTUAL_SERPAPI_KEY
   # Optional: Set log level (e.g., debug, info, warn, error)
   # LOG_LEVEL=debug
   ```

   The server searches for `.env` files in the following order:

   * `./.env` (relative to where the command is run)
   * `~/.google-patents-mcp.env` (in your home directory)

## OpenClaw Configuration

To use with [OpenClaw](https://openclaw.dev/), add the following to your OpenClaw MCP server config:

```json
{
  "mcpServers": {
    "google-patents-mcp": {
      "command": "bunx",
      "args": [
        "@softwarestartups/google-patents-mcp",
        "serve"
      ],
      "env": {
        "SERPAPI_API_KEY": "YOUR_ACTUAL_SERPAPI_KEY"
      }
    }
  }
}
```

## Provided MCP Tools

### `search_patents`

Searches Google Patents via SerpApi. Returns patent metadata only (no full text).

**Parameters:**

| Parameter  | Type    | Required | Description                                           |
|------------|---------|----------|-------------------------------------------------------|
| `q`        | string  | No       | Search query. Use semicolon to separate terms        |
| `page`     | integer | No       | Page number for pagination (default: 1)              |
| `num`      | integer | No       | Results per page (10-100, default: 10)               |
| `sort`     | string  | No       | Sort by: 'new' (newest by filing/publication date) or 'old' (oldest by filing/publication date) |
| `before`   | string  | No       | Max date filter (e.g., 'publication:20231231')       |
| `after`    | string  | No       | Min date filter (e.g., 'publication:20230101')       |
| `inventor` | string  | No       | Filter by inventor names (comma-separated)           |
| `assignee` | string  | No       | Filter by assignee names (comma-separated)           |
| `country`  | string  | No       | Filter by country codes (e.g., 'US', 'WO,JP')        |
| `language` | string  | No       | Filter by language (e.g., 'ENGLISH', 'JAPANESE')     |
| `status`   | string  | No       | Filter by status: 'GRANT' or 'APPLICATION'           |
| `type`     | string  | No       | Filter by type: 'PATENT' or 'DESIGN'                 |
| `scholar`  | boolean | No       | Include Google Scholar results (default: false)      |

**Returns:** Patent metadata including title, publication number, assignee, inventor, dates, and `patent_link` (used for `get_patent`).

**Example:**

```json
{
  "name": "search_patents",
  "arguments": {
    "q": "quantum computing",
    "num": 10,
    "status": "GRANT",
    "country": "US",
    "after": "publication:20230101"
  }
}
```

### `get_patent`

Fetches comprehensive patent data from SerpAPI including claims, description, family members, citations, and metadata. Supports selective content retrieval through the include parameter.

**Parameters:**

| Parameter    | Type    | Required | Description                                           |
|--------------|---------|----------|-------------------------------------------------------|
| `patent_url` | string  | No*      | Full Google Patents URL (from search results)         |
| `patent_id`  | string  | No*      | Patent ID (e.g., 'US1234567A')                        |
| `include`    | array   | No       | Array of content sections to include. Valid values (case-insensitive): "claims", "description", "abstract", "family_members", "citations", "metadata". Defaults to ["metadata", "abstract"]. |
| `max_length` | integer | No       | Maximum character length for returned content. Content will be truncated at natural boundaries (paragraph ends, complete claims). If omitted, no limit is applied. |

*At least one parameter (`patent_url` or `patent_id`) must be provided. If both are provided, `patent_url` takes precedence.

**Returns:** JSON object with requested fields:

* `patent_id` (string): Patent identifier
* `title` (string): Patent title (if "metadata" is in include array)
* `abstract` (string): Patent abstract summary (if "abstract" is in include array)
* `description` (string): Full patent description text (if "description" is in include array)
* `claims` (string[]): Array of patent claims (if "claims" is in include array)
* `family_members` (array): Patent family members with region and status (if "family_members" is in include array)
* `citations` (object): Citation counts including forward_citations, backward_citations, family_to_family_citations (if "citations" is in include array)
* `publication_number` (string): Patent publication number (if "metadata" is in include array)
* `assignee` (string): Patent assignee (if "metadata" is in include array)
* `inventor` (string): Patent inventor (if "metadata" is in include array)
* `priority_date` (string): Priority filing date (if "metadata" is in include array)
* `filing_date` (string): Filing date (if "metadata" is in include array)
* `publication_date` (string): Publication date (if "metadata" is in include array)
* `grant_date` (string): Grant date (if "metadata" is in include array)

Fields are omitted from the response if they are not requested in the include array or if the content could not be retrieved.

**Examples:**

Fetch metadata and abstract (default):

```json
{
  "name": "get_patent",
  "arguments": {
    "patent_url": "https://patents.google.com/patent/US7654321B2"
  }
}
```

Using patent ID:

```json
{
  "name": "get_patent",
  "arguments": {
    "patent_id": "US7654321B2"
  }
}
```

Fetch only claims:

```json
{
  "name": "get_patent",
  "arguments": {
    "patent_id": "US7654321B2",
    "include": ["claims"]
  }
}
```

Fetch only abstract:

```json
{
  "name": "get_patent",
  "arguments": {
    "patent_id": "US7654321B2",
    "include": ["abstract"]
  }
}
```

Fetch comprehensive patent analysis with all sections:

```json
{
  "name": "get_patent",
  "arguments": {
    "patent_url": "https://patents.google.com/patent/US7654321B2",
    "include": ["metadata", "abstract", "description", "claims", "family_members", "citations"]
  }
}
```

Fetch content with length limit to minimize token usage:

```json
{
  "name": "get_patent",
  "arguments": {
    "patent_id": "US7654321B2",
    "include": ["description", "claims"],
    "max_length": 5000
  }
}
```

## Typical Workflow

The two tools are designed to work together:

1. **Search for patents** using `search_patents` to find relevant patents
2. **Get comprehensive data** using `get_patent` for patents of interest

Example workflow:

```typescript
// Step 1: Search for patents
const searchResult = await callTool({
  name: "search_patents",
  arguments: {
    q: "neural network chip",
    num: 10,
    status: "GRANT"
  }
});

// Step 2: Get comprehensive data for first result
const firstPatent = searchResult.organic_results[0];
const patentData = await callTool({
  name: "get_patent",
  arguments: {
    patent_url: firstPatent.patent_link,
    include: ["metadata", "abstract", "description", "claims", "family_members", "citations"]
  }
});

// Now you have comprehensive patent data including:
// - Basic metadata (title, assignee, dates)
// - Abstract summary
// - Full description and claims
// - Patent family members across different countries
// - Citation counts for patent strength assessment
console.log(patentData.family_members);
console.log(patentData.citations);
```

## Binary Releases

Pre-built binaries for all supported platforms are available on the [GitHub Releases](https://github.com/SoftwareStartups/google-patents-mcp/releases) page. No Bun or Node.js installation required.

### Supported platforms

| Platform | Architecture | Binary |
|----------|-------------|--------|
| Linux    | x64         | `patentscope-linux-x64` |
| Linux    | arm64       | `patentscope-linux-arm64` |
| macOS    | x64         | `patentscope-darwin-x64` |
| macOS    | arm64       | `patentscope-darwin-arm64` |

### Download and run

```bash
# Example: macOS arm64
curl -L https://github.com/SoftwareStartups/google-patents-mcp/releases/latest/download/patentscope-darwin-arm64 -o patentscope
chmod +x patentscope
SERPAPI_API_KEY=your_key ./patentscope serve
```

### Releasing

Push a semver tag to trigger the release workflow. CI must pass before tagging:

```bash
git tag v1.2.3
git push origin v1.2.3
```

The release workflow compiles all four platform binaries and publishes them to GitHub Releases automatically.

## Development

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/SoftwareStartups/google-patents-mcp.git
   cd google-patents-mcp
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the project root:

   ```dotenv
   # SerpApi Configuration
   # Get your API key from https://serpapi.com/
   SERPAPI_API_KEY=your_serpapi_key_here

   # Optional: Set log level (error, warn, info, http, verbose, debug, silly)
   # LOG_LEVEL=info
   ```

### Development Workflow

**Build the project:**

```bash
task build
```

**Format code:**

```bash
task format
```

**Check code quality (lint + typecheck):**

```bash
task check
```

**Run tests:**

```bash
task test
```

**Clean build artifacts:**

```bash
task clean
```

**Full build pipeline:**

```bash
task all
# Runs: clean → install → build → check → test
```

### Run Locally

**Production mode:**

```bash
bun run build/index.js serve
```

**Development mode (with auto-rebuild):**

```bash
bun run dev
```

## Testing

The project includes unit tests, integration tests, and end-to-end tests with real API calls:

```bash
# Run all tests (unit + integration)
task test

# Run unit tests only
task test:unit

# Run integration tests only
task test:integration

# Run end-to-end tests with real SerpAPI calls
task test:e2e

# Run all tests including e2e
task test:all
```

### Test Types

- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test the MCP server functionality with mocked API responses
- **End-to-End Tests**: Test complete workflows with real SerpAPI calls

The end-to-end tests validate that the server can successfully:
- Search for patents using real SerpAPI queries
- Fetch patent content with claims, descriptions, and metadata
- Handle various search filters and parameters
- Process patent family members and citations
- Complete full workflows from search to content retrieval

**Note**: End-to-end tests automatically load `SERPAPI_API_KEY` from the `.env` file and will make actual API calls, which may consume your SerpAPI quota.

## Logging

* Logs are output to standard error.
* Log level can be controlled via the `LOG_LEVEL` environment variable
  (`error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`).
  Defaults to `info`.
* A log file is attempted to be created in the project root
  (`google-patents-server.log`), user's home directory
  (`~/.google-patents-server.log`), or `/tmp/google-patents-server.log`.
