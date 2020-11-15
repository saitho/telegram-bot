import fs from "fs";
import path from "path";
import {Telegraf} from "telegraf";
import {TelegrafContext} from "telegraf/typings/context";

interface Message {
    recipient: number;
    text: string;
}

export class Notifier {
    public static readonly NOTIFICATION_FOLDER = 'messages';

    protected bot: Telegraf<TelegrafContext>

    constructor(bot: Telegraf<TelegrafContext>) {
        this.bot = bot
    }

    public init() {
        setInterval(() => this.notifyAllUsers(), 5000);
    }

    public static addToQueue(msg: Message) {
        fs.writeFileSync(path.join(Notifier.NOTIFICATION_FOLDER, Date.now() + '.json'), JSON.stringify(msg))
    }

    public async notifyAllUsers() {
        const items = this.getMessageQueueItems()
        for (const item of items) {
            await this.bot.telegram.sendMessage(item.recipient, item.text)
            await fs.unlinkSync(item.filepath)
        }
    }

    protected getMessageQueueItems(): (Message & {filepath: string;})[] {
        const items = []
        for (const file of fs.readdirSync(Notifier.NOTIFICATION_FOLDER)) {
            if (!file.endsWith('.json')) {
                continue;
            }
            const filePath = path.join(Notifier.NOTIFICATION_FOLDER, file)
            const content = fs.readFileSync(filePath)
            const msg = JSON.parse(content.toString());
            items.push({...msg, filepath: filePath})
        }
        return items;
    }
}
