const { Partials, Client, GatewayIntentBits, ChannelType } = require("discord.js");
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const minik = require("./minik.json");
const { EmbedBuilder } = require('discord.js');
const { createTranscript } = require('discord-html-transcripts');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});


client.login(minik.botSettings.token);

app.use(express.json());
app.use(cors());

app.get('/tickets', async (req, res) => {
    try {
        const guild = client.guilds.cache.get(minik.botSettings.ServerID);
        if (!guild) {
            return res.status(404).send('Sunucu bulunamadı.');
        }

        const category = guild.channels.cache.get(minik.ticket.kategori.baskaproblemler);
        if (!category || category.type !== ChannelType.GuildCategory) {
            return res.status(404).send('Kategori bulunamadı veya geçersiz kanal türü.');
        }

        const channels = Array.from(category.children.cache.values());

        let html = `
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        background-color: #36393F;
                        color: #DCDDDE;
                        margin: 0;
                        padding: 0;
                    }
                    h1 {
                        color: #ffffff;
                        padding: 10px;
                        background-color: #2F3136;
                        margin: 0;
                        text-align: center;
                    }
                    button {
                        background-color: #7289DA;
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 5px;
                    }
                    button:hover {
                        background-color: #5B6EAE;
                    }
                </style>
            </head>
            <body>
                <h1>Kanallar</h1>
                ${channels.map(channel => `
                    <button onclick="window.location.href='/messages/${channel.id}'">${channel.name}</button><br>
                `).join('')}
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).send('Sunucu hatası');
    }
});


app.get('/messages/:channelId', async (req, res) => {
    try {
        const channelId = req.params.channelId;
        const channel = client.channels.cache.get(channelId);

        if (!channel) {
            return res.status(404).send('Kanal bulunamadı.');
        }

        let messages = await channel.messages.fetch({ limit: 10 });
        messages = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        let html = `
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        background-color: #36393F;
                        color: #DCDDDE;
                        margin: 0;
                        padding: 0;
                    }
                    h1 {
                        color: #ffffff;
                        padding: 10px;
                        background-color: #2F3136;
                        margin: 0;
                        text-align: center;
                    }
                    .message {
                        padding: 10px;
                        border-bottom: 1px solid #2F3136;
                        display: flex;
                        align-items: flex-start;
                        margin: 10px 0;
                    }
                    .avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        margin-right: 10px;
                    }
                    .content {
                        background-color: #2F3136;
                        border-radius: 5px;
                        padding: 10px;
                        max-width: 80%;
                    }
                    .author {
                        font-weight: bold;
                    }
                    .timestamp {
                        color: #72767D;
                        font-size: 0.9em;
                    }
                    .embed {
                        background-color: #2F3136;
                        border: 1px solid #444;
                        border-radius: 5px;
                        padding: 10px;
                        margin-top: 10px;
                    }
                    .embed-title {
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .embed-description {
                        margin-bottom: 10px;
                    }
                    .embed-footer {
                        font-size: 0.8em;
                        color: #72767D;
                    }
                    .buttons {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .media {
                        margin-top: 10px;
                    }
                    .media img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 5px;
                    }
                    .media video {
                        max-width: 100%;
                        height: auto;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <h1>${channel.name} Mesajları</h1>
                <div class="buttons">
                    <button onclick="handleButtonClick('rename')">İsim Değiştir</button>
                    <button onclick="handleButtonClick('save')">Ticket Kaydet</button>
                    <button onclick="handleButtonClick('close')">Kapat</button>
                    <button onclick="handleButtonClick('sendMessage')">Mesaj Gönder</button>
                </div>
                ${messages.map(msg => {
                    const user = msg.author;
                    const profilePic = user.displayAvatarURL({ format: 'png', dynamic: true });
                    const timestamp = new Date(msg.createdTimestamp).toLocaleString();

                    let embedsHtml = '';
                    if (msg.embeds.length > 0) {
                        embedsHtml = msg.embeds.map(embed => `
                            <div class="embed">
                                ${embed.title ? `<div class="embed-title">${embed.title}</div>` : ''}
                                ${embed.description ? `<div class="embed-description">${embed.description}</div>` : ''}
                                ${embed.footer ? `<div class="embed-footer">${embed.footer.text}</div>` : ''}
                            </div>
                        `).join('');
                    }

                    let mediaHtml = '';
                    if (msg.attachments.size > 0) {
                        mediaHtml = Array.from(msg.attachments.values()).map(attachment => {
                            if (attachment.height) {
                                return `<img src="${attachment.url}" alt="Media" class="media" />`;
                            } else if (attachment.name.endsWith('.mp4') || attachment.name.endsWith('.webm')) {
                                return `<video controls class="media">
                                            <source src="${attachment.url}" type="video/${attachment.name.split('.').pop()}" />
                                            Tarayıcınız video etiketini desteklemiyor.
                                        </video>`;
                            } else {
                                return `<a href="${attachment.url}" download="${attachment.name}" style="color: #7289DA; display: block; margin-top: 10px;">${attachment.name}</a>`;
                            }
                        }).join('');
                    }

                    return `
                        <div class="message">
                            <img src="${profilePic}" alt="${user.username}'s avatar" class="avatar"/>
                            <div class="content">
                                <div class="author">${user.tag} <span class="timestamp">(${timestamp})</span></div>
                                <p>${msg.content}</p>
                                ${embedsHtml}
                                ${mediaHtml}
                            </div>
                        </div>
                    `;
                }).join('')}
                <script>
                    async function handleButtonClick(action) {
                        let url;
                        let message;
                        switch (action) {
                            case 'rename':
                                const newName = prompt("Yeni kanal adını girin:");
                                if (newName) {
                                    url = '/rename-channel';
                                    await fetch(url, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ channelId: '${channelId}', name: newName })
                                    });
                                }
                                break;
                            case 'save':
                                url = '/save-ticket';
                                await fetch(url, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ channelId: '${channelId}' })
                                });
                                break;
                            case 'close':
                                url = '/close-ticket';
                                await fetch(url, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ channelId: '${channelId}' })
                                });
                                break;
                            case 'sendMessage':
                                message = prompt("Göndermek istediğiniz mesajı girin:");
                                if (message) {
                                    url = '/send-message';
                                    await fetch(url, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ channelId: '${channelId}', message: message })
                                    });
                                }
                                break;
                        }
                        window.location.reload();
                    }
                </script>
            </body>
            </html>
        `;
        res.send(html);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Sunucu hatası');
    }
});




app.post('/rename-channel', async (req, res) => {
    try {
        const { channelId, name } = req.body;
        const channel = client.channels.cache.get(channelId);

        if (!channel || channel.type === ChannelType.GuildCategory) {
            return res.status(400).send('Geçersiz kanal ID\'si veya kategori ID\'si.');
        }

        await channel.setName(name);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error renaming channel:', error);
        res.status(500).send('Sunucu hatası');
    }
});


app.post('/send-message', async (req, res) => {
    try {
        const { channelId, message } = req.body;
        const channel = client.channels.cache.get(channelId);

        if (!channel || channel.type !== ChannelType.GuildText) {
            return res.status(400).send('Geçersiz kanal ID\'si veya kategori ID\'si.');
        }

        await channel.send(message);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Mesaj gönderilemedi.');
    }
});


app.post('/save-ticket', async (req, res) => {
    try {
        const { channelId } = req.body;
        const channel = client.channels.cache.get(channelId);

        if (!channel || channel.type !== ChannelType.GuildText) {
            return res.status(400).send('Geçersiz kanal ID\'si veya kategori ID\'si.');
        }

        const guild = client.guilds.cache.get(minik.botSettings.ServerID);
        if (!guild) {
            return res.status(404).send('Sunucu bulunamadı.');
        }

        const transcript = await createTranscript(channel, {
            limit: -1,
            returnType: 'attachment',
            saveImages: true,
            poweredBy: false,
            filename: `${channel.name}-${channel.id}.html`,
        }).catch(error => {
            console.error('Error creating transcript:', error);
            res.status(500).send('Transkript oluşturulamadı.');
            return;
        });

        const transcriptTimestamp = Math.round(Date.now() / 1000);
        const transcriptEmbed = new EmbedBuilder()
            .setDescription(`Ticket transcript for <#${channel.id}>\nTime: <t:${transcriptTimestamp}:R> (<t:${transcriptTimestamp}:F>)`)
            .setColor('Aqua');

        const transcriptsChannel = guild.channels.cache.get(minik.ticket.transcriptsChannelId);
        if (transcriptsChannel) {
            await transcriptsChannel.send({
                embeds: [transcriptEmbed],
                files: [transcript],
            }).catch(error => {
                console.error('Error sending transcript:', error);
                res.status(500).send('Transkript gönderilemedi.');
                return;
            });
        } else {
            console.error('Transcript channel not found');
            res.status(404).send('Log kanalı bulunamadı.');
            return;
        }

        await channel.send({ content: `<@${client.user.id}> tarafından siliniyor.` }).catch(error => {
            console.error('Error sending channel delete message:', error);
            res.status(500).send('Kanal silme mesajı gönderilemedi.');
            return;
        });

        setTimeout(() => {
            channel.delete().catch(error => {
                console.error('Error deleting channel:', error);
                res.status(500).send('Kanal silinemedi.');
            });
        }, 2500);

        res.sendStatus(200);
    } catch (error) {
        console.error('Error closing ticket:', error);
        res.status(500).send('Sunucu hatası');
    }
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
