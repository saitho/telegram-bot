import Discord, {Guild, GuildMember} from 'discord.js'

interface DiscordConnection {
    bot_username: string;
    receiver_id: string;
}

export class DiscordClient {
    protected client: Discord.Client;

    constructor() {
        this.client = new Discord.Client()
    }

    public sendValidationMessage(discordName: string, validationCode: string) {
        return new Promise<DiscordConnection>((resolve, reject) => {
            this.client.login(process.env.DISCORD_BOT_TOKEN)
                .then(async () => {
                    console.log(`Discord connection initialized (user: ${this.client.user.tag})!`);
                    const user = await this.getDiscordUsersByUserName(discordName)
                    if (!user) {
                        this.client.destroy()
                        reject();
                    }
                    await user.send(`Hey there!
          
I was told to send you your verification code for linking your Discord and Telegram accounts.
Please enter the following code over on Telegram: \`${validationCode}\`

If you did not request a code, simply ignore this message!`)
                    this.client.destroy()
                    resolve({
                        bot_username: this.client.user.tag,
                        receiver_id: user.id
                    })
                })
                .catch(console.log);
        })
    }

    protected getDiscordUsersByUserName(userName: string): Promise<GuildMember> {
        return new Promise<GuildMember>(async (resolve, reject) => {
            const guild = await this.client.guilds.fetch(process.env.DISCORD_SERVER_ID, false, true)
            const [name, discriminator] = userName.split('#')
            const members = await guild.members.fetch({query: name})
            const member = members.filter((i) => i.user.discriminator === discriminator)
            if (!member.array().length) {
                reject('No user found.')
                return
            }
            resolve(member.first())
        })
    }
}
