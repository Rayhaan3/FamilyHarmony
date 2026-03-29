#!/bin/bash

echo "🚀 Starting Family Harmony Backend..."
cd "$(dirname "$0")"
export NODE_ENV=development
node server.js
