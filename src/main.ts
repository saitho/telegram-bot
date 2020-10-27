import {Telegraf, Stage, session} from "telegraf";
import {Command} from "./core/command";
import {LinkCommand} from "./commands/link";

const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Stage([])

function registerCommand(command: Command) {
    const subStage = command.getStage()
    if (subStage) {
        stage.register(subStage)
    }
    stage.command(command.name, command.run)
}

registerCommand(new LinkCommand())
bot.use(session())
bot.use(stage.middleware())
bot.launch()
