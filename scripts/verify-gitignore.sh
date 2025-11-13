#!/bin/bash

# Quick verification script - check what .gitignore will catch
# Run: bash scripts/verify-gitignore.sh

echo "🔍 TESTING .GITIGNORE RULES"
echo "================================"
echo ""

# Test various file types
TEST_FILES=(
    "Docs/PROJECT_SPEC.md"
    "apps/app/app/uitest/page.tsx"
    "migrations/notifications_standalone.sql"
    "drizzle/0000_public_lenny_balinger.sql"
    ".env.local"
    "apps/app/.env.local"
    "scripts/seed-proposals.mjs"
    "debug-posthog.js"
    "README.md"
    ".env.example"
)

echo "Testing if files are ignored:"
echo ""

for file in "${TEST_FILES[@]}"; do
    if git check-ignore -q "$file" 2>/dev/null; then
        echo "✅ IGNORED: $file"
    else
        if [ -e "$file" ]; then
            # File exists but not ignored - check if it's tracked
            if git ls-files --error-unmatch "$file" &>/dev/null; then
                echo "⚠️  TRACKED (needs removal): $file"
            else
                echo "❓ EXISTS but not ignored or tracked: $file"
            fi
        else
            echo "ℹ️  Would be ignored (doesn't exist): $file"
        fi
    fi
done

echo ""
echo "================================"
echo "Legend:"
echo "  ✅ = File will be ignored"
echo "  ⚠️  = File is tracked (run git-cleanup.sh to remove)"
echo "  ❓ = File exists but .gitignore might have issue"
echo "  ℹ️  = File doesn't exist (test)"
echo ""
