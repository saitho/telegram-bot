import {Account, Database, Subscription} from "./database";
import YAML from 'yaml'
import * as fs from "fs";

interface Service {
    id: string;
    name: string;
}

export function getServices(): Service[] {
    const fileContent = fs.readFileSync('services.yml')
    return YAML.parse(fileContent.toString())
}

export function getSubscriptions(serviceId: string): (Subscription & Account)[] {
    const stmt = Database.connection.prepare('SELECT * FROM subscriptions s, accounts a WHERE s.service_id = ? AND a.telegram_id = s.telegram_id')
    return stmt.all(serviceId)
}

export function subscribe(serviceId: string, telegramId: number): boolean {
    const stmt = Database.connection.prepare('INSERT INTO subscriptions (telegram_id, service_id) VALUES (?, ?)')
    const info = stmt.run(telegramId, serviceId)
    return info.changes === 1;
}

export function unsubscribe(serviceId: string, telegramId: number): boolean {
    const stmt = Database.connection.prepare('DELETE FROM subscriptions WHERE telegram_id = ? AND service_id = ?')
    const info = stmt.run(telegramId, serviceId)
    return info.changes === 1;
}

export function isServiceEnabled(serviceId: string, telegramId: number): boolean {
    const checkSubscription = Database.connection.prepare('SELECT COUNT(*) AS c FROM subscriptions WHERE telegram_id = ? AND service_id = ?')
    const info = checkSubscription.get(telegramId, serviceId)
    return info['c'] > 0
}
