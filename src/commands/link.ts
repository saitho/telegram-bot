import {SceneContextMessageUpdate} from "telegraf/typings/stage";
import WizardScene from "telegraf/scenes/wizard";
import {Command} from "../core/command";
import {DiscordClient} from "../core/discord-client";
import {Database} from "../core/database";

function generateRandomId(): string {
    return Math.ceil(Math.random() * 100000).toString();
}

let tempId = generateRandomId(); // should be sufficient here

export class LinkCommand extends Command {
    readonly name = 'link'

    protected discordId = ''

    public getStage(): WizardScene {
        return new WizardScene('discord__link--new',
            (ctx) => {
                const stmt = Database.connection.prepare('SELECT * FROM accounts WHERE telegram_id = ?')
                const user = stmt.get(ctx.update.message.from.id)
                if (user) {
                    ctx.replyWithMarkdown('Your Telegram account is already linked to a Discord account. You can unlink it in /settings.')
                    return
                }
                ctx.replyWithMarkdown('Please tell me your Discord username. For example `Zenyatta#1815`.')
                return ctx.wizard.next()
            },
           async (ctx) => {
               // Verify Discord syntax
               const discordSyntax = new RegExp("^[\\w ]+#\\d{4}$")
               const discordName = ctx.update.message.text
               if (!discordName.match(discordSyntax)) {
                   ctx.reply('This does not look like a valid Discord name to me. Please try again!')
                   return
               }

               const discordClient = new DiscordClient();
               tempId = generateRandomId(); // should be sufficient here
               const result = await discordClient.sendValidationMessage(discordName, tempId)
               this.discordId = result.receiver_id
               if (!result) {
                   await ctx.replyWithMarkdown('I was unable to send you a Discord message. Please try again later.')
                   return
               }

               await ctx.replyWithMarkdown('My colleague `' + result.bot_username + '` has sent you a Discord message. Please enter the verification code below.')
               return ctx.wizard.next()
            },
            (ctx) => {
                if (ctx.update.message.text !== tempId) {
                    ctx.replyWithMarkdown('Wrong verification code. Please try again!')
                    return
                }
                const stmt = Database.connection.prepare('INSERT INTO accounts (telegram_id, discord_id) VALUES (?, ?)')
                const info = stmt.run(ctx.update.message.from.id, this.discordId)
                if (info.changes === 1) {
                    ctx.reply(`We're done! I've verified your Discord account and linked it to this Telegram account. You can now configure it by going to the /settings menu.`)
                } else {
                    // Todo: log
                    ctx.reply(`I was unable to process your request. The error was logged will be looked at. Sorry for any inconvenience1`)
                }

                return ctx.scene.leave()
            }
        )
    }

    public async run(ctx: SceneContextMessageUpdate) {
        await ctx.scene.enter('discord__link--new')
    }
}
