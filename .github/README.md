# GitHub Copilot Workspace

This directory contains GitHub Copilot agent skills and workspace configuration following the [Agent Skills standard](https://agentskills.io/).

## Structure

```
.copilot/
├── workspace.json          # Workspace configuration and skill registration
└── skills/                 # Registered agent skills
    └── skill-creator/      # Skill for creating and improving other skills
        ├── SKILL.md        # Skill definition and instructions
        ├── scripts/        # Executable utility scripts
        ├── agents/         # Sub-agent instructions
        ├── references/     # Reference documentation
        ├── eval-viewer/    # Interactive evaluation viewer
        └── assets/         # UI assets and resources
```

## Workspace Configuration

The `workspace.json` file defines:
- Registered skills and their entry points
- Skill compatibility and versioning
- Workspace metadata and settings

## Using Skills

Skills are automatically discovered and loaded by GitHub Copilot agents based on:
1. The skill metadata in `SKILL.md` (name, description, when to trigger)
2. The registration in `workspace.json`
3. The agent's current context and user request

## Adding New Skills

1. Create a new directory in `skills/` with your skill name
2. Add a `SKILL.md` file with YAML frontmatter:
   ```markdown
   ---
   name: my-skill
   description: When and how to use this skill
   ---
   # My Skill Name
   [Instructions...]
   ```
3. Register the skill in `workspace.json` under `registeredSkills`
4. Add supporting files (scripts, references, assets) as needed

## Documentation

- [Agent Skills Specification](https://agentskills.io/)
- [Skill Creator Guide](./skills/skill-creator/SKILL.md)
- [Creating Custom Skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
