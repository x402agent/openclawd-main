// ============================================================================
// OpenClawd Attestation Integration for Data API SDK
// ============================================================================

/**
 * Attestation interfaces and types for the data API
 */

export interface AttestationInfo {
  address: string;
  skillId?: string;
  verifierPubkey?: string;
  proofHash?: string;
  timestamp?: number;
  isVerified?: boolean;
  schema: string;
  programId: string;
}

export interface AttestationStatus {
  exists: boolean;
  attestation?: AttestationInfo;
  verifiedAt?: number;
  signature?: string;
}

export interface SkillAttestationParams {
  skillId: string;
  verifierId: string;
  proofHash: string;
  timestamp: number;
}

export interface AgentIdentityParams {
  agentId: string;
  walletPubkey: string;
  vaultAddress: string;
  skillAttestation?: string;
}

export interface PluginAttestationParams {
  pluginId: string;
  authorPubkey: string;
  attestationRef: string;
  auditProofHash: string;
  timestamp: number;
}

/**
 * Attestation schema definitions for OpenClawd
 */
export const ATTESTATION_SCHEMAS = {
  SKILL: {
    name: 'OpenClawdSkillAttestation',
    layout: [12, 32, 12, 8, 1] as const, // String, Pubkey, String, U64, Bool
    fieldNames: [
      'skill_id',
      'verifier_pubkey',
      'proof_hash',
      'verification_timestamp',
      'is_formally_verified',
    ],
  },
  AGENT_IDENTITY: {
    name: 'OpenClawdAgentIdentity',
    layout: [12, 32, 12, 32, 1] as const, // String, Pubkey, String, Pubkey, Bool
    fieldNames: [
      'agent_id',
      'wallet_pubkey',
      'skill_attestation',
      'vault_address',
      'is_vault_initialized',
    ],
  },
  PLUGIN: {
    name: 'OpenClawdPluginAttestation',
    layout: [12, 32, 12, 34, 8, 1] as const, // String, Pubkey, String, ProofHash, U64, Bool
    fieldNames: [
      'plugin_id',
      'author_pubkey',
      'attestation_ref',
      'audit_proof_hash',
      'timestamp',
      'is_audited',
    ],
  },
} as const;

// SAS Program Constants
export const SAS_PROGRAM_ID = '22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG';
export const TOKEN_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
export const EVENT_AUTHORITY_PDA = 'DzSpKpST2TSyrxokMXchFz3G2yn5WEGoxzpGEUDjCX4g';

/**
 * Attestation verification response
 */
export interface AttestationVerificationResponse {
  verified: boolean;
  attestation?: AttestationInfo;
  proofValid?: boolean;
  signature?: string;
}

/**
 * Agent attestation with vault info
 */
export interface AgentAttestation extends AttestationInfo {
  agentId: string;
  walletPubkey: string;
  vaultAddress: string;
  isVaultInitialized: boolean;
  mintedAt?: number;
  collection?: string;
}

/**
 * Plugin attestation with audit info
 */
export interface PluginAttestation extends AttestationInfo {
  pluginId: string;
  authorPubkey: string;
  auditProofHash: string;
  isAudited: boolean;
  auditReportUrl?: string;
}

/**
 * Create attestation parameters
 */
export interface CreateAttestationParams {
  payer: string;
  authority: string;
  schemaName: keyof typeof ATTESTATION_SCHEMAS;
  data: Buffer;
  expiry?: number;
}

/**
 * Attestation search filters
 */
export interface AttestationSearchFilters {
  schema?: keyof typeof ATTESTATION_SCHEMAS;
  verifier?: string;
  fromTimestamp?: number;
  toTimestamp?: number;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Attestation search response
 */
export interface AttestationSearchResponse {
  attestations: AttestationInfo[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

/**
 * Vault integration info
 */
export interface VaultInfo {
  address: string;
  authority: string;
  agentCount: number;
  totalValue?: number;
  createdAt: number;
}

/**
 * Metaplex agent identity info
 */
export interface MetaplexAgentInfo {
  assetAddress: string;
  name: string;
  uri: string;
  updateAuthority: string;
  mintAuthority?: string;
  collection?: string;
  attested: boolean;
  attestationAddress?: string;
}

/**
 * Attestation events for tracking
 */
export interface AttestationEvent {
  type: 'created' | 'verified' | 'revoked' | 'expired';
  attestationAddress: string;
  timestamp: number;
  transactionSignature?: string;
  triggeredBy?: string;
}

/**
 * Convert attestation schema type to readable format
 */
export function getSchemaTypeName(schema: keyof typeof ATTESTATION_SCHEMAS): string {
  return ATTESTATION_SCHEMAS[schema].name;
}

/**
 * Get schema layout as bytes
 */
export function getSchemaLayout(schema: keyof typeof ATTESTATION_SCHEMAS): number[] {
  return [...ATTESTATION_SCHEMAS[schema].layout];
}

/**
 * Validate attestation data against schema
 */
export function validateAttestationData(
  data: Buffer,
  schema: keyof typeof ATTESTATION_SCHEMAS
): { valid: boolean; errors?: string[] } {
  const schemaDef = ATTESTATION_SCHEMAS[schema];
  const errors: string[] = [];

  // Basic validation - in production would do full schema validation
  if (data.length < 1) {
    errors.push('Data too short');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Format attestation address for display
 */
export function formatAttestationAddress(address: string, truncate = true): string {
  if (truncate && address.length > 16) {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }
  return address;
}

/**
 * Parse attestation data from on-chain account
 */
export function parseAttestationData(
  data: Buffer,
  schema: keyof typeof ATTESTATION_SCHEMAS
): AttestationInfo | null {
  try {
    // Skip discriminator byte
    const payload = data.slice(1);
    
    // Basic parsing based on schema
    let offset = 0;
    
    switch (schema) {
      case 'SKILL':
        // Parse skill attestation
        const skillIdLen = payload.readUInt32LE(offset);
        offset += 4;
        const skillId = payload.slice(offset, offset + skillIdLen).toString();
        offset += skillIdLen;
        
        const verifierPubkey = payload.slice(offset, offset + 32).toString('hex');
        offset += 32;
        
        const proofHashLen = payload.readUInt32LE(offset);
        offset += 4;
        const proofHash = payload.slice(offset, offset + proofHashLen).toString();
        offset += proofHashLen;
        
        const timestamp = Number(payload.readBigUInt64LE(offset));
        offset += 8;
        
        const isVerified = payload[offset] === 1;
        
        return {
          address: '',
          skillId,
          verifierPubkey: `0x${verifierPubkey}`,
          proofHash,
          timestamp,
          isVerified,
          schema: ATTESTATION_SCHEMAS.SKILL.name,
          programId: SAS_PROGRAM_ID,
        };
        
      case 'AGENT_IDENTITY':
        // Parse agent identity
        const agentIdLen = payload.readUInt32LE(offset);
        offset += 4;
        const agentId = payload.slice(offset, offset + agentIdLen).toString();
        offset += agentIdLen;
        
        const walletPubkey = payload.slice(offset, offset + 32).toString('hex');
        offset += 32;
        
        return {
          address: '',
          skillId: agentId,
          verifierPubkey: `0x${walletPubkey}`,
          schema: ATTESTATION_SCHEMAS.AGENT_IDENTITY.name,
          programId: SAS_PROGRAM_ID,
        };
        
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export default {
  ATTESTATION_SCHEMAS,
  SAS_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  EVENT_AUTHORITY_PDA,
  getSchemaTypeName,
  getSchemaLayout,
  validateAttestationData,
  formatAttestationAddress,
  parseAttestationData,
};