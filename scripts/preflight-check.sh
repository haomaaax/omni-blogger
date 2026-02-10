#!/bin/bash

# Omni Blogger - Pre-flight Checker
# Validates system requirements before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Symbols
CHECK="✓"
CROSS="✗"
WARN="⚠"

echo ""
echo "========================================="
echo "  Omni Blogger - Pre-flight Check"
echo "========================================="
echo ""

ISSUES=0

# Check 1: Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}${CHECK} Found ${NODE_VERSION}${NC}"
else
    echo -e "${RED}${CROSS} Not found${NC}"
    echo "  → Install from: https://nodejs.org"
    ISSUES=$((ISSUES + 1))
fi

# Check 2: npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}${CHECK} Found v${NPM_VERSION}${NC}"
else
    echo -e "${RED}${CROSS} Not found${NC}"
    echo "  → Comes with Node.js installation"
    ISSUES=$((ISSUES + 1))
fi

# Check 3: Git
echo -n "Checking Git... "
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    echo -e "${GREEN}${CHECK} Found v${GIT_VERSION}${NC}"
else
    echo -e "${RED}${CROSS} Not found${NC}"
    echo "  → Install from: https://git-scm.com"
    ISSUES=$((ISSUES + 1))
fi

# Check 4: Wrangler CLI
echo -n "Checking Wrangler CLI... "
if command -v wrangler &> /dev/null; then
    WRANGLER_VERSION=$(wrangler --version | awk '{print $2}')
    echo -e "${GREEN}${CHECK} Found v${WRANGLER_VERSION}${NC}"
else
    echo -e "${YELLOW}${WARN} Not found${NC}"
    echo "  → Install with: npm install -g wrangler"
    echo "  → Or the deploy script will install it for you"
fi

# Check 5: Wrangler Authentication
echo -n "Checking Wrangler auth... "
if command -v wrangler &> /dev/null; then
    if wrangler whoami &> /dev/null; then
        WRANGLER_EMAIL=$(wrangler whoami | grep -o '[a-zA-Z0-9._%+-]\+@[a-zA-Z0-9.-]\+\.[a-zA-Z]\{2,\}')
        echo -e "${GREEN}${CHECK} Authenticated as ${WRANGLER_EMAIL}${NC}"
    else
        echo -e "${YELLOW}${WARN} Not authenticated${NC}"
        echo "  → Run: wrangler login"
        echo "  → Or the deploy script will guide you through it"
    fi
else
    echo -e "${YELLOW}${WARN} Skipped (Wrangler not installed)${NC}"
fi

# Check 6: GitHub CLI (optional)
echo -n "Checking GitHub CLI... "
if command -v gh &> /dev/null; then
    GH_VERSION=$(gh --version | head -n 1 | awk '{print $3}')
    echo -e "${GREEN}${CHECK} Found v${GH_VERSION}${NC}"

    # Check if authenticated
    if gh auth status &> /dev/null; then
        GH_USER=$(gh api user -q .login)
        echo -e "${GREEN}  → Authenticated as @${GH_USER}${NC}"
    else
        echo -e "${YELLOW}  → Not authenticated${NC}"
        echo "    Run: gh auth login"
    fi
else
    echo -e "${YELLOW}${WARN} Not found (optional)${NC}"
    echo "  → Install from: https://cli.github.com"
    echo "  → Makes GitHub operations easier, but not required"
fi

# Check 7: Hugo (optional, for local preview)
echo -n "Checking Hugo... "
if command -v hugo &> /dev/null; then
    HUGO_VERSION=$(hugo version | awk '{print $2}')
    echo -e "${GREEN}${CHECK} Found ${HUGO_VERSION}${NC}"
else
    echo -e "${YELLOW}${WARN} Not found (optional)${NC}"
    echo "  → Install from: https://gohugo.io/installation/"
    echo "  → Only needed for local blog preview"
fi

# Check 8: Internet Connection
echo -n "Checking internet connection... "
if ping -c 1 google.com &> /dev/null; then
    echo -e "${GREEN}${CHECK} Connected${NC}"
else
    echo -e "${RED}${CROSS} No connection${NC}"
    echo "  → You need internet access to deploy"
    ISSUES=$((ISSUES + 1))
fi

# Check 9: Cloudflare API Access
echo -n "Checking Cloudflare API... "
if curl -s --head --fail https://api.cloudflare.com > /dev/null; then
    echo -e "${GREEN}${CHECK} Accessible${NC}"
else
    echo -e "${RED}${CROSS} Cannot reach Cloudflare API${NC}"
    echo "  → Check your internet connection"
    echo "  → Check if Cloudflare is blocked in your region"
    ISSUES=$((ISSUES + 1))
fi

# Check 10: GitHub API Access
echo -n "Checking GitHub API... "
if curl -s --head --fail https://api.github.com > /dev/null; then
    echo -e "${GREEN}${CHECK} Accessible${NC}"
else
    echo -e "${RED}${CROSS} Cannot reach GitHub API${NC}"
    echo "  → Check your internet connection"
    ISSUES=$((ISSUES + 1))
fi

# Check 11: Disk Space
echo -n "Checking disk space... "
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    AVAILABLE_GB=$(df -g . | tail -1 | awk '{print $4}')
else
    # Linux
    AVAILABLE_GB=$(df -BG . | tail -1 | awk '{print $4}' | tr -d 'G')
fi

if [ "$AVAILABLE_GB" -gt 1 ]; then
    echo -e "${GREEN}${CHECK} ${AVAILABLE_GB}GB available${NC}"
else
    echo -e "${YELLOW}${WARN} Only ${AVAILABLE_GB}GB available${NC}"
    echo "  → Consider freeing up some space"
fi

# Check 12: Project Dependencies
if [ -f "package.json" ]; then
    echo -n "Checking project dependencies... "
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}${CHECK} Installed${NC}"
    else
        echo -e "${YELLOW}${WARN} Not installed${NC}"
        echo "  → Run: npm install"
    fi
fi

echo ""
echo "========================================="
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}${CHECK} All critical checks passed!${NC}"
    echo ""
    echo "You're ready to deploy! Next steps:"
    echo "  1. Run: ./scripts/deploy.sh"
    echo "  2. Follow the prompts"
    echo "  3. Wait 10-15 minutes for deployment"
    echo ""
else
    echo -e "${RED}${CROSS} Found ${ISSUES} critical issue(s)${NC}"
    echo ""
    echo "Please fix the issues marked with ${RED}${CROSS}${NC} before deploying."
    echo ""
    exit 1
fi

# Optional: Environment Variables Check
echo "Optionally, you can set these environment variables to skip prompts:"
echo ""
echo "  export CLOUDFLARE_API_TOKEN=your_token_here"
echo "  export GITHUB_TOKEN=your_token_here"
echo "  export BLOG_NAME=myblog"
echo "  export CUSTOM_DOMAIN=yourdomain.com  # optional"
echo ""
echo "Then run: ./scripts/deploy.sh"
echo ""
