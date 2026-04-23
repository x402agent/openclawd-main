// Bridges the OpenClawd Orchestrator to Metaplex Core + Agent Registry + Genesis.
// Enables: mint agent (Core asset + Agent Identity PDA), register identity,
// launch agent tokens (Genesis bonding curve), delegate execution.

// Lazy imports so the orchestrator still boots if packages aren't built yet.
type MplCoreModule = typeof import('@metaplex-foundation/mpl-core');
type MplAgentModule = typeof import('@metaplex-foundation/mpl-agent-registry');
type GenesisModule = typeof import('@metaplex-foundation/genesis');
type UmiModule = typeof import('@metaplex-foundation/umi-bundle-defaults');

export interface MintAgentArgs {
  /** Privy wallet that owns and pays for the transaction */
  wallet: string;
  /** Human-readable name displayed on the Core asset */
  name: string;
  /** Publicly accessible URI pointing to the Core asset NFT JSON metadata */
  uri: string;
  /** Off-chain agent metadata stored by the Metaplex API (ERC-8004) */
  agentMetadata?: {
    type?: string;
    name: string;
    description: string;
    services?: Array<{ name: string; endpoint: string; version?: string }>;
    registrations?: Array<{ agentId: string; agentRegistry: string }>;
    supportedTrust?: string[];
  };
  /** Network: 'solana-mainnet' (default) or 'solana-devnet' */
  network?: 'solana-mainnet' | 'solana-devnet';
}

export interface MintAgentResult {
  /** The MPL Core asset address (PDA) */
  assetAddress: string;
  /** Transaction signature */
  signature: string;
  /** Agent Identity PDA — derived from asset */
  agentIdentityPda: string;
}

export interface LaunchTokenArgs {
  /** The Core asset address of the registered agent */
  agentMint: string;
  /** Set to true to permanently associate this token with the agent (irreversible) */
  setToken: boolean;
  /** Token name (1–32 chars) */
  tokenName: string;
  /** Token symbol (1–10 chars) */
  tokenSymbol: string;
  /** Irys gateway URL for token image (must be gateway.irys.xyz) */
  imageUrl: string;
  /** Optional SOL amount for first buy — fee-free for the agent PDA */
  firstBuyAmount?: number;
  /** Optional description */
  description?: string;
  /** Network override */
  network?: 'solana-mainnet' | 'solana-devnet';
}

export interface LaunchTokenResult {
  mintAddress: string;
  signature: string;
  /** Metaplex explore link */
  link: string;
}

export interface RegisterIdentityArgs {
  /** Existing MPL Core asset address */
  asset: string;
  /** Collection public key (optional) */
  collection?: string;
  /** URI to ERC-8004 agent registration JSON */
  agentRegistrationUri: string;
}

export interface DelegateExecutionArgs {
  /** Registered agent Core asset address */
  agentAsset: string;
  /** Executive wallet authority public key */
  executiveAuthority: string;
}

