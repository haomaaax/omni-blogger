#!/bin/bash

# Omni Blogger - Secrets Setup Script
# Automates generation and configuration of Worker secrets

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Symbols
CHECK="✓"
CROSS="✗"
INFO="ℹ"

echo ""
echo "==========================================="
echo "  Omni Blogger - Secrets Setup"
echo "==========================================="
echo ""

# Change to publish-worker directory
WORKER_DIR="${WORKER_DIR:-$HOME/sparkler/publish-worker}"

if [ ! -d "$WORKER_DIR" ]; then
    echo -e "${RED}${CROSS} Worker directory not found: $WORKER_DIR${NC}"
    echo ""
    read -p "Enter the path to your publish-worker directory: " WORKER_DIR

    if [ ! -d "$WORKER_DIR" ]; then
        echo -e "${RED}${CROSS} Directory still not found. Exiting.${NC}"
        exit 1
    fi
fi

cd "$WORKER_DIR"
echo -e "${GREEN}${CHECK} Working in: $WORKER_DIR${NC}"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}${CROSS} Wrangler CLI not found${NC}"
    echo ""
    echo "Installing Wrangler..."
    npm install -g wrangler
    echo -e "${GREEN}${CHECK} Wrangler installed${NC}"
    echo ""
fi

# Check if authenticated
echo -n "Checking Wrangler authentication... "
if wrangler whoami &> /dev/null; then
    WRANGLER_EMAIL=$(wrangler whoami | grep -o '[a-zA-Z0-9._%+-]\+@[a-zA-Z0-9.-]\+\.[a-zA-Z]\{2,\}')
    echo -e "${GREEN}${CHECK} Authenticated as ${WRANGLER_EMAIL}${NC}"
else
    echo -e "${YELLOW}Not authenticated${NC}"
    echo ""
    echo "Opening browser for Cloudflare login..."
    wrangler login
    echo ""
fi

# List existing secrets
echo ""
echo "Current secrets:"
wrangler secret list 2>/dev/null || echo "  (none)"
echo ""

# Secret 1: JWT_SECRET (auto-generate)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Secret 1/5: JWT_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if wrangler secret list 2>/dev/null | grep -q "JWT_SECRET"; then
    echo -e "${YELLOW}${INFO} JWT_SECRET already exists${NC}"
    read -p "Regenerate? (y/N): " REGENERATE
    if [[ $REGENERATE =~ ^[Yy]$ ]]; then
        SKIP_JWT=false
    else
        SKIP_JWT=true
        echo -e "${GREEN}${CHECK} Keeping existing JWT_SECRET${NC}"
    fi
else
    SKIP_JWT=false
fi

if [ "$SKIP_JWT" = false ]; then
    echo "Generating random JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo "$JWT_SECRET" | wrangler secret put JWT_SECRET
    echo -e "${GREEN}${CHECK} JWT_SECRET generated and added${NC}"
fi

echo ""

