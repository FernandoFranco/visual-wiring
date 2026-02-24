# Contributing to Visual Wiring

Thank you for your interest in contributing to Visual Wiring! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes following our commit conventions
7. Push to your fork
8. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 16 or higher
- Yarn 4.12.0 (included in the project)

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Run linting
yarn lint

# Run formatting
yarn format
```

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependency changes
- **ci**: CI/CD changes
- **chore**: Other changes that don't modify src or test files
- **revert**: Revert a previous commit

### Examples

```bash
feat: add component deletion functionality
fix: resolve pin connection alignment issue
docs: update README with new features
refactor: simplify component rendering logic
```

## Code Style

- We use ESLint and Prettier for code formatting
- Pre-commit hooks will automatically format your code
- All code must pass linting checks before being merged

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all tests pass and code is properly formatted
3. Update documentation if needed
4. Your PR will be reviewed by maintainers
5. Address any feedback from reviewers
6. Once approved, your PR will be merged

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## Questions?

If you have questions, feel free to open an issue or reach out to the maintainers.

Thank you for contributing to Visual Wiring! 🎉
