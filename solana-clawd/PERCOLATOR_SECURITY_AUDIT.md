# 🦂 Percolator Immutable Market: Security Audit & Exploitation Research

## Executive Summary

This document analyzes the security posture of an immutable Percolator market deployment with:
- 5 SOL (5,000,000,000 lamports) in the insurance fund
- All admin keys burned to `11111111111111111111111111111111`
- Oracle authority burned
- Permissionless keeper crank

**Objective**: Identify exploitable vulnerabilities to extract the insurance fund.

---

## Deployment Configuration

```
Program ID:     2SSnp35m7FQ7cRLNKGdW5UzjYFF6RBUNq7d3m5mqNByp
Slab Account:   [USER_DEFINED]
Admin Key:      11111111111111111111111111111111 (BURNED)
Oracle Auth:    11111111111111111111111111111111 (BURNED)
Insurance:      5,000,000,000 lamports (5 SOL)
Oracle Feed:    Pyth SOL/USD
```

---

## Attack Surface Analysis

### 1. Oracle Manipulation (HIGH PRIORITY)

#### Attack Vector
Since oracle authority is burned, the market relies solely on Pyth oracle prices. However:

1. **Pyth Price Confidence**: If confidence interval is large enough, mark-index divergence occurs
2. **Staleness Exploitation**: Oracle staleness thresholds may allow outdated prices
3. **Cross-Exchange Correlation**: Manipulating Binance/Coinbase may influence Pyth aggregators

#### Exploitation Steps
```bash
# 1. Check current oracle staleness
percolator slab-engine --slab <SLAB> | grep -i "last_update"

# 2. Check confidence filter
percolator slab-params --slab <SLAB> | grep -i "conf_filter"

# 3. Check max staleness setting
percolator slab-params --slab <SLAB> | grep -i "max_staleness"
```

#### Potential Impact
- Artificial price divergence creates funding rate arbitrage
- Can trigger mass liquidations at manipulated prices
- Insurance fund drains when cascading liquidations occur

#### Research Questions
- [ ] Can we find blocks where Pyth confidence is low?
- [ ] Can we sandwich oracle updates?
- [ ] Does `max_staleness_secs` allow stale prices?

---

### 2. Liquidation Circuit Exploits (HIGH PRIORITY)

#### Attack Vector
The liquidation circuit has multiple parameters that could have edge cases:

1. **Liquidation Fee Calculation**: `liquidation_fee_bps` and `liquidation_fee_cap`
2. **Buffer Calculation**: `liquidation_buffer_bps` for margin calculations
3. **Minimum Liquidation**: `min_liquidation_abs` threshold

#### Code Analysis Targets

```rust
// Potential areas to analyze:
fn liquidate_at_oracle(/* ... */) -> Result<()> {
    // 1. Check if position is liquidatable
    // 2. Calculate liquidation fee
    // 3. Transfer collateral to insurance
    // 4. Update position state
}

fn is_liquidatable(position: &Position, mark_price: u64) -> bool {
    // Check maintenance margin vs equity
    // Potential: rounding errors, overflow
}

fn calculate_liquidation_fee(size: i128, price: u64) -> Result<u64> {
    // fee = size * price * fee_bps / 10000
    // capped at fee_cap
    // Potential: u128 overflow, cap bypass
}
```

#### Exploitation Steps
```bash
# 1. List all accounts to find undercollateralized positions
percolator slab-accounts --slab <SLAB>

# 2. For each account, calculate distance to liquidation
#    Position must have equity < maintenance_margin * notional

# 3. Execute liquidation
percolator liquidate-at-oracle \
  --slab <SLAB> \
  --target-idx <USER_IDX> \
  --oracle <ORACLE>
```

#### Potential Impact
- Liquidate healthy positions if calculation bugs exist
- Extract excess liquidation fees
- Force insurance fund to pay invalid claims

#### Research Questions
- [ ] Can liquidation fee exceed position equity?
- [ ] Are there rounding exploits in fee calculation?
- [ ] Can we liquidate positions with positive equity?

---

### 3. Funding Rate Calculation (MEDIUM-HIGH PRIORITY)

#### Attack Vector
The EWMA-based funding rate calculation:

```rust
// From percolator.rs
fn calculate_funding_rate(
    mark_ewma: u64,    // Trade-derived mark
    index_price: u64,  // Oracle index
    horizon: u64,      // Funding horizon slots
    k_bps: u64,        // Funding multiplier
) -> i64 {
    // premium = (mark - index) / index
    // funding = premium * k / horizon
    // Return: bps per slot (signed)
}
```

