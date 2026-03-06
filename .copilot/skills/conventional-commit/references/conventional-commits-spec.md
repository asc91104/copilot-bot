# Conventional Commits Specification

## Summary

The Conventional Commits specification is a lightweight convention on top of commit messages that makes it easier to:

- Automatically determine semantic version bumps
- Generate changelogs
- Make commit history easier to navigate
- Communicate changes to teammates/public

## Format

The commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types Reference

### feat
A new feature. Bumps **MINOR** version.

Example: `feat(auth): add password reset functionality`

### fix
A bug fix. Bumps **PATCH** version.

Example: `fix(api): prevent duplicate user registration`

### docs
Documentation only changes.

Example: `docs(readme): add setup instructions`

### style
Changes that don't affect code meaning (whitespace, formatting, missing semicolons, etc).

Example: `style: reformat code blocks`

### refactor
Code changes that neither fix bugs nor add features.

Example: `refactor(parser): extract validation logic`

### perf
Code changes that improve performance.

Example: `perf(database): add connection pooling`

### test
Adding missing tests or correcting existing tests.

Example: `test(auth): add JWT token validation tests`

### chore
Changes to the build process, dependency updates, or other tooling.

Example: `chore: update dependencies to latest versions`

### ci
Changes to CI/CD configuration files and scripts.

Example: `ci: add GitHub Actions workflow for tests`

## Breaking Changes

If your commit introduces a breaking change, add this footer:

```
BREAKING CHANGE: description of what broke
```

Or if using a scope:

```
feat(api)!: new response format

BREAKING CHANGE: responses now use nested objects
```

## Examples

### Basic feature
```
feat: allow user to configure notification preferences
```

### With scope
```
feat(auth): implement oauth2 login
```

### With body explaining why
```
fix(parser): prevent stack overflow on deeply nested objects

The recursive descent parser would overflow when processing
objects with nesting depth > 1000. Replace with iterative
approach using a stack data structure.
```

### With footer referencing issue
```
feat(dashboard): add real-time metrics

Closes #234
```

### With breaking change
```
feat(api)!: change authentication to token-based

BREAKING CHANGE: Basic auth is no longer supported.
All clients must switch to Bearer token authentication.
```

## Best Practices

1. **Imperative mood**: Use "add feature" not "added feature" or "adds feature"
2. **No period at end**: "add login" not "add login."
3. **Keep first line short**: Max 50-72 characters
4. **Be specific**: "add JWT refresh endpoint" not "update auth"
5. **Explain why**: Use body to explain motivation and context
6. **One logical change**: Keep commits focused
7. **Scope should be meaningful**: Use your project's structure
