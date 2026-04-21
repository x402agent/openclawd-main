# Solana Go

Go SDK and utilities for Solana blockchain operations.

## Overview

This project provides Go language utilities for interacting with the Solana blockchain, including RPC client, program interactions, and wallet management.

## Features

- RPC client for Solana mainnet and devnet
- Token program interactions (SPL tokens)
- System program operations
- Stake program support
- Transaction building and signing

## Usage

```go
import "github.com/x402agent/solana-go"

// Create RPC client
client := solana.NewRPCClient("https://api.mainnet-beta.solana.com")

// Get account info
info, err := client.GetAccountInfo(context.Background(), accountPubkey)
```

## Installation

```bash
go get github.com/x402agent/solana-go
```

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)