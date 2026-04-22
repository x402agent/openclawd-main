// Barrel export for the orchestrator integration.
//
// The orchestrator sits between the frontend (solanaclawd.com) and the
// per-user E2B sandboxes. It also fronts the Privy agentic wallet + Solana
// Clawd MCP surfaces. This module exposes:
//
//   - OrchestratorClient — typed HTTP client for /api/v1/*
//   - useOrchestrator    — React hook that wires getAuthToken to a token source
//
// See ./client.ts for the raw API surface.

export {
  OrchestratorClient,
  OrchestratorError,
  createOrchestratorClient,
  type AgentDescriptor,
  type BrainAskResult,
  type LaunchArgs,
  type LaunchResult,
  type McpCallResult,
  type McpTool,
  type OrchestratorClientOpts,
  type WalletBalance,
} from './client.js'

export { useOrchestrator } from './useOrchestrator.js'
export { GatewayClient } from './gatewayClient.js'
