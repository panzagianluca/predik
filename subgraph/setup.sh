#!/bin/bash

# Predik Subgraph Setup Script
# This script helps you deploy The Graph subgraph step-by-step

set -e  # Exit on error

echo "🚀 Predik Subgraph Setup"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if graph CLI is installed
echo "Checking for The Graph CLI..."
if ! command -v graph &> /dev/null
then
    echo -e "${RED}❌ The Graph CLI not found${NC}"
    echo "Installing @graphprotocol/graph-cli globally..."
    npm install -g @graphprotocol/graph-cli
    echo -e "${GREEN}✅ The Graph CLI installed${NC}"
else
    echo -e "${GREEN}✅ The Graph CLI found${NC}"
fi
echo ""

# Navigate to subgraph directory
cd "$(dirname "$0")/subgraph"

# Install dependencies
echo "📦 Installing subgraph dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check if authenticated
echo "🔐 Authentication Check"
echo "Have you authenticated with your deploy key? (y/n)"
read -r authenticated

if [ "$authenticated" != "y" ]; then
    echo ""
    echo "Please run this command with your deploy key from The Graph Studio:"
    echo -e "${YELLOW}graph auth --studio YOUR_DEPLOY_KEY${NC}"
    echo ""
    echo "Get your deploy key from: https://thegraph.com/studio/"
    exit 1
fi
echo ""

# Check startBlock
echo "⚙️ Configuration Check"
echo "Have you set the correct startBlock in subgraph.yaml? (y/n)"
echo "(Should be the block where contract was deployed, around 45000000)"
read -r configured

if [ "$configured" != "y" ]; then
    echo ""
    echo "Please update the startBlock in subgraph/subgraph.yaml"
    echo "Find it at: https://bscscan.com/address/0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340"
    exit 1
fi
echo ""

# Generate code
echo "🔨 Generating TypeScript types..."
npm run codegen
echo -e "${GREEN}✅ Code generated${NC}"
echo ""

# Build subgraph
echo "🏗️ Building subgraph..."
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Ask for confirmation before deploying
echo "🚀 Ready to deploy!"
echo "This will deploy the subgraph to The Graph Studio."
echo "Continue? (y/n)"
read -r deploy_confirm

if [ "$deploy_confirm" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi
echo ""

# Deploy
echo "📤 Deploying to The Graph Studio..."
echo "When prompted, enter a version label (e.g., v0.0.1)"
npm run deploy

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 Next steps:"
echo "1. Go to The Graph Studio: https://thegraph.com/studio/"
echo "2. Wait for your subgraph to sync (30-60 minutes)"
echo "3. Copy the Query URL from the dashboard"
echo "4. Add to .env.local: NEXT_PUBLIC_SUBGRAPH_URL=<your_url>"
echo "5. Restart your Next.js dev server"
echo "6. Replace the hook file:"
echo "   mv hooks/use-user-transactions.ts hooks/use-user-transactions-rpc.ts.bak"
echo "   mv hooks/use-user-transactions-subgraph.ts hooks/use-user-transactions.ts"
echo ""
echo "🎉 All done! Your subgraph is deploying."
