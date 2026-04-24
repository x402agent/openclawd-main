import { defineEventHandler, setHeader } from 'h3'
import { openClawdCatalog } from '../../../../../src/lib/generated/openclawdCatalog'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
  setHeader(event, 'Access-Control-Allow-Origin', '*')

  return {
    name: 'OpenClawd Skills',
    symbol: 'SKILLS',
    description: `${openClawdCatalog.skillCount} AI agent skills from the OpenClawd ecosystem. Each NFT represents an installable skill for OpenClawd-compatible agents.`,
    image: 'https://solanaos.net/og.png',
    external_url: openClawdCatalog.skillsHubUrl,
    attributes: [
      { trait_type: 'Total Skills', value: String(openClawdCatalog.skillCount) },
      { trait_type: 'Total Packages', value: String(openClawdCatalog.packageCount) },
      { trait_type: 'Repository', value: openClawdCatalog.repositoryUrl },
    ],
  }
})
