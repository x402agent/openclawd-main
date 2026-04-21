
export interface AgentDNA {
  name: string;
  handle: string;
  bio: string;
  personality: string;
  tier: string;
  capabilities: Set<string>;
  model: string;
  systemPrompt: string;
  temperature: number;
  lore: string;
}

export interface ArtConfig {
  style: string;
  prompt: string;
  provider: string;
  imageUrl: string | null;
  generating: boolean;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  mintAuth: boolean;
  freezeAuth: boolean;
}

export interface CandyMachineConfig {
  items: number;
  fee: number;
  standard: string;
  preset: string;
  price: number;
  startDate: string;
  endDate: string;
  mintLimit: number;
  hidden: boolean;
  sequential: boolean;
}

export interface TreeNode {
  name: string;
  action: string;
  hash: string;
  children?: TreeNode[];
}

export interface DeploymentStep {
  step: number;
  msg: string;
  time: string;
}

export interface Attestation {
  id: string;
  action: string;
  model: string;
  verified: boolean;
  timestamp: string;
}
