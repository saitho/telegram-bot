import {getSubscriptions} from "./core/service";
import fastify from "fastify";
import {Notifier} from "./core/notifier";

require('dotenv').config()
const server = fastify({ logger: true })

// Declare a route
server.post('/send/:serviceId', (request, reply) => {
    const subscriptions = getSubscriptions(request.params['serviceId'])

    const message = request.body['message']
    if (!message) {
        reply.code(400).send({error: 'Missing message.'})
        return;
    }

    const recipients = request.body['recipients'] ?? []
    if (recipients.length) {
        subscriptions.filter((s) => recipients.indexOf(s.discord_id) !== -1)
    }

    const sent = []
    for (const subscription of subscriptions) {
        Notifier.addToQueue({
            recipient: subscription.telegram_id,
            text: message
        })
        sent.push(subscription.discord_id)
    }

    reply.send({ sent })
})

// Run the server!
server.listen(3000, '0.0.0.0', (err, address) => {
    if (err) throw err
    server.log.info(`server listening on ${address}`)
})
