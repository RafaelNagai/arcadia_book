import { rolarCommand } from './rolar.js'
import { ataqueCommand } from './ataque.js'
import type { Command } from './types.js'

export const commands: Command[] = [rolarCommand, ataqueCommand]
