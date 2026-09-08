import 'dotenv/config'
import { Collection } from 'discord.js'
import { client } from './client.js'
import { env } from './config/env.js'
import { commands } from './commands/index.js'
import type { Command } from './commands/types.js'

const commandCollection = new Collection<string, Command>()
for (const command of commands) {
  commandCollection.set(command.data.name, command)
}

client.once('ready', (readyClient) => {
  console.log(`Bot online como ${readyClient.user.tag}`)
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commandCollection.get(interaction.commandName)
  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    const payload = { content: 'Ocorreu um erro ao executar este comando.', ephemeral: true }
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload)
    } else {
      await interaction.reply(payload)
    }
  }
})

await client.login(env.DISCORD_TOKEN)
