import { Message, MessageEmbed, User } from 'discord.js';

const redColor = 0xcf274e;
// const blueColor = 0x4e74e6;
// const oldBlueColor = 0x6788eb;

export const embedColor = redColor;

export function darken(...content: string[]): string {
   const tag = `\``;
   return wrap(content, tag);
}

export function wrap(content: string[] | string, wrap = '`'): string {
   if (typeof content === 'string') return wrap + content + wrap;

   return content
      .filter(str => str !== ``)
      .map(str => wrap + str + wrap)
      .join(' ');
}

export const errorIconUrl =
   'https://cdn.discordapp.com/attachments/702091543514710027/835451455208423424/error_icon.png';
export const successIconUrl =
   'https://cdn.discordapp.com/attachments/702091543514710027/835456148811415602/success_icon.png';

export interface ErrorEmbedOptions {
   errorTitle?: string;
   autoDelete?: boolean;
}

const defaultErrorEmbedOptions: ErrorEmbedOptions = {
   autoDelete: false
};

export async function sendErrorEmbed(message: Message, errorMessage: string, options?: ErrorEmbedOptions) {
   // if no options given then use default
   if (!options) options = defaultErrorEmbedOptions;

   let embed = createFooter(message).setDescription(`**${errorMessage}**`).setThumbnail(errorIconUrl);

   if (options.errorTitle) embed.setTitle(options.errorTitle);
}

export function createFooter(message: Message, overrideAuthor?: User): MessageEmbed {
   const author = overrideAuthor || message.author;

   const embed = new MessageEmbed()
      .setColor(embedColor)
      .setFooter(author.username, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp(Date.now());

   return embed;
}

export interface QuickEmbedOptions {
   addDeleteCollector?: boolean;
   addFooter?: boolean;
   autoDelete?: boolean;
   deleteDelay?: string;
   deleteCollectorOwnerId?: string;
   deleteOriginalMessage?: boolean;
}

export async function quickEmbed(message: Message, content: string, options?: QuickEmbedOptions) {
   const addFooter = options?.addFooter || true;

   const embed = addFooter ? createFooter(message) : new MessageEmbed().setColor(embedColor);
   embed.setTitle(content);
}

export function deleteMessage(message: Message) {
   if (!message.deletable) {
      console.log(`Message not deletable\nfrom: ${message.author.username}\ncontent:${message.content}`);
      return;
   }

   message.delete();
}

export function createEmptyField(inline?: boolean | false) {
   return { name: `\u200b`, value: '\u200b', inline: true };
}
