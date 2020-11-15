import {Command} from "../core/command";
import {MenuTemplate, MenuMiddleware, createBackMainMenuButtons} from 'telegraf-inline-menu'
import {Context} from "../core/context";
import {isServiceEnabled, getServices, subscribe, unsubscribe} from "../core/service";

const menuTemplate = new MenuTemplate<Context>(ctx => `Hey ${ctx.from.first_name}! Please choose a setting you want to change:`)

const notificationSelectSettings = new MenuTemplate<Context>("Please select the notifications you want to receive:")
for (const service of getServices()) {
    notificationSelectSettings.toggle(service.name, 'service-' + service.id, {
        set: (ctx, choice) => {
            if (!choice) {
                return unsubscribe(service.id, ctx.from.id)
            }
            return subscribe(service.id, ctx.from.id)
        },
        isSet: (ctx) => {
            return isServiceEnabled(service.id, ctx.from.id)
        }
    })
}
notificationSelectSettings.manualRow(createBackMainMenuButtons())

menuTemplate.submenu('✉ Notification settings', 'notification', notificationSelectSettings)
menuTemplate.interact('❌ Unlink account', 'unlink', {
    // @ts-ignore
    do: async (ctx) => {
        await ctx.reply('As am I!')
        return false
    }
})

const menu = new MenuMiddleware<Context>('/', menuTemplate)

export class SettingsCommand extends Command {
    readonly name = 'settings'

    public getMenu(): MenuMiddleware<Context> {
        return menu;
    }

    public run(ctx: Context) {
        // process.env.DISCORD_BOT_TOKEN
        return menu.replyToContext(ctx)
        // await ctx.reply('Hello!')
        //await ctx.scene.enter('discord__link--new')
    }
}
