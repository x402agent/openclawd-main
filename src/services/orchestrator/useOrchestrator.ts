// React hook that yields a memoised OrchestratorClient bound to the caller's
// auth token source. Works with Privy's `useAccessToken()` or any equivalent.
//
// Example:
//
//   import { usePrivy } from '@privy-io/react-auth'
//   import { useOrchestrator } from '@openclawd/src/services/orchestrator'
//
//   function Launcher() {
//     const { getAccessToken } = usePrivy()
//     const orchestrator = useOrchestrator(getAccessToken)
//     useEffect(() => {
//       orchestrator.listAgents().then(console.log)
//     }, [orchestrator])
//     ...
//   }

import { useMemo } from 'react'

import { OrchestratorClient, createOrchestratorClient } from './client.js'

export interface UseOrchestratorOpts {
  baseUrl?: string
}

export function useOrchestrator(
  getAccessToken: () => string | null | undefined | Promise<string | null | undefined>,
  opts: UseOrchestratorOpts = {},
): OrchestratorClient {
  return useMemo(
    () => createOrchestratorClient(getAccessToken, { baseUrl: opts.baseUrl }),
    // Stable as long as getAccessToken is stable. Consumers should memoise
    // their token-getter (usePrivy does this).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getAccessToken, opts.baseUrl],
  )
}
