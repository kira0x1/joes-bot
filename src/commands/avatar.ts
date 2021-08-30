import fs from 'fs';
const request = require('request');
import { Command } from '../classes/Command';
import chalk from 'chalk';

export const command: Command = {
   name: 'avatar',
   description: 'testing bulk fetch avatars',
   async execute(message, args) {
      const members = await message.guild.members.fetch({ limit: 100 });
      const filteredMembers = members.filter(m => !m.user.bot).array();

      for (let i = 0; i < filteredMembers.length; i++) {
         const member = filteredMembers[i];
         const avatar = member.user.avatarURL({ format: 'png', size: 4096 });
         await download(avatar, `${member.displayName}.png`, function () {
            console.log('done');
         });
      }

      console.log(chalk.bgRed.bold('DONE'));
   }
};

async function download(uri, filename, callback) {
   request.head(uri, function (err, res, body) {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri)
         .pipe(fs.createWriteStream(`images/${filename}`))
         .on('close', callback);
   });
}
