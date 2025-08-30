# Auto Blackjack Bot for Case Clicker

## Description
An automated bot that plays Blackjack on Case Clicker using basic strategy. The bot makes optimal decisions based on player's hand and dealer's visible card, supporting features like:
- Basic strategy implementation
- Soft hands management
- Double down decisions
- Real-time statistics tracking

## Features
- **Automated Play**: Automatically plays Blackjack following basic strategy rules
- **Customizable Bet**: Set your desired bet amount
- **Statistics Display**: 
  - Games played
  - Wins/Losses/Ties
  - Tokens bet/won
  - Net profit calculation
- **User Interface**: Clean overlay with controls and real-time stats

## Installation
1. Install a userscript manager (like Tampermonkey) in your browser
2. Create a new script
3. Copy and paste the entire script code
4. Save and enable the script
5. Navigate to https://case-clicker.com/game/blackjack

## Usage
1. Set your desired bet amount in the input field
2. Click "Démarrer" to start the bot
3. Click "Arrêter" to stop the bot
4. Monitor your statistics in real-time

## Strategy Details
The bot implements basic Blackjack strategy:
- Hits on 16 or below (with exceptions based on dealer's card)
- Stands on 17 and above
- Doubles down optimally on 9, 10, 11
- Special handling for soft hands (hands with Aces)

## Requirements
- Browser with userscript support
- Tampermonkey or similar userscript manager
- Access to Case Clicker website

## Version
Current version: 3.1

## Author
req1

## Disclaimer
This script is ONLY designed to play blackjack games automatically using an optimal strategy, but it will not give you an ADVANTAGE in games.

## License
MIT
