const crypto = require("crypto")
const { DynamoDB, PutItemCommand } = require("@aws-sdk/client-dynamodb");

async function routes (fastify, options) {

  const client = new DynamoDB({ region:  options.config.awsDynamoRegion });

  fastify.get('/', async (request, reply) => {
    return { 'message': 'Greetings from the Storedog Sentiment Analysis Engine' }
  })

  fastify.get('/query', async (request, reply) => {
    try {
      const results = await client.listTables({});
      // debug
      console.log(results.TableNames.join("\n"));
      return { 'message': 'All sentiment stuff.' }
    } catch (err) {
      fastify.log.error(err)
    }
  })

  fastify.post('/create', async (request, reply) => {
    const item = {
      TableName: "storedog-sentiment-v2",
      Item: {
        id: { S: crypto.randomUUID() },
        product: { S: "datadog-bag" },
        source: { S: "instagram" },
        sentiment: { N: "-1" }
      }
    }
    try {
      const results = await client.send(new PutItemCommand(item));
      // debug
      console.log(results);
      return { 'message': 'All sentiment stuff.' }
    } catch (err) {
      fastify.log.error(err)
    }
  })
}

module.exports = routes
