/**
 * 🦞 Clawd Code Self-Improvement System
 * 
 * Implements the OODA (Observe-Orient-Decide-Act) loop for continuous
 * AI self-improvement with on-chain memory storage via Solana.
 * 
 * Part of the OpenClawd ecosystem - solanaclawd.com
 * $CLAWD Token: 8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { sha256 } from 'crypto-hash';

// ============================================================================
// OODA Loop Types
// ============================================================================

export interface OODAMetrics {
  observeTime: number;
  orientTime: number;
  decideTime: number;
  actTime: number;
  totalTime: number;
  successRate: number;
  tokensUsed: number;
  costInLamports: number;
}

export interface LearnedSkill {
  id: string;
  name: string;
  description: string;
  pattern: string;
  successCount: number;
  failureCount: number;
  avgCompletionTime: number;
  lastUsed: number;
  createdAt: number;
  ipfsHash: string;
  solanaSignature: string;
}

export interface TaskPattern {
  type: 'git' | 'deploy' | 'refactor' | 'test' | 'debug' | 'general';
  keywords: string[];
  preferredTools: string[];
  successRate: number;
  avgTime: number;
}

// ============================================================================
// OODA Loop Implementation
// ============================================================================

export class OODALoop {
  private metrics: OODAMetrics[] = [];
  private learnedSkills: Map<string, LearnedSkill> = new Map();
  private taskPatterns: Map<string, TaskPattern> = new Map();
  
  // Solana integration
  private connection: Connection;
  private wallet: Keypair | null = null;
  
  constructor(
    heliusRpcUrl: string = 'https://mainnet.helius-rpc.com',
    private rewardRecipient?: PublicKey
  ) {
    this.connection = new Connection(heliusRpcUrl, 'confirmed');
  }

  /**
   * Set the wallet for on-chain rewards
   */
  setWallet(keypair: Keypair): void {
    this.wallet = keypair;
  }

  // ==========================================================================
  // OBSERVE: Scan environment and collect metrics
  // ==========================================================================

  async observe(taskDescription: string): Promise<{
    environment: Record<string, unknown>;
    taskType: TaskPattern['type'];
    relevantSkills: LearnedSkill[];
  }> {
    const startTime = Date.now();
    
    // Scan environment
    const environment = await this.scanEnvironment();
    
    // Determine task type
    const taskType = this.classifyTask(taskDescription);
    
    // Find relevant skills from memory
    const relevantSkills = this.findRelevantSkills(taskType, taskDescription);
    
    const observeTime = Date.now() - startTime;
    this.updateMetrics('observe', observeTime);
    
    return { environment, taskType, relevantSkills };
  }

  private async scanEnvironment(): Promise<Record<string, unknown>> {
    // Scan current directory, git status, package.json, etc.
    return {
      timestamp: Date.now(),
      hasGit: true, // Would check actual git status
      hasPackageJson: true, // Would check actual files
      nodeVersion: process.version,
      platform: process.platform,
    };
  }

  private classifyTask(description: string): TaskPattern['type'] {
    const lower = description.toLowerCase();
    
    if (lower.includes('commit') || lower.includes('push') || lower.includes('branch')) {
      return 'git';
    }
    if (lower.includes('deploy') || lower.includes('solana') || lower.includes('contract')) {
      return 'deploy';
    }
    if (lower.includes('refactor') || lower.includes('restructure')) {
      return 'refactor';
    }
    if (lower.includes('test') || lower.includes('spec')) {
      return 'test';
    }
    if (lower.includes('debug') || lower.includes('fix') || lower.includes('error')) {
      return 'debug';
    }
    return 'general';
  }

  private findRelevantSkills(
    taskType: TaskPattern['type'],
    description: string
  ): LearnedSkill[] {
    const skills: LearnedSkill[] = [];
    
    for (const skill of this.learnedSkills.values()) {
      // Check if skill is relevant to task type
      if (skill.pattern.includes(taskType)) {
        skills.push(skill);
        continue;
      }
      
      // Check keyword matches
      const keywords = description.toLowerCase().split(' ');
      const hasMatch = keywords.some(k => skill.pattern.includes(k));
      if (hasMatch) {
        skills.push(skill);
      }
    }
    
    // Sort by success rate
    return skills.sort((a, b) => 
      (b.successCount / (b.successCount + b.failureCount)) -
      (a.successCount / (a.successCount + a.failureCount))
    );
  }

  // ==========================================================================
  // ORIENT: Process patterns and update memory
  // ==========================================================================

  async orient(
    taskDescription: string,
    taskType: TaskPattern['type'],
    observation: Record<string, unknown>
  ): Promise<{
    strategy: string;
    confidence: number;
    suggestedTools: string[];
  }> {
    const startTime = Date.now();
    
    // Get or create task pattern
    let pattern = this.taskPatterns.get(taskType);
    if (!pattern) {
      pattern = this.createDefaultPattern(taskType);
      this.taskPatterns.set(taskType, pattern);
    }
    
    // Generate strategy based on learned skills
    const { strategy, confidence, suggestedTools } = this.generateStrategy(
      taskDescription,
      taskType,
      pattern
    );
    
    const orientTime = Date.now() - startTime;
    this.updateMetrics('orient', orientTime);
    
    return { strategy, confidence, suggestedTools };
  }

  private createDefaultPattern(type: TaskPattern['type']): TaskPattern {
    const defaults: Record<TaskPattern['type'], TaskPattern> = {
      git: {
        type: 'git',
        keywords: ['commit', 'push', 'pull', 'branch'],
        preferredTools: ['BashTool', 'GrepTool'],
        successRate: 0.8,
        avgTime: 30000,
      },
      deploy: {
        type: 'deploy',
        keywords: ['deploy', 'solana', 'contract', 'program'],
        preferredTools: ['BashTool', 'SolanaTool'],
        successRate: 0.7,
        avgTime: 120000,
      },
      refactor: {
        type: 'refactor',
        keywords: ['refactor', 'restructure', 'clean'],
        preferredTools: ['FileEditTool', 'GlobTool'],
        successRate: 0.75,
        avgTime: 60000,
      },
      test: {
        type: 'test',
        keywords: ['test', 'spec', 'verify'],
        preferredTools: ['BashTool', 'FileReadTool'],
        successRate: 0.85,
        avgTime: 45000,
      },
      debug: {
        type: 'debug',
        keywords: ['debug', 'fix', 'error', 'issue'],
        preferredTools: ['GrepTool', 'BashTool', 'FileReadTool'],
        successRate: 0.65,
        avgTime: 90000,
      },
      general: {
        type: 'general',
        keywords: [],
        preferredTools: ['BashTool', 'GrepTool', 'FileReadTool'],
        successRate: 0.7,
        avgTime: 60000,
      },
    };
    
    return defaults[type];
  }

  private generateStrategy(
    taskDescription: string,
    taskType: TaskPattern['type'],
    pattern: TaskPattern
  ): { strategy: string; confidence: number; suggestedTools: string[] } {
    // Base confidence on historical success rate
    const baseConfidence = pattern.successRate;
    
    // Adjust based on skill availability
    const relevantSkills = this.findRelevantSkills(taskType, taskDescription);
    const skillBonus = Math.min(relevantSkills.length * 0.05, 0.2);
    
    const confidence = Math.min(baseConfidence + skillBonus, 0.99);
    
    // Build strategy from pattern and relevant skills
    let strategy = `Approach: ${taskType} task\n`;
    strategy += `Using learned patterns from ${relevantSkills.length} similar tasks\n`;
    
    if (relevantSkills.length > 0) {
      const topSkill = relevantSkills[0];
      strategy += `Best matching skill: ${topSkill.name}\n`;
      strategy += `Success rate: ${(topSkill.successCount / (topSkill.successCount + topSkill.failureCount) * 100).toFixed(1)}%\n`;
    }
    
    return {
      strategy,
      confidence,
      suggestedTools: pattern.preferredTools,
    };
  }

  // ==========================================================================
  // DECIDE: Choose optimal strategy
  // ==========================================================================

  async decide(
    taskDescription: string,
    strategy: string,
    confidence: number,
    suggestedTools: string[]
  ): Promise<{
    actionPlan: string[];
    estimatedCost: number;
    requiresConfirmation: boolean;
  }> {
    const startTime = Date.now();
    
    // Break down into actionable steps
    const actionPlan = this.createActionPlan(taskDescription, suggestedTools);
    
    // Estimate cost in lamports (roughly $0.000001 per action)
    const estimatedCost = actionPlan.length * 10000; // lamports
    
    // Require confirmation for high-cost or uncertain actions
    const requiresConfirmation = confidence < 0.7 || estimatedCost > 100000;
    
    const decideTime = Date.now() - startTime;
    this.updateMetrics('decide', decideTime);
    
    return { actionPlan, estimatedCost, requiresConfirmation };
  }

  private createActionPlan(taskDescription: string, tools: string[]): string[] {
    const plan: string[] = [];
    
    // Always start with analysis
    plan.push(`1. Analyze: ${taskDescription}`);
    
    // Add tool usage based on context
    if (tools.includes('GrepTool')) {
      plan.push('2. Search codebase for relevant patterns');
    }
    if (tools.includes('FileReadTool')) {
      plan.push('3. Read relevant files');
    }
    if (tools.includes('BashTool')) {
      plan.push('4. Execute necessary commands');
    }
    if (tools.includes('FileEditTool')) {
      plan.push('5. Make necessary edits');
    }
    if (tools.includes('SolanaTool')) {
      plan.push('6. Interact with Solana blockchain');
    }
    
    // End with verification
    plan.push(`${plan.length + 1}. Verify changes and report`);
    
    return plan;
  }

  // ==========================================================================
  // ACT: Execute and record
  // ==========================================================================

  async act(
    taskDescription: string,
    actionPlan: string[],
    success: boolean,
    metrics: {
      tokensUsed: number;
      completionTime: number;
      errors: string[];
    }
  ): Promise<{
    skillEarned: number;
    skillCreated: boolean;
    txSignature?: string;
  }> {
    const startTime = Date.now();
    
    // Update skill patterns
    const { skillEarned, skillCreated } = await this.recordOutcome(
      taskDescription,
      actionPlan,
      success,
      metrics
    );
    
    // Publish to Solana if wallet is set
    let txSignature: string | undefined;
    if (this.wallet && success && skillCreated) {
      txSignature = await this.publishSkillOnChain();
    }
    
    const actTime = Date.now() - startTime;
    this.updateMetrics('act', actTime);
    
    return { skillEarned, skillCreated, txSignature };
  }

  private async recordOutcome(
    taskDescription: string,
    actionPlan: string[],
    success: boolean,
    metrics: {
      tokensUsed: number;
      completionTime: number;
      errors: string[];
    }
  ): Promise<{ skillEarned: number; skillCreated: boolean }> {
    // Create or update skill
    const skillId = sha256(taskDescription.slice(0, 100));
    const existingSkill = this.learnedSkills.get(skillId);
    
    if (existingSkill) {
      // Update existing skill
      if (success) {
        existingSkill.successCount++;
      } else {
        existingSkill.failureCount++;
      }
      existingSkill.lastUsed = Date.now();
      existingSkill.avgCompletionTime = 
        (existingSkill.avgCompletionTime + metrics.completionTime) / 2;
      
      this.learnedSkills.set(skillId, existingSkill);
      return { skillEarned: success ? 10 : 0, skillCreated: false };
    }
    
    // Create new skill
    const newSkill: LearnedSkill = {
      id: skillId,
      name: this.generateSkillName(taskDescription),
      description: taskDescription,
      pattern: actionPlan.join(' → '),
      successCount: success ? 1 : 0,
      failureCount: success ? 0 : 1,
      avgCompletionTime: metrics.completionTime,
      lastUsed: Date.now(),
      createdAt: Date.now(),
      ipfsHash: '', // Will be set when published
      solanaSignature: '', // Will be set when published
    };
    
    this.learnedSkills.set(skillId, newSkill);
    
    // Calculate reward
    const skillEarned = success ? 50 : 0;
    
    return { skillEarned, skillCreated: success };
  }

  private generateSkillName(description: string): string {
    const words = description.split(' ')
      .filter(w => w.length > 3)
      .slice(0, 3);
    return `skill_${words.join('_').toLowerCase()}_${Date.now().toString(36)}`;
  }

  // ==========================================================================
  // Solana Integration
  // ==========================================================================

  async publishSkillOnChain(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not set. Call setWallet() first.');
    }

    // In production, this would:
    // 1. Upload skill data to IPFS
    // 2. Create a Solana transaction to store the IPFS hash
    // 3. Send $CLAWD reward to the wallet
    
    // For now, create a placeholder transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.wallet.publicKey,
        toPubkey: this.rewardRecipient || this.wallet.publicKey,
        lamports: 0, // Zero lamport transfer as placeholder
      })
    );

    const signature = await this.connection.sendTransaction(transaction, [this.wallet]);
    await this.connection.confirmTransaction(signature);
    
    return signature;
  }

  async claimRewards(): Promise<number> {
    // Claim accumulated $CLAWD rewards
    // This would interact with the $CLAWD token program
    return 0; // Placeholder
  }

  // ==========================================================================
  // Metrics & State
  // ==========================================================================

  private updateMetrics(stage: keyof OODAMetrics, duration: number): void {
    const currentMetric = this.metrics[this.metrics.length - 1] || {
      observeTime: 0,
      orientTime: 0,
      decideTime: 0,
      actTime: 0,
      totalTime: 0,
      successRate: 0,
      tokensUsed: 0,
      costInLamports: 0,
    };

    currentMetric[`${stage}Time`] = duration;
    currentMetric.totalTime = 
      currentMetric.observeTime +
      currentMetric.orientTime +
      currentMetric.decideTime +
      currentMetric.actTime;
  }

  getMetrics(): OODAMetrics[] {
    return this.metrics;
  }

  getSkills(): LearnedSkill[] {
    return Array.from(this.learnedSkills.values());
  }

  getTotalEarned(): number {
    let total = 0;
    for (const skill of this.learnedSkills.values()) {
      total += skill.successCount * 10 + (skill.successCount > 5 ? 50 : 0);
    }
    return total;
  }

  // ==========================================================================
  // Display Methods
  // ==========================================================================

  displayStatus(): void {
    const skills = this.getSkills();
    const totalEarned = this.getTotalEarned();
    const latestMetrics = this.metrics[this.metrics.length - 1];

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🦞 OODA Loop Self-Improvement Status                       ║
╠═══════════════════════════════════════════════════════════════╣
║  OBSERVE  → Scan environment, collect metrics               ║
║  ORIENT   → Process patterns, update memory                 ║
║  DECIDE   → Choose optimal strategy                         ║
║  ACT      → Execute, record, earn rewards                   ║
╠═══════════════════════════════════════════════════════════════╣
║  Skills Learned:     ${skills.length.toString().padEnd(39)}║
║  $CLAWD Earned:     ${totalEarned.toString().padEnd(39)}║
║  Avg Task Time:      ${latestMetrics?.totalTime ? `${latestMetrics.totalTime}ms` : 'N/A'.padEnd(32)}║
║  Success Rate:       ${latestMetrics?.successRate ? `${(latestMetrics.successRate * 100).toFixed(1)}%` : 'N/A'.padEnd(32)}║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createOODALoop(heliusRpcUrl?: string): OODALoop {
  return new OODALoop(heliusRpcUrl);
}

// ============================================================================
// CLI Helpers
// ============================================================================

export async function showBlockchainStatus(connection: Connection, wallet: PublicKey): Promise<void> {
  const balance = await connection.getBalance(wallet);
  
  console.log(`
┌─────────────────────────────────────────────┐
│  🦞 Blockchain Integration Status          │
│  ─────────────────────────────────────     │
│  SOL Balance:     ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL              │
│  $CLAWD Rewards:  [check with clawd rewards]│
│  Skills Memory:   [stored locally]          │
│  MCP Tools:      [payment-ready]           │
└─────────────────────────────────────────────┘
  `);
}
