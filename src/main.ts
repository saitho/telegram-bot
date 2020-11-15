import {Telegraf, Stage, session} from "telegraf";
import {Command} from "./core/command";
import {LinkCommand} from "./commands/link";
import {SettingsCommand} from "./commands/settings";
import {Context} from "./core/context";
import {Notifier} from "./core/notifier";

require('dotenv').config()
const bot = new Telegraf<Context>(process.env.BOT_TOKEN)
const stage = new Stage([])

function registerCommand(command: Command) {
    const subMenu = command.getMenu()
    if (subMenu) {
        bot.use(subMenu)
    }
    const subStage = command.getStage()
    if (subStage) {
        stage.register(subStage)
    }
    stage.command(command.name, command.run)
}

// Check queue and send messages
new Notifier(bot).init()

registerCommand(new LinkCommand())
registerCommand(new SettingsCommand())
bot.use(session())
bot.use(stage.middleware())
bot.use(async (ctx) => {
    await ctx.replyWithMarkdown(`Hi there.
I know the following commands:
/link
/settings`)
})
bot.launch()
