# LLM Wiki Tang

Knowledge base and documentation system powered by LLM embeddings.

## Overview

This project provides a wiki-style knowledge base with vector search capabilities for AI agent documentation and reference materials.

## Features

- Vector embeddings for semantic search
- Multi-language support
- API integration for knowledge retrieval
- Convex backend for data persistence

## Setup

```bash
# Install dependencies
npm install

# Start services
docker-compose up -d

# Run the API
npm run dev
```

## Architecture

```
├── api/           # API endpoints
├── converter/      # Content conversion
├── mcp/           # MCP server integration
├── supabase/      # Database schemas
└── tests/         # Test suites
```

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)