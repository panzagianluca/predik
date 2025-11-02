#!/bin/bash
# Script to replace all console.log statements with logger utility

# Find all TypeScript files that contain console statements (excluding node_modules, .next, etc.)
FILES=$(find app components lib hooks -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.d.ts" -exec grep -l "console\." {} \;)

for file in $FILES; do
    echo "Processing: $file"

    # Check if logger is already imported
    if ! grep -q "import.*logger.*from.*@/lib/logger" "$file" && ! grep -q "import.*logger.*from.*\./logger" "$file" && ! grep -q "import.*logger.*from.*\.\.\/logger" "$file"; then
        # Detect the file type and add appropriate import
        if [[ "$file" == *".tsx" ]] || [[ "$file" == *".ts" ]]; then
            # Determine correct import path based on file location
            if [[ "$file" == lib/* ]]; then
                IMPORT_PATH="./logger"
            elif [[ "$file" == app/* ]]; then
                IMPORT_PATH="@/lib/logger"
            elif [[ "$file" == components/* ]]; then
                IMPORT_PATH="@/lib/logger"
            elif [[ "$file" == hooks/* ]]; then
                IMPORT_PATH="@/lib/logger"
            else
                IMPORT_PATH="@/lib/logger"
            fi

            # Add import after the first import statement or at the top
            awk -v import_line="import { logger } from \"$IMPORT_PATH\";" '
                !done && /^import / {
                    print;
                    getline;
                    if ($0 !~ /^import /) {
                        print import_line;
                        done=1
                    }
                    print;
                    next
                }
                {print}
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        fi
    fi

    # Replace console.log with logger.log
    sed -i '' 's/console\.log(/logger.log(/g' "$file"

    # Replace console.error with logger.error
    sed -i '' 's/console\.error(/logger.error(/g' "$file"

    # Replace console.warn with logger.warn
    sed -i '' 's/console\.warn(/logger.warn(/g' "$file"

    # Replace console.info with logger.info
    sed -i '' 's/console\.info(/logger.info(/g' "$file"

    # Replace console.debug with logger.debug
    sed -i '' 's/console\.debug(/logger.debug(/g' "$file"

    echo "✅ Processed: $file"
done

echo ""
echo "🎉 All console statements replaced with logger!"
echo "Run 'npm run lint:fix' to format the code"
