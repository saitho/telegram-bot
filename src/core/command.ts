import {SceneContextMessageUpdate} from "telegraf/typings/stage";
import WizardScene from "telegraf/scenes/wizard";
import {Database} from "./database";

export abstract class Command {
    abstract readonly name
    protected db: Database

    constructor(database: Database) {
        this.db = database
    }

    public getStage(): WizardScene {
        return null
    }

    abstract async run(ctx: SceneContextMessageUpdate)
}
