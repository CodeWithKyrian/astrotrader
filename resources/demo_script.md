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
- Automatically creating an embedded Solana wallet linked to their identity
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

For new players, the first login automatically creates an embedded Solana wallet. This happens completely behind the scenes – no seed phrases to write down, no browser extensions to install.

*[Show the wallet initialization prompt if new user]*

With just one click, Civic creates a secure, non-custodial wallet that the player truly owns.

New players are then prompted to claim their starting "Galactic Credits" – our in-game currency.

*[Show the "Claim Starting Package" prompt]*

Let me explain what's happening here: Galactic Credits aren't just arbitrary game points – they're actual SPL tokens on the Solana blockchain. When players claim their starting package, real tokens are transferred to their embedded wallet.

## Returning User Experience (15 seconds)

For returning players like me, the experience is even smoother. Civic Auth recognizes me, connects to my embedded wallet, and the game loads my last saved state – all in seconds, with no manual wallet connection required.

*[Show the game loading with existing player data]*

## Game Interface & Mechanics (30 seconds)

*[Show the main game interface with HUD]*

AstroTrader is a space trading simulation. I command a ship with limited cargo space and fuel, and my goal is to earn profits by trading commodities between planets.

My ship stats are shown here, my current location here, and my Galactic Credits balance is displayed in the top right. This balance is actually pulled directly from my wallet on the Solana blockchain.

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

## Ship Upgrades via NFT Blueprints (45 seconds)

*[Navigate to Shipyard view]*

Players can improve their ships by acquiring blueprint NFTs. There are two ways to get blueprints:

1. Discover them while exploring planets
2. Purchase them directly from the Store

*[Navigate to owned blueprints]*

Any blueprints I own are shown here, and they automatically apply their effects to my ship. For example, this Cargo Expansion blueprint increases my cargo capacity.

*[Open the Store modal]*

*[Show the blueprint store]*

The store offers various blueprints for purchase, though they're quite expensive. These are actual NFTs that will be minted to my wallet when purchased.

*[Log out and log in to account with more credits if necessary]*

Let me switch to an account where I have enough credits to purchase a blueprint.

*[Execute blueprint purchase]*

When I purchase this blueprint, two things happen:
1. GC tokens transfer from my wallet to the treasury
2. An NFT representing the blueprint is minted directly to my wallet

What's amazing is that I truly own this blueprint as an NFT on Solana, but the entire experience feels like a normal game purchase.

## Civic Auth Integration Benefits (30 seconds)

What makes this special is how Civic Auth enables all these blockchain interactions without any Web3 friction:

1. Players use familiar login methods
2. The embedded wallet handles all transactions
3. Players truly own their assets (tokens and NFTs)
4. No seed phrases or crypto knowledge required
5. The entire experience feels like a traditional game

## Conclusion (15 seconds)

AstroTrader demonstrates how Civic Auth creates a bridge between traditional gaming and Web3. Players get all the benefits of blockchain ownership without any of the typical complexities.

Thank you for watching this demo of AstroTrader: Galactic Arbitrage!

---

## Demo Preparation Checklist

- [ ] Set up fresh account for "new user" demo
- [ ] Set up second account with enough GC to purchase blueprint
- [ ] Practice the flow of traveling between planets with correct commodities
- [ ] Verify fuel prices on each planet match the script
- [ ] Check that Terra Prime/Mars Colony arbitrage opportunity exists 