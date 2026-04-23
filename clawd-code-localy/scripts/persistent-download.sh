#!/bin/bash
# Persistent Ollama download — auto-restarts on every failure
# Run with: bash ~/qwen3.5-122b/persistent-download.sh

echo "=== Persistent Ollama Download ==="
echo "Will keep retrying until qwen3.5:122b is fully downloaded."
echo ""

while true; do
  echo "[$(date)] Starting ollama pull..."
  ollama pull qwen3.5:122b 2>&1

  # Check if it succeeded
  if ollama list | grep -q "qwen3.5:122b"; then
    echo ""
    echo "=== DONE! qwen3.5:122b is ready ==="
    break
  fi

  echo "[$(date)] Download dropped. Restarting in 10s..."
  sleep 10
done
