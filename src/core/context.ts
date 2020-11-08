import {SceneContextMessageUpdate} from "telegraf/typings/stage";

export interface Session {
    page?: number;
}

export interface Context extends SceneContextMessageUpdate {
    session: Session;
}
