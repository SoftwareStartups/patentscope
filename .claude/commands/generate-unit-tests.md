# Generate Unit Tests

Instructions for creating comprehensive unit tests for referenced code.

## Core Principles

- **Do not modify the implementation code** - only create tests
- **Use plan mode** - document before implementing
- **Incremental verification** - ensure each test runs before continuing

## Step 1: Analyze Flows

Document the following for the referenced code:

### Happy Flows

- Primary use cases and expected behaviors
- Valid input scenarios
- Successful execution paths
- Expected return values and side effects

### Edge Cases

- Boundary conditions (empty, null, undefined, zero, max values)
- Invalid inputs and error conditions
- Unusual but valid inputs
- State transitions and timing issues
- Error handling paths

## Step 2: Document Test Cases

For each flow and edge case identified:

1. **Test name** - clear, descriptive name following convention: `should [expected behavior] when [condition]`
2. **Setup** - what needs to be arranged
3. **Action** - what is being tested
4. **Assertion** - what should be verified

## Step 3: Review Test Cases

Before implementation, review for:

- **Completeness** - all important behaviors covered
- **No duplication** - each test has unique purpose
- **Appropriate scope** - avoid:
  - Load/performance tests
  - Integration tests requiring complex external setup
  - Tests outside the unit's responsibility
  - Over-mocking that tests implementation details rather than behavior

## Step 4: Implementation Plan

Document the testing approach:

### Architecture

- Testing framework and patterns to use
- Mock/stub strategy
- Fixture and helper organization

### Code Location

- Where test files should be created
- Naming conventions
- Directory structure

### Technologies

- Testing frameworks (e.g., Vitest, Jest)
- Assertion libraries
- Mocking utilities
- Any test-specific dependencies

## Step 5: Incremental Implementation

Create a step-by-step execution plan:

1. **Order tests by complexity** - start with simplest happy path
2. **Group related tests** - implement similar tests together
3. **Verify after each test** - run test suite after adding each test or group
4. **Fix failures immediately** - ensure all tests pass before continuing

### Implementation Steps Template

For each test or test group:

1. Write test code
2. Run test suite: `task test`
3. Verify test passes
4. Proceed to next test

## Output Format

Present the plan in this structure:

```markdown
## Analysis

### Happy Flows
[list flows]

### Edge Cases
[list edge cases]

## Test Cases

### [Group Name]
- Test 1: should...
  - Setup: ...
  - Action: ...
  - Assert: ...

## Review
[completeness check, duplication check, scope check]

## Implementation Plan

### Architecture
[patterns and approach]

### Location
[file paths and structure]

### Technologies
[frameworks and tools]

## Implementation Steps

1. [Test group 1]
   - Write tests for: ...
   - Verify: task test
2. [Test group 2]
   - Write tests for: ...
   - Verify: task test
...
```
