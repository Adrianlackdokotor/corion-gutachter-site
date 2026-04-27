#!/bin/bash
# Post-merge setup script for Corion Gutachter
# Runs automatically after each task agent merge.
# Must be: idempotent, non-interactive, fast.
set -e

echo "==> Installing/updating Node.js dependencies..."
npm install --prefer-offline --no-audit --no-fund

echo "==> Post-merge setup complete."
