Never scan the full backend directory unless explicitly requested.
Do not read node_modules/, dist/, build/, coverage/, package-lock.json, uploads/, or *.log files — they are irrelevant to source changes and waste tokens. (Also blocked via .claude/settings.json permissions.deny.)
Prefer targeted Read/Grep on specific files over broad exploration when the target file is already known.
