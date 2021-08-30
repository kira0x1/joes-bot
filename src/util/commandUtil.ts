import { Collection, GuildMember, Message, MessageEmbed, Permissions } from 'discord.js';
import { Command, Permission } from '../classes/Command';
import { embedColor, wrap } from './styleUtil';

export const commands: Collection<string, Command> = new Collection();
export const commandGroups: Collection<string, Command[]> = new Collection();
export const cooldowns: Collection<string, Collection<string, number>> = new Collection();

export function findCommand(query: string): Command | undefined {
   let command = commands.get(query.toLowerCase());
   if (!command) {
      const cmdArray = commands.array();
      command = cmdArray.find(cmd => cmd.aliases?.find(al => al.toLowerCase() === query.toLowerCase()));
   }

   return command;
}

const flags = Permissions.FLAGS;

const modperms = [
   flags.BAN_MEMBERS,
   flags.KICK_MEMBERS,
   flags.MUTE_MEMBERS,
   flags.DEAFEN_MEMBERS,
   flags.MOVE_MEMBERS,
   flags.MANAGE_GUILD
];

export function hasPerms(member: GuildMember, query: string): boolean {
   // Get ID's
   const permsFound = findCommand(query)?.perms;

   // If none set then this command does not require permissions to use
   if (!permsFound || permsFound.length === 0) return true;

   for (const perm of permsFound) {
      const hasPerm = hasPermission(member, perm);
      if (hasPerm) return true;
   }

   return false;
}

export function hasPermission(member: GuildMember, permission: Permission) {
   switch (permission) {
      case 'admin':
         return member.hasPermission('ADMINISTRATOR', {
            checkAdmin: true,
            checkOwner: true
         });
      case 'mod':
         return member.permissions.any(modperms, true);
   }
}

export function checkCooldown(command: Command, message: Message): boolean {
   const author = message.author;
   const userId = author.id;

   if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());

   const now = Date.now();
   const timestamps = cooldowns.get(command.name);
   const cooldownAmount = (command.cooldown || 3) * 1000;

   if (timestamps.has(userId)) {
      const expirationTime = timestamps.get(userId) + cooldownAmount;
      if (now < expirationTime) {
         const timeLeft = (expirationTime - now) / 1000;

         author.send(
            `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
               command.name
            }\` command.`
         );

         return true;
      }
   } else {
      timestamps.set(userId, now);
      setTimeout(() => timestamps.delete(userId), cooldownAmount);
   }

   return false;
}

export function sendArgsError(command: Command, message: Message) {
   let usageString = 'Arguments required';
   const embed = new MessageEmbed().setColor(embedColor);

   if (command.usage) {
      usageString = command.name + ' ';
      usageString += wrap(command.usage, '`');
   }

   embed.addField('Arguments Required', usageString);
   return message.channel.send(embed);
}
