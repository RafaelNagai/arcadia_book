import 'dotenv/config'
import { REST, Routes } from 'discord.js'
import { env } from './config/env.js'
import { commands } from './commands/index.js'

const body = commands.map((command) => command.data.toJSON())
const rest = new REST().setToken(env.DISCORD_TOKEN)

try {
  if (env.DISCORD_GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
      { body },
    )
    console.log(`✅  ${body.length} comando(s) registrado(s) no servidor ${env.DISCORD_GUILD_ID}.`)
  } else {
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body })
    console.log(`✅  ${body.length} comando(s) registrado(s) globalmente (pode levar até 1h para propagar).`)
  }
} catch (error) {
  console.error('❌  Falha ao registrar os slash commands:')
  console.error(error)
  process.exit(1)
}