export class MetaplexBridge {
  #mods: {
    umi?: UmiModule;
    mplCore?: MplCoreModule;
    mplAgent?: MplAgentModule;
    genesis?: GenesisModule;
  } = {};
  #keypair: Uint8Array | null = null;
  #initialized = false;

  async #ensureInitialized(): Promise<void> {
    if (this.#initialized) return;
    const { createUmi } = await import('@metaplex-foundation/umi-bundle-defaults') as UmiModule;
    const mplCore = await import('@metaplex-foundation/mpl-core') as MplCoreModule;
    const mplAgent = await import('@metaplex-foundation/mpl-agent-registry') as MplAgentModule;
    const genesis = await import('@metaplex-foundation/genesis') as GenesisModule;

    const rpcUrl = process.env.HELIUS_RPC ?? 'https://api.mainnet-beta.solana.com';
    const umi = createUmi(rpcUrl);

    this.#mods = { umi, mplCore, mplAgent, genesis };
    this.#initialized = true;
  }

  /**
   * Mint a new Metaplex Core agent asset AND register the Agent Identity PDA
   * in a single atomic transaction via the Metaplex API.
   * https://docs.metaplex.com/agents/getting-started/mint-an-agent
   */
  async mintAgent(args: MintAgentArgs): Promise<MintAgentResult> {
    await this.#ensureInitialized();
    const { umi, mplAgent, mplCore } = this.#mods;

    const { keypairIdentity, publicKey } = await import('@metaplex-foundation/umi') as any;

    // Load keypair from Privy-wallet private key PEM
    const pem = process.env.PRIVY_AUTH_PRIVATE_KEY ?? '';
    if (pem && !this.#keypair) {
      try {
        const pemBody = pem.includes('-----BEGIN') ? pem.split('-----BEGIN')[2] : pem;
        const base64 = pemBody.replace(/-----.*-----/g, '').replace(/\s/g, '');
        this.#keypair = Buffer.from(base64, 'base64');
      } catch {
        // will be handled below
      }
    }

    const keypair = this.#keypair
      ? (umi as any).eddsa.createKeypairFromSecretKey(this.#keypair)
      : (umi as any).keypairIdentity(
          (umi as any).identity || { publicKey: publicKey(args.wallet) }
        );

    if (!this.#keypair) {
      // Use signer from Privy wallet address
      const signerModule = await import('@metaplex-foundation/umi');
      const signer = (signerModule.createNoopSigner as any)(
        (signerModule.publicKey as any)(args.wallet)
      );
      (umi as any).use((signerModule.keypairIdentity as any)(signer as any));
    }

    const { mintAndSubmitAgent } = mplAgent;
    const { mplAgentIdentity } = mplAgent;

    (umi as any).use(mplAgentIdentity());

    const walletPublicKey = (publicKey as any)(args.wallet);

    const metadata = args.agentMetadata ?? {
      type: 'agent',
      name: args.name,
      description: `OpenClawd agent: ${args.name}`,
      services: [],
      registrations: [],
      supportedTrust: [],
    };

    const network = args.network ?? 'solana-mainnet';

    try {
      const result = await (mintAndSubmitAgent as any)(
        umi,
        { baseUrl: 'https://api.metaplex.com' },
        {
          wallet: walletPublicKey,
          name: args.name,
          uri: args.uri,
          agentMetadata: metadata,
          network,
        },
      );

      // Derive agent identity PDA
      const { findAgentIdentityV1Pda } = mplAgent;
      const identityPda = (findAgentIdentityV1Pda as any)(umi, { asset: result.assetAddress });

      return {
        assetAddress: result.assetAddress.toString(),
        signature: result.signature,
        agentIdentityPda: identityPda.toString(),
      };
    } catch (err) {
      console.error('[metaplex-bridge] mintAgent failed:', String(err));
      throw err;
    }
  }

  /**
   * Register identity on an existing MPL Core asset.
   * Use when you already own a Core asset and want to attach agent identity.
   */
  async registerIdentity(args: RegisterIdentityArgs): Promise<{ signature: string }> {
    await this.#ensureInitialized();
    const { umi, mplAgent } = this.#mods;

    const { registerIdentityV1 } = mplAgent;
    const { publicKey } = await import('@metaplex-foundation/umi') as any;

    const { keypairIdentity } = await import('@metaplex-foundation/umi') as any;

    const signer = (umi as any).identity;
    (umi as any).use(keypairIdentity(signer));

    await (registerIdentityV1 as any)(umi, {
      asset: (publicKey as any)(args.asset),
      collection: args.collection ? (publicKey as any)(args.collection) : undefined,
      agentRegistrationUri: args.agentRegistrationUri,
    }).sendAndConfirm(umi);

    return { signature: '' };
  }

  /**
   * Launch an agent token via Genesis bonding curve.
   * Creator fees auto-route to the agent's Core asset signer PDA.
   * `setToken: true` permanently links this token to the agent (irreversible).
   */
  async launchAgentToken(args: LaunchTokenArgs): Promise<LaunchTokenResult> {
    await this.#ensureInitialized();
    const { umi, genesis, mplCore } = this.#mods;

    const { createAndRegisterLaunch } = genesis;
    const { publicKey } = await import('@metaplex-foundation/umi') as any;
    const { keypairIdentity } = await import('@metaplex-foundation/umi') as any;

    const signer = (umi as any).identity;
    (umi as any).use(keypairIdentity(signer));

    const result = await (createAndRegisterLaunch as any)(
      umi,
      {},
      {
        wallet: (publicKey as any)(args.wallet ?? (umi as any).identity.publicKey),
        agent: {
          mint: (publicKey as any)(args.agentMint),
          setToken: args.setToken,
        },
        launchType: 'bondingCurve',
        token: {
          name: args.tokenName,
          symbol: args.tokenSymbol,
          image: args.imageUrl,
          description: args.description,
        },
        launch: {
          firstBuyAmount: args.firstBuyAmount ?? 0,
        },
        network: args.network ?? 'solana-mainnet',
      },
    );

    return {
      mintAddress: result.mintAddress.toString(),
      signature: result.signature ?? '',
      link: result.launch?.link ?? `https://www.metaplex.com/launch/${result.mintAddress}`,
    };
  }

  /**
   * Register an executive profile (one per wallet) and delegate execution
   * of an agent to that executive.
   */
  async delegateExecution(args: DelegateExecutionArgs): Promise<{ signature: string }> {
    await this.#ensureInitialized();
    const { umi, mplAgent } = this.#mods;

    const { registerExecutiveV1, delegateExecutionV1, findAgentIdentityV1Pda, findExecutiveProfileV1Pda } = mplAgent;
    const { publicKey } = await import('@metaplex-foundation/umi') as any;
    const { keypairIdentity } = await import('@metaplex-foundation/umi') as any;

    const signer = (umi as any).identity;
    (umi as any).use(keypairIdentity(signer));

    // 1. Register executive profile
    await (registerExecutiveV1 as any)(umi, {
      payer: (umi as any).identity,
    }).sendAndConfirm(umi);

    // 2. Derive PDAs
    const agentIdentity = (findAgentIdentityV1Pda as any)(umi, {
      asset: (publicKey as any)(args.agentAsset),
    });
    const executiveProfile = (findExecutiveProfileV1Pda as any)(umi, {
      authority: (publicKey as any)(args.executiveAuthority),
    });

    // 3. Delegate
    await (delegateExecutionV1 as any)(umi, {
      agentAsset: (publicKey as any)(args.agentAsset),
      agentIdentity,
      executiveProfile,
    }).sendAndConfirm(umi);

    return { signature: '' };
  }

  /**
   * Fetch agent data from on-chain.
   * Checks: AgentIdentity plugin, lifecycle hooks, registration URI.
   */
  async readAgentData(assetAddress: string): Promise<Record<string, unknown>> {
    await this.#ensureInitialized();
    const { umi, mplCore, mplAgent } = this.#mods;

    const { fetchAsset } = mplCore;
    const { findAgentIdentityV1Pda, safeFetchAgentIdentityV1 } = mplAgent;
    const { publicKey } = await import('@metaplex-foundation/umi') as any;

    const assetPubkey = (publicKey as any)(assetAddress);

    // Fetch Core asset
    const assetData = await (fetchAsset as any)(umi, assetPubkey);

    // Fetch identity
    const identityPda = (findAgentIdentityV1Pda as any)(umi, { asset: assetPubkey });
    const identity = await (safeFetchAgentIdentityV1 as any)(umi, identityPda);

    // Fetch agent wallet (Asset Signer PDA)
    const { findAssetSignerPda } = mplCore;
    const walletPda = (findAssetSignerPda as any)(umi, { asset: assetPubkey });

    // Balance check
    const balance = await (umi as any).rpc.getBalance(walletPda);

    // Registration doc
    let registrationDoc = null;
    if (identity?.uri) {
      try {
        const res = await fetch(identity.uri);
        registrationDoc = await res.json();
      } catch {
        // URI unreachable — non-fatal
      }
    }

    return {
      assetAddress,
      name: assetData.name,
      uri: assetData.uri,
      owner: assetData.owner.toString(),
      updateAuthority: assetData.updateAuthority?.toString(),
      agentIdentity: identity
        ? {
            uri: identity.uri,
            lifecycleChecks: identity.lifecycleChecks,
          }
        : null,
      assetSignerWallet: walletPda.toString(),
      walletBalanceLamports: balance.basisPoints.toString(),
      registrationDoc,
    };
  }
}