const crypto = require("crypto")
const { DynamoDB, PutItemCommand } = require("@aws-sdk/client-dynamodb");

async function routes (fastify, options) {

  const client = new DynamoDB({ 
    AccessKeyId: options.config.awsAccessKeyId,
    SecretAccessKey: options.config.awsSecretAccessKey,
    region:  options.config.awsDynamoRegion 
  });

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
    id = crypto.randomUUID();
    timestamp_utc = Math.floor(new Date().getTime() / 1000);
    const item = {
      TableName: "storedog-sentiment-v2",
      Item: {
        id: { S: id },
        product: { S: "monitoring-mug" },
        source: { S: "twitter" },
        timestamp_utc: { N: `${timestamp_utc}` },
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
