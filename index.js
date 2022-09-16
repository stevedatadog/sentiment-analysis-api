const config = {
  logPath: process.env['SAE_LOG_PATH'] ?? 'sae.log',
  listenPort: process.env['SAE_LISTEN_PORT'] ?? 3000,
  awsDynamoRegion: process.env['AWS_DYNAMO_REGION'] ?? "us-west-2"
}

const fastify = require('fastify')({
  logger: {
    file: config.logPath
  }
})


fastify.register(require('./sentiment-routes'), { config })

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ host: '0.0.0.0', port: config.listenPort })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
