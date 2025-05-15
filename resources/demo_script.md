# AstroTrader: Galactic Arbitrage - Demo Script

## Introduction (30 seconds)

Hi everyone! I'm excited to showcase **AstroTrader: Galactic Arbitrage**, a space trading game I've built that demonstrates how Civic Auth can create a seamless Web3 gaming experience.

AstroTrader is all about exploring the galaxy, trading commodities between planets, upgrading your ship with NFT blueprints, and managing your wealth using "Galactic Credits" - which are actual SPL Tokens on Solana.

## The Web3 Onboarding Problem (30 seconds)

Traditional Web3 games face a major hurdle - they require users to:
- Install browser extensions
- Create and manage wallets 
- Write down seed phrases
- Fund wallets with cryptocurrency
- Understand transaction signing

This complexity creates a barrier to adoption for casual gamers who just want to play without learning crypto fundamentals first.

## Civic Auth Solution (30 seconds)

This is where Civic Auth transforms the experience by:
- Letting players sign in with familiar methods like Google
- Providing the tools for embedded Solana wallets linked to their identity
- Eliminating the need for seed phrases or extensions
- Handling blockchain transactions seamlessly behind the scenes
- Giving players true ownership of their in-game assets

Now, let me show you how this works in AstroTrader!

## Start Screen and Login (30 seconds)

*[Show the start screen with the ship icon and "AstroTrader" title]*

When players first visit AstroTrader, they're greeted with this start screen. Notice the "Powered by Civic Auth" at the bottom.

When I click "Begin Adventure," instead of a complicated wallet setup process, players are presented with familiar authentication options.

*[Click "Begin Adventure" button]*

*[Show the Civic Auth login screen]*

This is where Civic Auth shines – players can log in with Google or other familiar methods, without needing any crypto knowledge.

## New User Experience (45 seconds)

Since I'm a new player, my first login triggers our application to automatically create an embedded Solana wallet. We've designed our application to do this completely behind the scenes – no seed phrases to write down, no browser extensions to install.

*[Show the wallet initialization process occurring automatically]*

With our implementation of Civic Auth, the game creates a secure, non-custodial wallet that I truly own without me having to do anything.

Now I'm prompted to claim my starting "Galactic Credits" – the in-game currency I'll need to play.

*[Show the "Claim Starting Package" prompt]*

Let me explain what's happening here: Galactic Credits aren't just arbitrary game points – they're actual SPL tokens on the Solana blockchain. When I claim my starting package, real tokens are transferred to my embedded wallet.

*[Show the confirmation and updated GC balance of 1000]*

Great! I now have 1000 Galactic Credits to start playing with. Let me verify this is a real blockchain token.

*[Switch to browser tab with Solscan and search for the wallet address]*

Here on Solscan, you can see my wallet now has those 1000 Galactic Credits tokens. This is a real SPL token on the Solana blockchain, not just a number in a database.

*[Switch back to game]*

## Returning User Experience (15 seconds)

For returning players, the experience is even smoother. Civic Auth recognizes them, connects to their embedded wallet, and the game loads their last saved state – all in seconds, with no manual wallet connection required.

## Game Interface & Mechanics (30 seconds)

*[Show the main game interface with HUD]*

AstroTrader is a space trading simulation. I command a ship with limited cargo space and fuel, and my goal is to earn profits by trading commodities between planets.

My ship stats are shown here, my current location here, and my Galactic Credits balance is displayed in the top right. Notice my ship has a cargo capacity of 20 units - this will be important later.

## Trading Mechanics (45 seconds)

*[Navigate to Terra Prime's market view]*

I'm currently at Terra Prime, the sector capital. Each planet has different market conditions.

*[Show the market listings]*

Here I can see that Purified Water sells for 8 GC, while Raw Minerals can be sold for 50 GC. 

*[Navigate to Mars Colony's market view]*

Let me travel to Mars Colony.

*[Show the market listings]*

Now I can see that Purified Water sells for 15 GC here – that's almost double! This is how arbitrage works in the game – buy low at one planet, sell high at another.

Let me purchase some Raw Minerals at Mars Colony for 40 GC each.

*[Execute purchase of Raw Minerals]*

When I click "Buy," a transaction is created to transfer GC tokens from my embedded wallet to the game treasury. Civic's wallet interface appears for me to approve with one click – no confusing transaction details.

*[Show the transaction confirmation and updated inventory]*

The minerals are now in my cargo, and my GC balance has updated. Now I can fly back to Terra Prime to sell them at a profit.

## Refueling Mechanics (30 seconds)

*[Navigate to the Refuel view]*

Traveling consumes fuel, and I need to refuel at planets. Each planet has different fuel prices – Terra Prime charges 5 GC per unit, while Mars Colony charges 8 GC. Europa Outpost has the best rate at just 3 GC.

*[Execute refueling]*

When I refuel, it's another blockchain transaction, but Civic's embedded wallet makes this feel like a natural part of the game.

## Ship Upgrades via NFT Blueprints (1 minute)

*[Navigate to Shipyard view]*

Players can improve their ships by acquiring blueprint NFTs. There are two ways to get blueprints:

1. Discover them while exploring planets
2. Purchase them directly from the Store

*[Show empty blueprints list]*

Since I'm a new player, I don't have any blueprints yet. I haven't explored enough of the galaxy to discover any, but let's see what's available in the store.

*[Open the Store modal]*

*[Show the blueprint store]*

The store offers various blueprints for purchase, but they're quite expensive. I don't have enough Credits to buy one yet. These are actual NFTs that would be minted to my wallet when purchased.

Let me log into an account that already has a blueprint to show you how they work.

*[Switch to another browser window/tab and log in with a different account]*

*[Navigate to Shipyard view]*

Now I've switched to an account that already has the Cargo Expansion blueprint. Notice how it's applied to my ship automatically, increasing my cargo capacity from 20 units to 45 units!

*[Switch to Solscan and show the NFT in the portfolio tab]*

Let me show you that this blueprint is a real NFT on the blockchain. Here on Solscan, under the portfolio tab of this wallet, you can see the Cargo Expansion Blueprint NFT. This player truly owns this upgrade as a digital asset.

## Conclusion (15 seconds)

AstroTrader demonstrates how Civic Auth creates a bridge between traditional gaming and Web3. Players get all the benefits of blockchain ownership without any of the typical complexities.

Thank you for watching this demo of AstroTrader: Galactic Arbitrage!

---

## Demo Preparation Checklist

- [ ] Set up fresh account for "new user" demo
- [ ] Set up second account with blueprints
- [ ] Practice the flow of traveling between planets with correct commodities
- [ ] Verify fuel prices on each planet match the script
- [ ] Check that Terra Prime/Mars Colony arbitrage opportunity exists
- [ ] Have Solscan tabs ready for both accounts 