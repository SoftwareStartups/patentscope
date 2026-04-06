# GitHub Actions

## SHA Pinning Policy

All actions pinned to **full 40-character commit SHAs**. Tags are mutable and can be hijacked — SHAs are immutable.

Format: `uses: owner/action@<full-sha>  # v1.2.3`

Find version and sha:

```bash
for repo in actions/checkout actions/upload-artifact actions/download-artifact actions/cache oven-sh/setup-bun; do
     tag=$(gh api "repos/$repo/releases/latest" --jq '.tag_name')
     ref=$(gh api "repos/$repo/git/ref/tags/$tag" --jq '.object')
     type=$(echo "$ref" | jq -r '.type')
     sha=$(echo "$ref" | jq -r '.sha')
     if [ "$type" = "tag" ]; then
       sha=$(gh api "repos/$repo/git/tags/$sha" --jq '.object.sha')
     fi
     echo "$repo@$tag → $sha"
   done
```

Always verify the SHA matches the expected release tag before updating.

## Dependency Version Pins

- **npm packages** (`package.json`): use `^X.Y.Z` (bun resolves exact into lockfile)
- When adding or upgrading a GitHub Action, web-search the latest release tag and resolve to SHA before pinning

## CI Workflow (`workflows/ci.yml`)

- Triggers: push to any branch, PRs to `main`
- Jobs: lint-and-typecheck → unit-tests → build + integration-tests (parallel after gates)
- Permissions: `contents: read` only

## Release Workflow (`workflows/release.yml`)

- Triggers: push of `v*` tags
- Verifies CI passed for the tagged commit before building
- Matrix build: linux-x64, linux-arm64, darwin-x64, darwin-arm64
- Creates GitHub release with compiled binaries
