import { readdirSync } from 'fs';
import path from 'path';
import { Command } from '../classes/Command';
import { commands } from '../util/commandUtil';

export function initCommands() {
   readdirSync(path.join(__dirname, '..', 'commands'))
      .filter(file => file.endsWith('js'))
      .map(file => {
         const { command } = require(path.join(__dirname, '..', 'commands', file));
         const cmd: Command = command;
         commands.set(cmd.name, cmd);
      });
}
