Never scan the full frontend directory unless explicitly requested.
Do not read node_modules/, dist/, dist-ssr/, build/, coverage/, package-lock.json, or *.log files — they are irrelevant to source changes and waste tokens. (Also blocked via .claude/settings.json permissions.deny.)
Prefer targeted Read/Grep on specific files over broad exploration when the target file is already known.
