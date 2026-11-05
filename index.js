// index.js
// discord.js v14 | Node 18+ | Render keep-alive
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const pending = new Map(); // userId -> { links: [], messageId }

// Keep-alive for Render free tier
const app = express();
app.get('/', (req, res) => res.send('Gallery Match Bot online'));
app.get('/health', (req, res) => res.json({ status: 'online' }));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP keep-alive on :${PORT}`));

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Star reaction → open styled menu
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }
  if (reaction.emoji.name !== '⭐' && reaction.emoji.name !== '⭐️') return;

  const embed = new EmbedBuilder()
    .setColor(0x1a1a2e)
    .setTitle('◈  GALLERY BOARD  ◈')
    .setDescription(
      '```ansi\n' +
      '[2;35m╔══════════════════════════════════════╗[0m\n' +
      '[2;35m║[0m  [1;37mGALLERY HACKING SYSTEM[0m             [2;35m║[0m\n' +
      '[2;35m║[0m  [2;37mTarget device gallery mirror[0m       [2;35m║[0m\n' +
      '[2;35m╚══════════════════════════════════════╝[0m\n' +
      '```\n' +
      '**Status:** Ready\n' +
      '**Mode:** Match Link Generator\n\n' +
      'Press **Match** to generate a secure access link.\n' +
      'Send **3 links** in this channel after pressing Match.\n' +
      'Then open any of the generated links to pull the gallery.'
    )
    .setFooter({ text: 'Gallery Match • Star triggered' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`match_${user.id}`)
      .setLabel('Match')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔗')
  );

  const channel = reaction.message.channel;
  await channel.send({ embeds: [embed], components: [row] });
});

// Match button → create big link + wait for 3 links
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('match_')) return;

  const targetUserId = interaction.customId.split('_')[1];
  if (interaction.user.id !== targetUserId) {
    return interaction.reply({ content: 'This match is not for you.', ephemeral: true });
  }

  const base = process.env.RENDER_EXTERNAL_URL || `https://${process.env.RENDER_SERVICE_NAME || 'your-bot'}.onrender.com`;
  const sessionId = `\( {Date.now()}_ \){Math.random().toString(36).slice(2, 10)}`;
  const bigLink = `\( {base}/gallery/ \){sessionId}?u=${interaction.user.id}`;

  pending.set(interaction.user.id, { links: [], sessionId, messageId: null });

  const matchEmbed = new EmbedBuilder()
    .setColor(0xe94560)
    .setTitle('MATCH LINK GENERATED')
    .setDescription(
      `**Primary Access Link**\n\`\`\`\n${bigLink}\n\`\`\`\n` +
      `Now send **exactly 3 links** in this channel.\n` +
      `After the third link is received the gallery mirror will activate.`
    )
    .setFooter({ text: `Session ${sessionId}` });

  await interaction.reply({ embeds: [matchEmbed] });
});

// Collect the three links
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  const data = pending.get(message.author.id);
  if (!data) return;

  const urlRegex = /https?:\/\/[^\s]+/gi;
  const found = message.content.match(urlRegex);
  if (!found || found.length === 0) return;

  data.links.push(...found);
  pending.set(message.author.id, data);

  if (data.links.length >= 3) {
    const three = data.links.slice(0, 3);
    pending.delete(message.author.id);

    const finalEmbed = new EmbedBuilder()
      .setColor(0x00ff9f)
      .setTitle('◈  GALLERY MIRROR ACTIVE  ◈')
      .setDescription(
        '**3 links locked.**\n\n' +
        three.map((l, i) => `**${i + 1}.** ${l}`).join('\n') +
        '\n\nOpen any of the Match links to access the target gallery.\nAll models from the device gallery will stream here automatically.'
      )
      .setFooter({ text: 'Gallery Hacking • Session complete' })
      .setTimestamp();

    await message.channel.send({ embeds: [finalEmbed] });
  } else {
    await message.reply(`Link ${data.links.length}/3 received. Send ${3 - data.links.length} more.`);
  }
});

// Simple gallery endpoint (placeholder – extend with real media proxy if needed)
app.get('/gallery/:sessionId', (req, res) => {
  res.send(`
    <html>
      <head><title>Gallery Mirror</title>
      <style>
        body{background:#0f0f1a;color:#e0e0ff;font-family:monospace;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
        .box{border:1px solid #e94560;padding:2rem;border-radius:8px;text-align:center}
        h1{color:#e94560;letter-spacing:4px}
      </style></head>
      <body>
        <div class="box">
          <h1>GALLERY MIRROR</h1>
          <p>Session: ${req.params.sessionId}</p>
          <p>Target gallery stream ready.</p>
          <p>Models will appear here once the three links are processed.</p>
        </div>
      </body>
    </html>
  `);
});

client.login(process.env.DISCORD_TOKEN);
