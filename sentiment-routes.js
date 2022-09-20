const crypto = require("crypto");
const { DynamoDB, PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const tableName = "storedog-sentiment-v2";

async function routes (fastify, options) {

  const client = new DynamoDB({ 
    AccessKeyId: options.config.awsAccessKeyId,
    SecretAccessKey: options.config.awsSecretAccessKey,
    region:  options.config.awsDynamoRegion 
  });

  fastify.get('/', async (request, reply) => {
    return { 'message': 'Greetings from the Storedog Sentiment Analysis Engine' }
  })

  // Returns all sentiment records from the previous X minutes
  fastify.get('/query', async (request, reply) => {

    const minutes = (request['query'] && request['query']['minutes']) ? request['query']['minutes'] : 1;
    const queryTime = Math.floor(new Date().getTime() / 1000) - (minutes * 60);

    const params = {
      FilterExpression: "timestamp_utc > :qt",
      ExpressionAttributeValues: { ":qt": { N: `${queryTime}` } },
      ProjectionExpression: "id, product, media_source, sentiment, timestamp_utc",
      TableName: tableName
    }

    try {
      const results = await client.send(new ScanCommand(params));
      return { 'message': 'All sentiment stuff.' }
    } catch (err) {
      fastify.log.error(err)
    }
  })

  // Creates a sentiment record
  fastify.post('/create', async (request, reply) => {
    const id = crypto.randomUUID();
    const timestamp_utc = Math.floor(new Date().getTime() / 1000);
    const { product, source, sentiment } = request['body'];
    const item = {
      TableName: tableName,
      Item: {
        id: { S: id },
        product: { S: product },
        media_source: { S: source },
        timestamp_utc: { N: `${timestamp_utc}` },
        sentiment: { N: `${sentiment}` }
      }
    }
    try {
      const results = await client.send(new PutItemCommand(item));
      return { 
        'status': results['$metadata']['httpStatusCode'],
        'message': results['$metadata']['requestId'] 
      }
    } catch (err) {
      fastify.log.error(err)
    }
  })
}

module.exports = routes
