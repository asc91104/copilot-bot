---
name: conventional-commit
description: Help generate and review git commit messages that follow the Conventional Commits specification. Use this skill whenever the user wants to commit code changes, needs help formatting commit messages, or wants to ensure their commits follow best practices like feat, fix, docs, style, refactor, perf, test, chore, and ci. This skill helps structure clear, machine-readable commit messages that enable automatic changelog generation and semantic versioning.
---

# Conventional Commit Helper

This skill helps you create properly formatted git commit messages that follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Well-formatted commits make it easy to generate changelogs, understand project history, and automate versioning.

## What is Conventional Commits?

Conventional Commits is a specification for adding human and machine readable meaning to commit messages. The format is:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

## Commit Types

Use one of these types to categorize your changes:

- **feat**: A new feature (triggers a minor version bump)
- **fix**: A bug fix (triggers a patch version bump)
- **docs**: Changes to documentation only
- **style**: Changes that don't affect code logic (formatting, missing semicolons, whitespace)
- **refactor**: Code changes that neither fix bugs nor add features
- **perf**: Code changes that improve performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, or tooling
- **ci**: Changes to CI/CD configuration

## Format Guidelines

### Description (first line)
- **Length**: Keep it under 50 characters
- **Tense**: Use imperative mood ("add feature" not "added feature")
- **Capitalization**: Start with lowercase letter
- **Punctuation**: No period at the end
- **Specificity**: Be concrete about what changed

### Optional Scope
Include scope in parentheses to indicate what part of codebase changed:
```
feat(auth): implement JWT token refresh
fix(api): resolve null pointer in user endpoint
docs(readme): update installation instructions
```

### Body (optional, for complex changes)
- Separate from description by blank line
- Explain **why** the change was made, not just **what** changed
- Wrap at 72 characters
- Use imperative mood

### Footer (optional, for breaking changes and issue references)
- Reference issues: `Closes #123` or `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description of what broke`

## Examples

**Simple feature:**
```
feat(auth): add two-factor authentication support
```

**Bug fix with scope:**
```
fix(database): prevent connection pool exhaustion
```

**Refactor with body:**
```
refactor(parser): simplify token validation logic

Extract token validation into separate function to reduce
complexity in main parser. This improves testability and
makes the validation rules easier to understand.
```

**Breaking change:**
```
feat(api): change response format to use nested objects

BREAKING CHANGE: API responses now nest user data under
'data' key instead of returning flat object. Update clients
to access user.data.name instead of user.name
```

## Usage

When you're ready to commit:

1. **Describe your changes**: Tell me what you changed and why
2. **I'll suggest the type and format**: Based on your description, I'll recommend the appropriate type (feat, fix, etc.) and scope
3. **Review and adjust**: You can accept, modify, or ask me to try again
4. **I'll run the commit**: Once you approve, I'll execute `git commit` with the formatted message

The commit will include a `Co-authored-by` trailer to acknowledge my assistance.

## Tips

- **Keep commits focused**: One logical change per commit
- **Be descriptive**: Future you (or your team) will thank you
- **Use scope wisely**: It should match your project's structure (e.g., `auth`, `api`, `ui`, `db`)
- **Breaking changes matter**: Always call out breaking changes in the footer so automation tools catch them
