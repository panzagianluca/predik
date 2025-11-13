#!/bin/bash

# ========================================
# GIT CLEANUP SCRIPT
# ========================================
# Removes tracked files that should be ignored
# Run this ONCE to clean up the repo
#
# Usage: bash scripts/git-cleanup.sh
# ========================================

set -e

echo "🧹 PREDIK GIT CLEANUP"
echo "================================"
echo ""
echo "⚠️  WARNING: This will remove files from git tracking"
echo "    Files will remain on disk, but won't be committed"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🗑️  Removing tracked files that should be ignored..."
echo ""

# ========================================
# 1. REMOVE DOCUMENTATION
# ========================================
echo "📚 Removing documentation files..."

# Remove all Docs/ directory
git rm -r --cached Docs/ 2>/dev/null || echo "  ℹ️  Docs/ already removed or doesn't exist"

# Remove markdown files (except allowed ones)
git ls-files | grep '\.md$' | grep -v '^README\.md$' | grep -v '^LICENSE\.md$' | grep -v '^CONTRIBUTING\.md$' | grep -v '^CHANGELOG\.md$' | grep -v '^subgraph/README\.md$' | xargs -r git rm --cached 2>/dev/null || echo "  ℹ️  No extra markdown files to remove"

echo "  ✅ Documentation removed from tracking"

# ========================================
# 2. REMOVE SQL/MIGRATIONS
# ========================================
echo ""
echo "🗄️  Removing SQL and migration files..."

# Remove migrations folder
git rm -r --cached migrations/ 2>/dev/null || echo "  ℹ️  migrations/ already removed"

# Remove SQL files from drizzle (keep meta folder)
git ls-files drizzle/ | grep '\.sql$' | xargs -r git rm --cached 2>/dev/null || echo "  ℹ️  No SQL files in drizzle/ to remove"

echo "  ✅ SQL files removed from tracking"

# ========================================
# 3. REMOVE TEST FILES
# ========================================
echo ""
echo "🧪 Removing test files..."

# Remove uitest directory
git rm -r --cached apps/app/app/uitest/ 2>/dev/null || echo "  ℹ️  uitest/ already removed"

# Remove any test/spec files
git ls-files | grep -E '\.(test|spec)\.(ts|tsx|js|jsx)$' | xargs -r git rm --cached 2>/dev/null || echo "  ℹ️  No test files to remove"

echo "  ✅ Test files removed from tracking"

# ========================================
# 4. REMOVE SEED SCRIPTS
# ========================================
echo ""
echo "🌱 Removing seed scripts..."

git rm --cached scripts/seed-proposals.mjs 2>/dev/null || echo "  ℹ️  Seed script already removed"

echo "  ✅ Seed scripts removed from tracking"

# ========================================
# 5. VERIFY NO SECRETS
# ========================================
echo ""
echo "🔐 Verifying no secrets are tracked..."

SECRET_FILES=$(git ls-files | grep -E '(\.env$|\.env\.|secret|credential|password)' | grep -v '\.env\.example$' || true)

if [ -z "$SECRET_FILES" ]; then
    echo "  ✅ No secret files found in git"
else
    echo "  ⚠️  WARNING: Found potential secret files:"
    echo "$SECRET_FILES"
    echo ""
    echo "  Run manually: git rm --cached <file>"
fi

# ========================================
# SUMMARY
# ========================================
echo ""
echo "================================"
echo "✅ CLEANUP COMPLETE"
echo "================================"
echo ""
echo "Files removed from git tracking but kept on disk:"
echo "  - Documentation (Docs/, *.md)"
echo "  - SQL files (migrations/, drizzle/*.sql)"
echo "  - Test files (uitest/, *.test.*, *.spec.*)"
echo "  - Seed scripts (scripts/seed-*.mjs)"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Commit cleanup: git commit -m 'chore: clean up repo - remove docs, tests, sql from tracking'"
echo "  3. Push to remote: git push"
echo ""
echo "⚠️  IMPORTANT: Files are still on your disk, just not tracked by git"
echo "   Your local .env files and documentation remain safe"
echo ""
