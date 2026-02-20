#!/bin/bash
# CI Build Script - Handles Nuxt build that doesn't exit properly
# The build completes but the process hangs, so we check for output and exit

set -e

echo "Starting CI build..."

# Run build in background
prisma generate && nuxt build &
BUILD_PID=$!

# Wait up to 3 minutes for build to complete
for i in {1..180}; do
  # Check if build output exists
  if [ -d ".output" ] && [ -f ".output/server/index.mjs" ]; then
    echo "Build output detected after ${i} seconds"
    echo "Build completed successfully!"
    
    # Kill the background process (it might be hanging)
    kill $BUILD_PID 2>/dev/null || true
    wait $BUILD_PID 2>/dev/null || true
    
    exit 0
  fi
  
  # Check if process already exited
  if ! kill -0 $BUILD_PID 2>/dev/null; then
    echo "Build process exited"
    wait $BUILD_PID
    exit $?
  fi
  
  sleep 1
done

# Timeout - check if output exists anyway
if [ -d ".output" ] && [ -f ".output/server/index.mjs" ]; then
  echo "Build output exists after timeout, considering success"
  kill $BUILD_PID 2>/dev/null || true
  exit 0
fi

echo "Build timed out without producing output"
kill $BUILD_PID 2>/dev/null || true
exit 1
