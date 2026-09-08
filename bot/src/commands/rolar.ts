import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from './types.js'

function rollD12(): number {
  return 1 + Math.floor(Math.random() * 12)
}

const data = new SlashCommandBuilder()
data.setName('rolar')
data.setDescription('Realiza um Teste (2D12 padrão, ou 3D12 com Talento) do sistema Arcádia.')
data.addIntegerOption((option) =>
  option
    .setName('dados')
    .setDescription('Quantidade de D12 a rolar (2 = padrão, 3 = Talento).')
    .setRequired(true)
    .setMinValue(1),
)
data.addIntegerOption((option) =>
  option
    .setName('bonus')
    .setDescription('Bônus somado ao final (Atributo + Perícia, etc.).')
    .setRequired(false),
)
data.addIntegerOption((option) =>
  option
    .setName('dificuldade')
    .setDescription('Dificuldade (DT) do teste.')
    .setRequired(false),
)

export const rolarCommand: Command = {
  data,
  async execute(interaction) {
    const numDados = interaction.options.getInteger('dados', true)
    const bonus = interaction.options.getInteger('bonus') ?? 0
    const dificuldade = interaction.options.getInteger('dificuldade')

    const rolls = Array.from({ length: numDados }, () => rollD12())

    const usedCount = Math.min(2, numDados)
    const ranked = rolls
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
    const usedIndices = new Set(ranked.slice(0, usedCount).map((r) => r.index))
    const usedValues = ranked.slice(0, usedCount).map((r) => r.value)

    const soma = usedValues.reduce((sum, v) => sum + v, 0)
    const resultadoComBonus = soma + bonus

    const sucesso = dificuldade !== null ? resultadoComBonus >= dificuldade : undefined

    const critico = usedValues.some((v) => v === 12)
    const milagre = usedCount === 2 && usedValues.every((v) => v === 12)
    const natural1 = usedValues.some((v) => v === 1)
    const desastre = usedCount === 2 && usedValues.every((v) => v === 1)
    const falhaCriticaConfirmada = natural1 && dificuldade !== null && sucesso === false

    const resultadoFinal = falhaCriticaConfirmada ? soma : resultadoComBonus

    const labels: string[] = []
    if (milagre) labels.push('✨ Milagre')
    else if (critico) labels.push('⚡ Crítico')
    if (desastre) labels.push('💀 Desastre')
    else if (falhaCriticaConfirmada) labels.push('⚠️ Falha Crítica')

    const diceDisplay = rolls
      .map((value, index) =>
        usedIndices.has(index) ? `**${value}**` : `~~${value}~~ _(descartado)_`,
      )
      .join('  ')

    const embed = new EmbedBuilder()
      .setTitle(`Teste — ${numDados}D12`)
      .setColor(desastre || falhaCriticaConfirmada ? 0xd04040 : milagre || critico ? 0xe8b84b : 0x2a3a60)
      .addFields(
        { name: 'Dados', value: diceDisplay },
        { name: 'Dados Usados', value: `${usedValues.join(' + ')} = **${soma}**`, inline: true },
        {
          name: 'Bônus',
          value: falhaCriticaConfirmada ? `${bonus >= 0 ? '+' : ''}${bonus} _(não aplicado — Falha Crítica)_` : `${bonus >= 0 ? '+' : ''}${bonus}`,
          inline: true,
        },
        { name: 'Resultado Final', value: `**${resultadoFinal}**`, inline: true },
      )

    if (dificuldade !== null) {
      embed.addFields({
        name: 'Dificuldade',
        value: `DT ${dificuldade} — ${sucesso ? '✅ Sucesso' : '❌ Falha'}`,
      })
    }

    if (labels.length > 0) {
      embed.addFields({ name: 'Resultado Especial', value: labels.join(' + ') })
    }

    await interaction.reply({ embeds: [embed] })
  },
}
