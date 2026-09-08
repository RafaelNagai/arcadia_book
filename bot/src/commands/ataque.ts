import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { computeModifiers, parseDamage } from '../lib/parseDamage.js'
import type { Command } from './types.js'

const data = new SlashCommandBuilder()
data.setName('ataque')
data.setDescription('Rola o dano de um ataque a partir da notação de dano do equipamento.')
data.addStringOption((option) =>
  option
    .setName('notacao')
    .setDescription('Notação de dano, ex: "3D8 + (3) + 3"')
    .setRequired(true),
)

export const ataqueCommand: Command = {
  data,
  async execute(interaction) {
    const notacao = interaction.options.getString('notacao', true)
    const parsed = parseDamage(notacao)

    if (!parsed) {
      await interaction.reply({
        content:
          'Notação de dano inválida. Formato esperado, ex: `4D6`, `4D6 + 4`, `4D6 + (2)`, `2D6+2D12 - 1`.',
        ephemeral: true,
      })
      return
    }

    const flatDieTypes = parsed.dice.flatMap((d) => Array(d.dieCount).fill(d.dieType))
    const results = flatDieTypes.map((dieType) => 1 + Math.floor(Math.random() * dieType))
    const modifiers = computeModifiers(results, parsed.bonuses)
    const total = results.reduce((sum, v, i) => sum + v + (modifiers[i] ?? 0), 0)

    const diceDisplay = results
      .map((value, i) => {
        const mod = modifiers[i] ?? 0
        const dieType = flatDieTypes[i]
        if (mod === 0) return `D${dieType}: **${value}**`
        const sign = mod > 0 ? '+' : ''
        return `D${dieType}: ${value} (${sign}${mod}) = **${value + mod}**`
      })
      .join('\n')

    const formula = parsed.dice.map((d) => `${d.dieCount}D${d.dieType}`).join(' + ')

    const embed = new EmbedBuilder()
      .setTitle(`Ataque — ${formula}`)
      .setColor(0xe8803a)
      .addFields(
        { name: 'Notação', value: `\`${notacao}\`` },
        { name: 'Dados', value: diceDisplay },
        { name: 'Total', value: `**${total}**` },
      )

    await interaction.reply({ embeds: [embed] })
  },
}