# Secret 2: GITHUB_TOKEN (user input with guidance)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Secret 2/5: GITHUB_TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if wrangler secret list 2>/dev/null | grep -q "GITHUB_TOKEN"; then
    echo -e "${YELLOW}${INFO} GITHUB_TOKEN already exists${NC}"
    read -p "Update? (y/N): " UPDATE
    if [[ ! $UPDATE =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}${CHECK} Keeping existing GITHUB_TOKEN${NC}"
        echo ""
        SKIP_GITHUB=true
    else
        SKIP_GITHUB=false
    fi
else
    SKIP_GITHUB=false
fi

if [ "$SKIP_GITHUB" = false ]; then
    echo "You need a GitHub Personal Access Token with 'repo' scope."
    echo ""
    echo "Steps:"
    echo "  1. Visit: https://github.com/settings/tokens/new"
    echo "  2. Description: 'Omni Blogger'"
    echo "  3. Check 'repo' scope (full control of private repositories)"
    echo "  4. Click 'Generate token'"
    echo "  5. Copy the token"
    echo ""

    read -p "Open GitHub token page now? (Y/n): " OPEN_GITHUB
    if [[ ! $OPEN_GITHUB =~ ^[Nn]$ ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "https://github.com/settings/tokens/new?scopes=repo&description=Omni%20Blogger"
        else
            xdg-open "https://github.com/settings/tokens/new?scopes=repo&description=Omni%20Blogger" 2>/dev/null || \
            echo "Visit: https://github.com/settings/tokens/new?scopes=repo&description=Omni%20Blogger"
        fi
    fi

    echo ""
    read -sp "Paste your GitHub token here: " GITHUB_TOKEN
    echo ""

    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}${CROSS} No token provided. Skipping GITHUB_TOKEN.${NC}"
    else
        echo "$GITHUB_TOKEN" | wrangler secret put GITHUB_TOKEN
        echo -e "${GREEN}${CHECK} GITHUB_TOKEN added${NC}"
    fi
fi

echo ""

# Secret 3: RESEND_API_KEY (optional)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Secret 3/5: RESEND_API_KEY (optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This is for email subscriptions. You can skip if you don't"
echo "want email notifications for subscribers."
echo ""

if wrangler secret list 2>/dev/null | grep -q "RESEND_API_KEY"; then
    echo -e "${YELLOW}${INFO} RESEND_API_KEY already exists${NC}"
    read -p "Update? (y/N): " UPDATE
    if [[ ! $UPDATE =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}${CHECK} Keeping existing RESEND_API_KEY${NC}"
        echo ""
        SKIP_RESEND=true
    else
        SKIP_RESEND=false
    fi
else
    SKIP_RESEND=false
fi

if [ "$SKIP_RESEND" = false ]; then
    read -p "Do you want to set up email subscriptions? (y/N): " SETUP_EMAIL

    if [[ $SETUP_EMAIL =~ ^[Yy]$ ]]; then
        echo ""
        echo "You need a Resend API key."
        echo ""
        echo "Steps:"
        echo "  1. Visit: https://resend.com/signup"
        echo "  2. Sign up for free account"
        echo "  3. Go to API Keys"
        echo "  4. Create new API key"
        echo "  5. Copy the key"
        echo ""

        read -p "Open Resend signup page now? (Y/n): " OPEN_RESEND
        if [[ ! $OPEN_RESEND =~ ^[Nn]$ ]]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                open "https://resend.com/signup"
            else
                xdg-open "https://resend.com/signup" 2>/dev/null || \
                echo "Visit: https://resend.com/signup"
            fi
        fi

        echo ""
        read -sp "Paste your Resend API key here: " RESEND_API_KEY
        echo ""

        if [ -z "$RESEND_API_KEY" ]; then
            echo -e "${YELLOW}${INFO} No key provided. Skipping email setup.${NC}"
        else
            echo "$RESEND_API_KEY" | wrangler secret put RESEND_API_KEY
            echo -e "${GREEN}${CHECK} RESEND_API_KEY added${NC}"

            echo ""
            echo -e "${BLUE}${INFO} Don't forget to:${NC}"
            echo "  1. Add your domain to Resend"
            echo "  2. Configure DNS records for email"
            echo "  3. See docs/EMAIL-SETUP.md for details"
        fi
    else
        echo -e "${YELLOW}${INFO} Skipping email setup. You can add it later.${NC}"
    fi
fi

echo ""

# Secret 4 & 5: Passkey credentials (explain manual process)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Secrets 4-5: Passkey Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Passkey setup requires browser interaction."
echo ""
echo "After deployment completes, you'll register your passkey"
echo "through the web interface. The public key and credential ID"
echo "will be automatically stored in Worker secrets."
echo ""
echo "No manual console extraction needed!"
echo ""
echo -e "${GREEN}${CHECK} Passkey setup will happen after deployment${NC}"

echo ""
echo "==========================================="
echo ""

# Validate all required secrets are present
echo "Validating secrets configuration..."
echo ""

REQUIRED_SECRETS=("JWT_SECRET" "GITHUB_TOKEN")
MISSING_SECRETS=()

for SECRET in "${REQUIRED_SECRETS[@]}"; do
    if wrangler secret list 2>/dev/null | grep -q "$SECRET"; then
        echo -e "${GREEN}${CHECK} $SECRET${NC}"
    else
        echo -e "${RED}${CROSS} $SECRET${NC} (missing)"
        MISSING_SECRETS+=("$SECRET")
    fi
done

# Optional secrets
if wrangler secret list 2>/dev/null | grep -q "RESEND_API_KEY"; then
    echo -e "${GREEN}${CHECK} RESEND_API_KEY${NC} (optional - configured)"
else
    echo -e "${YELLOW}⊘ RESEND_API_KEY${NC} (optional - not configured)"
fi

echo -e "${YELLOW}⊘ PASSKEY_PUBLIC_KEY${NC} (will be set after deployment)"
echo -e "${YELLOW}⊘ PASSKEY_CREDENTIAL_ID${NC} (will be set after deployment)"

echo ""

if [ ${#MISSING_SECRETS[@]} -eq 0 ]; then
    echo -e "${GREEN}${CHECK} All required secrets configured!${NC}"
    echo ""
    echo "You're ready to deploy:"
    echo "  1. Run: wrangler deploy"
    echo "  2. After deployment, register your passkey"
    echo "  3. Start blogging!"
    echo ""
else
    echo -e "${RED}${CROSS} Missing required secrets:${NC}"
    for SECRET in "${MISSING_SECRETS[@]}"; do
        echo "  - $SECRET"
    done
    echo ""
    echo "Re-run this script to add missing secrets."
    exit 1
fi

# Save a summary for reference
SUMMARY_FILE="secrets-summary.txt"
cat > "$SUMMARY_FILE" << EOF
Omni Blogger - Secrets Configuration Summary
Generated: $(date)

Required Secrets:
✓ JWT_SECRET - Auto-generated 32-byte random string
✓ GITHUB_TOKEN - Personal Access Token with 'repo' scope

Optional Secrets:
$(if wrangler secret list 2>/dev/null | grep -q "RESEND_API_KEY"; then echo "✓ RESEND_API_KEY - Resend API key for email subscriptions"; else echo "⊘ RESEND_API_KEY - Not configured (email subscriptions disabled)"; fi)

Pending (after deployment):
⊘ PASSKEY_PUBLIC_KEY - Will be set during passkey registration
⊘ PASSKEY_CREDENTIAL_ID - Will be set during passkey registration

Next Steps:
1. Deploy Worker: wrangler deploy
2. Register passkey via web interface
3. Start writing!

For more info:
- docs/MANUAL.md
- docs/EMAIL-SETUP.md
EOF

echo "Summary saved to: $SUMMARY_FILE"
echo ""
