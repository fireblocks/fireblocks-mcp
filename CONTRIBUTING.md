# Contributing to Fireblocks MCP Server

Thank you for your interest in contributing to the Fireblocks MCP Server! This document provides guidelines and information for contributors.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/fireblocks/fireblocks-mcp.git
   cd fireblocks-mcp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Follow the existing code style
   - Write tests for new functionality
   - Update documentation as needed

3. **Run quality checks**

   ```bash
   npm run precommit
   ```

4. **Commit your changes**
   Use conventional commits format:
   ```bash
   npm run commit
   ```

### Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/) specification. Commit messages should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

#### Examples

```bash
feat: add Fireblocks wallet management
fix: resolve transaction signing issue
docs: update README with new configuration options
style: format code with prettier
refactor: reorganize MCP server handlers
perf: optimize API response caching
test: add unit tests for wallet operations
build: update TypeScript to v5.8.3
ci: add semantic release workflow
chore: update dependencies
```

#### Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the footer:

```
feat: redesign MCP protocol interface

BREAKING CHANGE: The MCP server now requires version 2.0 of the protocol
```

### Testing

Run the test suite before submitting:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci
```

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript**: For type checking
- **Husky**: For git hooks

Quality checks run automatically:

- **Pre-commit**: Runs linting, formatting, type checking, and tests
- **Commit-msg**: Validates commit message format

### Manual Quality Checks

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

## Release Process

This project uses [Semantic Release](https://semantic-release.gitbook.io/) for automated versioning and releasing.

### How Releases Work

1. **Automatic Versioning**: Based on conventional commit messages

   - `fix:` → patch release (1.0.0 → 1.0.1)
   - `feat:` → minor release (1.0.0 → 1.1.0)
   - `BREAKING CHANGE:` → major release (1.0.0 → 2.0.0)

2. **Changelog Generation**: Automatically generated from commit messages

3. **Release Notes**: Generated from conventional commits

### Release Branches

- `main`: Production releases

### Manual Release

To trigger a release manually:

```bash
npm run semantic-release
```

## Pull Request Process

1. **Fork the repository** (for external contributors)

2. **Create a feature branch** from `main`

3. **Make your changes** following the guidelines above

4. **Push to your fork** and create a pull request

5. **Ensure all checks pass**:

   - All tests pass
   - Code quality checks pass
   - Conventional commit format is used

6. **Request review** from maintainers

7. **Address feedback** if necessary

8. **Merge** once approved

## Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Document complex logic with comments

### Testing

- Write unit tests for all new functionality
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies

### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md (handled automatically by semantic-release)

## Getting Help

- Check existing issues and pull requests
- Create a new issue for bugs or feature requests
- Join our community discussions

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.
