import WizardScene from "telegraf/scenes/wizard";
import {Database} from "./database";
import {MenuMiddleware} from "telegraf-inline-menu";
import {Context} from "./context";
import {TelegrafContext} from "telegraf/typings/context";

export abstract class Command {
    abstract readonly name

    public getStage(): WizardScene {
        return null
    }

    public getMenu(): MenuMiddleware<Context> {
        return null;
    }

    abstract async run(ctx: TelegrafContext)
}
