#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${1:-}"
[ -n "$CONFIG_FILE" ] || { echo "Usage: $0 path/to/new-business-portal.json" >&2; exit 1; }
[ -f "$CONFIG_FILE" ] || { echo "ERROR: Config file not found: $CONFIG_FILE" >&2; exit 1; }

python3 tools/validate_portal_config.py "$CONFIG_FILE"
cp "$CONFIG_FILE" public-site/assets/config/portal.json

echo "PASS: Installed new business configuration."
echo "Next required inputs:"
echo "  1. Copy logo to the configured business.logo path"
echo "  2. Copy staff photos to configured staff.photo paths"
echo "  3. Copy work photos using gallery.filePattern"
echo "  4. Deploy Lambda functions with each service.variantId"
echo "  5. Set booking.availabilityApiBase after API Gateway deployment"
echo "  6. Run tools/validate_portal_config.py"