#### Exploitation Steps
```bash
# 1. Monitor mark-index spread
percolator slab-engine --slab <SLAB> | grep -i "mark"

# 2. Check funding rate parameters
percolator slab-params --slab <SLAB> | grep -i "funding"

# 3. Calculate potential funding payments
#    If mark >> index, longs pay shorts
#    If mark << index, shorts pay longs
```

#### Potential Impact
- Large mark-index divergence drains positions via funding
- Can create artificial funding rate spikes
- Insurance benefits from funding payments

#### Research Questions
- [ ] Can we manipulate the EWMA mark through wash trading?
- [ ] Is there a horizon slots calculation bug?
- [ ] Can k_bps be exploited for instant funding?

---

### 4. U128 Math Vulnerabilities (HIGH PRIORITY)

#### Attack Vector
The Percolator uses U128 arithmetic for precise calculations:

```rust
// Critical U128 operations
struct U128 {
    lo: u64,
    hi: u64,
}

// Potential overflow/underflow in:
fn add(a: U128, b: U128) -> U128
fn sub(a: U128, b: U128) -> Result<U128>
fn mul(a: U128, b: U128) -> U128
fn div(a: U128, b: U128) -> U128
```

#### Exploitation Steps
```bash
# 1. Find edge case position sizes
# 2. Look for u128::MAX or near-zero values
# 3. Test arithmetic with boundary conditions

# 4. Check position sizes
percolator slab-accounts --slab <SLAB> | grep -i "size"
```

#### Critical Patterns to Search
```
- U128 overflow: (max - 1) + 1
- U128 underflow: 0 - 1  
- Signed overflow: i128 max + 1
- Division by zero: x / 0
- Precision loss: large_number * small_number >> overflow
```

#### Research Questions
- [ ] Can position size overflow U128?
- [ ] Is there a case where PnL calculation overflows?
- [ ] Can collateral calculations underflow?

---

### 5. Account Slot Management (MEDIUM PRIORITY)

#### Attack Vector
The slab uses a slot allocation system:

```rust
// From percolator.rs
struct SlabHeader {
    free_head: u64,        // LIFO freelist head
    next_free: Vec<u64>,   // Next free slot array
    used_slots: Bitmap,    // Used slot tracking
}

// Allocation: LIFO pop from freelist
fn allocate_slot(&mut self) -> u64 {
    let idx = self.free_head;
    self.free_head = self.next_free[idx];
    self.used_slots.set(idx);
    idx
}
```

#### Exploitation Steps
```bash
# 1. Check slot allocation pattern
percolator slab-accounts --slab <SLAB>

# 2. Find freed slots
# 3. Check if bitmap matches freelist

# 4. Try to reallocate freed slot
spl-token create-account <TOKEN>  # Initialize user
```

#### Potential Issues
- **Freelist vs Bitmap Mismatch**: Different views of available slots
- **Double-Free**: Slot allocated twice
- **Use-After-Free**: Slot used after being freed
- **LIFO vs FIFO**: Bitmap scan returns different slot than freelist

#### Research Questions
- [ ] Does GC update the freelist correctly?
- [ ] Is the bitmap always in sync?
- [ ] Can we force slot collision?

---

### 6. Keeper Crank Exploits (MEDIUM PRIORITY)

#### Attack Vector
The keeper crank is permissionless, executing:
1. Funding rate updates
2. Insurance fund updates
3. Position maintenance

```rust
fn keeper_crank(
    caller_idx: u32,      // Index of caller (65535 = permissionless)
    allow_panic: bool,
) -> Result<()> {
    // 1. Check if crank is stale
    // 2. Update funding rates
    // 3. Update insurance fund
    // 4. Process liquidations if needed
}
```

#### Exploitation Steps
```bash
# 1. Check crank staleness
percolator slab-engine --slab <SLAB> | grep -i "crank"

# 2. Run crank and observe
percolator keeper-crank --slab <SLAB> --oracle <ORACLE>

# 3. Check if crank can be front-run
```

#### Potential Issues
- **Front-Running**: Sandwich crank transactions
- **Griefing**: Prevent legitimate cranks
- **Partial Execution**: Crank fails mid-way

#### Research Questions
- [ ] Can we skip important crank operations?
- [ ] Is there a reentrancy vulnerability?
- [ ] Can we cause crank to use excess compute?

---

### 7. Cross-Program Invocation (CPI) Attacks (HIGH PRIORITY)

#### Attack Vector
Percolator uses CPI to matcher programs:

