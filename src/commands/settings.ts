import {Command} from "../core/command";
import {MenuTemplate, MenuMiddleware, createBackMainMenuButtons} from 'telegraf-inline-menu'
import {Context} from "../core/context";
import {isServiceEnabled, getServices, subscribe, unsubscribe} from "../core/service";
import {Database} from "../core/database";

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
        const stmt = Database.connection.prepare('DELETE FROM accounts WHERE telegram_id = ?')
        const info = stmt.run(ctx.update.callback_query.from.id)
        if (info.changes === 1) {
            await ctx.reply('Your Discord account was unlinked from your Telegram account.')
        } else {
            await ctx.reply('An error occurred while trying to unlink your Telegram account.')
        }
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
        const stmt = Database.connection.prepare('SELECT * FROM accounts WHERE telegram_id = ?')
        const user = stmt.get(ctx.update.message.from.id)
        if (!user) {
            return ctx.replyWithMarkdown('Your Telegram account is not linked to a Discord account. You can link it in /link.')
        }
        return menu.replyToContext(ctx)
    }
}
