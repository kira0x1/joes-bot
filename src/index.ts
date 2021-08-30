import chalk from 'chalk';
import { Client } from 'discord.js';

import { prefix, token } from './config';
import { initCommands } from './system/commandLoader';
import { findCommand, hasPerms, sendArgsError } from './util/commandUtil';
import { sendErrorEmbed, wrap } from './util/styleUtil';

const client = new Client({
   ws: {
      intents: ['GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILDS', 'GUILD_EMOJIS', 'DIRECT_MESSAGES']
   },
   disableMentions: 'everyone'
});

client.on('ready', async () => {
   // Read command files and create a collection for the commands
   initCommands();

   console.log('info', chalk.bgCyan.bold(`${client.user.username} online!`));
});

client.on('message', async message => {
   const prefixGiven = message.content.substr(0, prefix.length);

   // Check if message is from a bot and that the message starts with the prefix
   if (message.author.bot || prefixGiven !== prefix) {
      // check if user mentioned the bot instead of using the prefix
      const mention = message.mentions.users.first();
      if (mention?.id !== client.user.id) {
         return;
      }
   }

   //  // Check if we are able to send messages in this channel
   //  if (
   //     message.channel.type === 'text' &&
   //     !message.channel.permissionsFor(client.user).has('SEND_MESSAGES')
   //  ) {
   //     return;
   //  }

   // Split up message into an array and remove the prefix
   let args = message.content.slice(message.content.startsWith(prefix) ? prefix.length : 0).split(/ +/);
   if (!message.content.startsWith(prefix)) args.shift();

   // Remove the first element from the args array ( this is the command name )
   let commandName = args.shift();
   if (!commandName) commandName = args.shift();

   if (!commandName || commandName === prefix) {
      return;
   }

   // Set commandName to lowercase
   commandName = commandName.toLowerCase();

   // Search for the command
   let command = findCommand(commandName);

   // If command not found send a message
   if (!command) {
      // message.author.send(`command ${wrap(commandName || '')} not found`);
      return;
   }

   // If the command is disabled then return
   if (command.isDisabled) return;

   if (!hasPerms(message.member, commandName)) {
      try {
         return message.author.send(`You do not have permission to use ${wrap(command.name)}`);
      } catch (e) {}
   }

   // If command arguments are required and not given send an error message
   if (command.args && args.length === 0) return sendArgsError(command, message);

   // Check if the command is in cooldown
   // if (checkCooldown(command, message)) return;

   if (message.guild) {
      // Check bot permissions
      if (command.botPerms && !message.guild.me.hasPermission(command.botPerms)) {
         return sendErrorEmbed(message, "I don't have permissions for that");
      }

      // Check user permissions
      if (command.userPerms && !message.member.hasPermission(command.userPerms)) {
         return sendErrorEmbed(message, `You don\'t have permission to do that`);
      }
   }

   // Finally if all checks have passed then try executing the command.
   try {
      command.execute(message, args);
   } catch (err) {
      console.error(err);
   }
});

process.on('uncaughtException', error => console.error(error));
process.on('unhandledRejection', error => console.error(error));

client.login(token);