```rust
// Trade via CPI requires matcher validation
fn trade_cpi(
    lp_idx: u32,
    user_idx: u32,
    size: i128,
    matcher_program: Pubkey,
    matcher_context: Pubkey,
) -> Result<()> {
    // CPI to matcher program
    invoke_signed(
        &trade_instruction,
        &account_metas,
        &[&[lp_pda_seeds]],
    )?;
}
```

#### Exploitation Steps
```bash
# 1. Find all LP accounts
percolator slab-accounts --slab <SLAB> | grep -i "lp"

# 2. Check matcher programs
# 3. Analyze matcher context for vulnerabilities
```

#### Potential Issues
- **Matcher Bypass**: Trade without proper authorization
- **Fake Matcher**: Point to malicious matcher program
- **Context Replay**: Reuse old matcher contexts
- **PDA Derivation**: Incorrect LP PDA seeds

#### Research Questions
- [ ] Can we create our own LP with malicious matcher?
- [ ] Is there a matcher context validation bug?
- [ ] Can we front-run trades via CPI?

---

### 8. Insurance Fund Extraction (CRITICAL)

#### Attack Vector
Insurance fund can only be extracted via:
1. Liquidation profits
2. Explicit withdrawal (requires surplus)

```rust
fn withdraw_insurance(
    recipient: Pubkey,
    amount: u64,
) -> Result<()> {
    let surplus = insurance_balance - risk_threshold;
    require!(amount <= surplus);
    
    // Transfer from insurance to recipient
    token::transfer(recipient, amount)?;
}
```

#### Exploitation Steps
```bash
# 1. Check insurance balance
percolator slab-engine --slab <SLAB> | grep -i "insurance"

# 2. Check risk threshold
percolator slab-params --slab <SLAB> | grep -i "risk_threshold"

# 3. Calculate surplus
#    surplus = insurance_balance - risk_threshold
```

#### Research Questions
- [ ] Can we drain insurance through mass liquidations?
- [ ] Is there a way to bypass surplus check?
- [ ] Can we manipulate risk_threshold calculation?

---

## Vulnerability Checklist

| Category | Severity | Exploitable | Notes |
|----------|----------|-------------|-------|
| Oracle Manipulation | HIGH | TBD | Depends on Pyth feed |
| Liquidation Bugs | HIGH | TBD | Requires code audit |
| Funding Rate | MEDIUM | TBD | EWMA analysis needed |
| U128 Overflow | HIGH | TBD | Math boundary testing |
| Slot Management | MEDIUM | TBD | Freelist vs bitmap |
| Keeper Crank | MEDIUM | TBD | Permissionless vector |
| CPI Attacks | HIGH | TBD | Matcher analysis |
| Insurance Drain | CRITICAL | TBD | Main objective |

---

## Testing Strategy

### Phase 1: Reconnaissance
```bash
# Gather all market state
percolator slab-config --slab <SLAB> > config.txt
percolator slab-engine --slab <SLAB> > engine.txt
percolator slab-params --slab <SLAB> > params.txt
percolator slab-accounts --slab <SLAB> > accounts.txt

# Analyze for obvious issues
cat params.txt | grep -E "(margin|fee|threshold)"
```

### Phase 2: Edge Case Testing
```bash
# Test liquidation at boundary conditions
# Test position sizes near max/min
# Test timing attacks on crank

# Monitor transactions
solana confirm -v <TX_SIGNATURE>
```

### Phase 3: Exploit Development
```typescript
// Build exploit transactions
// Test on devnet first
// Then attempt on mainnet
```

---

## Key Files to Audit

From `percolator-prog-main/src/`:
1. `percolator.rs` - Main entry point
2. `engine.rs` - Risk engine logic
3. `funding.rs` - Funding rate calculations
4. `liquidation.rs` - Liquidation circuits
5. `math.rs` - U128 operations
6. `slab.rs` - Account/slot management

---

## Conclusion

This audit identifies 8 major attack vectors for extracting the 5 SOL insurance fund. The most promising paths are:

1. **U128 Math Exploits** - Direct path to fund extraction
2. **Liquidation Circuit Bugs** - Potential to drain via invalid liquidations
3. **CPI/Matcher Vulnerabilities** - Could enable unauthorized trading

**Next Steps**:
1. Review source code for identified vulnerabilities
2. Test edge cases on devnet
3. Develop proof-of-concept exploits
4. Deploy immutable test market for experimentation

---

*🦂 5 SOL Challenge: Can you break Percolator?*
