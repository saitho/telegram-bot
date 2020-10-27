import {SceneContextMessageUpdate} from "telegraf/typings/stage";
import WizardScene from "telegraf/scenes/wizard";
import {Command} from "../core/command";

let tempId = Math.random(); // should be sufficient here

const superWizard = new WizardScene('discord__link--new',
    (ctx) => {
        ctx.replyWithMarkdown('Please tell me your Discord username. For example `Zenyatta#1815`.')
        return ctx.wizard.next()
    },
    (ctx) => {
        // Verify Discord syntax
        const discordSyntax = new RegExp("^[\\w ]+#\\d{4}$")
        if (!ctx.update.message.text.match(discordSyntax)) {
            ctx.reply('This does not look like a valid Discord name to me. Please try again!')
            return
        }

        tempId = Math.random(); // should be sufficient here
        ctx.replyWithMarkdown('My colleague `saibot` has sent you a Discord message. Please enter the verification code below.')
        return ctx.wizard.next()
    },
    (ctx) => {
        if (ctx.update.message.text !== 'foobar') {
            ctx.replyWithMarkdown('Wrong verification code. Please try again!')
            return
        }
        ctx.reply(`We're done! I've verified your Discord account and linked it to this Telegram account. You can now configure it by going to the /settings menu.`)
        return ctx.scene.leave()
    }
)

export class LinkCommand extends Command {
    readonly name = 'link'

    public getStage(): WizardScene {
        return superWizard
    }

    public async run(ctx: SceneContextMessageUpdate) {
        await ctx.scene.enter('discord__link--new')
    }
}
