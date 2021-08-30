import { Command } from '../classes/Command';
import { clientId } from '../config';
export const command: Command = {
   name: 'clear',
   description: 'clears your dms with the bot',

   async execute(message, args) {
      console.log('getting dms');
      const messages = await message.channel.messages.fetch();
      messages.forEach(msg => {
         if (msg.author.id === clientId) {
            msg.delete();
         }
      });
   }
};
