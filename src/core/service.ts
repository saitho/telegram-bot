import {Database} from "./database";
import YAML from 'yaml'
import * as fs from "fs";

interface Service {
    id: string;
    name: string;
}

let services: Service[] = [];

export function getServices(): Service[] {
    if (!services.length) {
        const filePath = process.env.SERVICES_FILE ?? './services.yml'
        const fileContent = fs.readFileSync(filePath)
        const parsedServices = YAML.parse(fileContent.toString())
        services = parsedServices as Service[]
    }
    return services
}

export function subscribe(serviceId: string, telegramId: number): boolean {
    console.log('subscribe ' + serviceId)
    const stmt = Database.connection.prepare('INSERT INTO subscriptions (telegram_id, service_id) VALUES (?, ?)')
    const info = stmt.run(telegramId, serviceId)
    return info.changes === 1;
}

export function unsubscribe(serviceId: string, telegramId: number): boolean {
    console.log('unsubscribe ' + serviceId)
    const stmt = Database.connection.prepare('DELETE FROM subscriptions WHERE telegram_id = ? AND service_id = ?')
    const info = stmt.run(telegramId, serviceId)
    return info.changes === 1;
}

export function isServiceEnabled(serviceId: string, telegramId: number): boolean {
    const checkSubscription = Database.connection.prepare('SELECT COUNT(*) AS c FROM subscriptions WHERE telegram_id = ? AND service_id = ?')
    const info = checkSubscription.get(telegramId, serviceId)
    return info['c'] > 0
}
