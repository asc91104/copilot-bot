#!/usr/bin/env python3
"""
Utility script to format and validate Conventional Commit messages.
"""

import sys
import re

def validate_conventional_commit(message):
    """
    Validate if a message follows Conventional Commits format.
    Returns (is_valid, errors)
    """
    errors = []
    
    lines = message.strip().split('\n')
    if not lines:
        errors.append("Commit message cannot be empty")
        return False, errors
    
    first_line = lines[0]
    
    # Check first line format: type(scope)?: description
    pattern = r'^(feat|fix|docs|style|refactor|perf|test|chore|ci)(\([a-zA-Z0-9\-_.]+\))?: .+$'
    if not re.match(pattern, first_line):
        errors.append(f"First line must match pattern: type(scope)?: description")
        errors.append(f"Valid types: feat, fix, docs, style, refactor, perf, test, chore, ci")
    
    # Check first line length
    if len(first_line) > 72:
        errors.append(f"First line is too long ({len(first_line)} > 72 chars)")
    
    # Check first line doesn't end with period
    if first_line.endswith('.'):
        errors.append("First line should not end with a period")
    
    # Check second line is blank (if there are more lines)
    if len(lines) > 1 and lines[1].strip() != '':
        errors.append("Second line must be blank if message has body")
    
    return len(errors) == 0, errors

def suggest_type(description):
    """
    Suggest a commit type based on description keywords.
    """
    description_lower = description.lower()
    
    keywords = {
        'feat': ['add', 'new', 'implement', 'introduce', 'feature'],
        'fix': ['fix', 'bug', 'issue', 'resolve', 'patch', 'correct'],
        'docs': ['doc', 'documentation', 'readme', 'comment', 'guide'],
        'style': ['format', 'whitespace', 'semicolon', 'style', 'lint'],
        'refactor': ['refactor', 'restructure', 'simplify', 'improve structure'],
        'perf': ['performance', 'optimize', 'speed', 'faster', 'improve perf'],
        'test': ['test', 'spec', 'coverage', 'unit test'],
        'chore': ['update', 'upgrade', 'dependency', 'config', 'build'],
        'ci': ['ci', 'github', 'workflow', 'action', 'pipeline']
    }
    
    for commit_type, keywords_list in keywords.items():
        if any(kw in description_lower for kw in keywords_list):
            return commit_type
    
    return 'feat'  # default

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--validate':
            message = sys.stdin.read()
            is_valid, errors = validate_conventional_commit(message)
            if is_valid:
                print("✓ Commit message is valid")
                sys.exit(0)
            else:
                print("✗ Commit message has errors:")
                for error in errors:
                    print(f"  - {error}")
                sys.exit(1)
        
        elif sys.argv[1] == '--suggest-type':
            description = ' '.join(sys.argv[2:])
            suggested = suggest_type(description)
            print(suggested)
            sys.exit(0)
