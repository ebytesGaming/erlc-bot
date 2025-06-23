const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js');

const infractionChannelId = '1384002145229209641';
const bannerImage = 'https://cdn.discordapp.com/attachments/1383980775598194728/1384579423633801418/bwanner.png?ex=6852f192&is=6851a012&hm=931357e218f1aa56238b3229a431d0613a2cdd3bd38f19f0bb1a0f80842ca083&';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infract')
    .setDescription('Punish a staff member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The staff member to issue an infraction to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the infraction')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('infraction')
        .setDescription('Infraction Type')
        .setRequired(true)
        .addChoices(
          { name: 'Activity Notice', value: 'Activity Notice' },
          { name: 'Warning', value: 'Warning' },
          { name: 'Strike', value: 'Strike' },
          { name: 'Demotion', value: 'Demotion' },
          { name: 'Suspension', value: 'Suspension' },
          { name: 'Termination', value: 'Termination' }
        ))
    .addStringOption(option =>
      option.setName('notes')
        .setDescription('Any notes to go with the infraction')
        .setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const infractionType = interaction.options.getString('infraction');
    const notes = interaction.options.getString('notes') || 'None';

    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTitle('Monrovia Infractions')
      .setDescription(`An infraction has been issued to ${targetUser}.\n\n**Infraction Type:** ${infractionType}\n**Reason:** ${reason}\n**Notes:** ${notes}`)
      .setImage(bannerImage)
      .setColor(0x2eceff); // White (don't change it as requested)

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(`Given by ${interaction.user.username}`)
        .setEmoji('<:Arrow_Drop_Down:1383977291729731720>')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('given_by_button_infract')
        .setDisabled(true)
    );

    // Send to channel
    try {
      const channel = await interaction.client.channels.fetch(infractionChannelId);
      if (!channel || channel.type !== ChannelType.GuildText) {
        return interaction.reply({ content: '❌ Could not find the infractions channel.', ephemeral: true });
      }
      await channel.send({ content: `${targetUser}`, embeds: [embed], components: [row] });
    } catch (err) {
      console.error('Failed to send in channel:', err);
    }

    // Send to DM
    try {
      await targetUser.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.warn(`❗ Could not DM ${targetUser.tag}.`);
    }

    await interaction.reply({ content: `✅ Infraction posted and DM attempted for ${targetUser.username}.`, ephemeral: true });
  }
};
