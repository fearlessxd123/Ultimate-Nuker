### The orginal creator of the code is LuckyCoder YT

### YouTube - https://youtube.com/@LuckyCoderYT

### Discord - https://dsc.gg/luckycoder

### Don't Remove The Cradit or you will get ©️ Copyright 


 # Ultimate Nuker is a very powerful & Advance Discord Server Nuke Bot. 

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/fearlessxd123/Ultimate-Nuker.git
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up configuration:**

   - Create a `config.json` file in the root directory.
   - Add your bot token and other configurations:

     ```json
     {
       "token": "YOUR_BOT_TOKEN",
       "prefix": "!",
       "channelCount": 5,
       "channelName": "spam-channel",
       "spamMessage": "This is a spam message.",
       "messagesPerChannel": 10,
       "whitelistedServers": [],
       "auctionLogChannelId": "YOUR_AUCTION_LOG_CHANNEL_ID"
     }
     ```

     - `token`: Your Discord bot token (obtainable from the [Discord Developer Portal](https://discord.com/developers/applications))
     - `prefix`: Command prefix for your bot (`!` by default)
     - `channelCount`: Number of channels to create during nuking
     - `channelName`: Base name for the created channels during nuking
     - `spamMessage`: Message to spam in each channel during nuking
     - `messagesPerChannel`: Number of spam messages per channel
     - `whitelistedServers`: Array of server IDs where commands are disabled
     - `auctionLogChannelId`: Channel ID where auction logs will be displayed

4. **Start the bot:**

   ```bash
   npm start
   ```

   Your bot should now be online and operational on Discord.

## Bot Commands

- **!ping**: Check bot latency.
- **!uptime**: Check bot uptime.
- **!nuke**: Initiate a nuke process on a selected server.
- **!logs**: View auction logs in a specified channel.

## How It Works

- **Ping & Uptime**: Basic commands to check bot responsiveness and uptime.
- **Nuke Command**: Allows users to select a server and perform a simulated "nuke" action:
  - Deletes all channels, creates new channels, spams messages, and performs other actions.
  - Logs the nuke completion in the specified log channel (`auctionLogChannelId`).
- **Logs Command**: Allows users with `ADMINISTRATOR` permissions to view recent auction logs.

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests to suggest improvements or fixes.
