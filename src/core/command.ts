import {SceneContextMessageUpdate} from "telegraf/typings/stage";
import WizardScene from "telegraf/scenes/wizard";

export abstract class Command {
    abstract readonly name

    public getStage(): WizardScene {
        return null
    }

    abstract async run(ctx: SceneContextMessageUpdate)
}
