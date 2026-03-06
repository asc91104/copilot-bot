# Conventional Commit Skill

This is a new skill that helps you create and manage git commits following the **Conventional Commits** specification.

## 📍 Location

- **Skill path**: `.copilot/skills/conventional-commit/`
- **Main documentation**: `SKILL.md`

## ✨ What it does

This skill assists with:

1. **Creating commits** - Format commit messages with proper type, scope, and description
2. **Validating commits** - Check if your message follows Conventional Commits format
3. **Generating suggestions** - Auto-suggest the right commit type based on your changes
4. **Understanding best practices** - Learn why clear commits matter (changelogs, versioning, history)

## 🚀 When to use it

Tell the skill about your changes and it will help you:

- ✅ Choose the right commit type (feat, fix, docs, style, refactor, perf, test, chore, ci)
- ✅ Format the message correctly
- ✅ Add scopes and bodies when needed
- ✅ Handle breaking changes properly
- ✅ Reference GitHub issues in footers

## 📝 Example usage

```
User: "I just implemented JWT token refresh in the auth module"

Skill: "Here's the suggested commit:
feat(auth): implement JWT token refresh

This follows Conventional Commits format and will trigger a 
minor version bump when released. Shall I commit this?"
```

## 🏗️ Skill structure

```
conventional-commit/
├── SKILL.md                           # Main skill documentation
├── scripts/
│   └── format_commit.py              # Python validator/suggester
└── references/
    └── conventional-commits-spec.md  # Full specification reference
```

## 📚 Learn more

- Full spec: See `references/conventional-commits-spec.md`
- Usage: Use the skill by describing your changes to Claude
- Validation: The Python script can validate messages programmatically
