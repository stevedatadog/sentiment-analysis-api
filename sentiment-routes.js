const crypto = require("crypto");
const { DynamoDB, PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const tableName = "storedog-sentiment-v2";

const itemValidate = item => (
  'product' in item && 'S' in item['product']
  && 'media_source' in item && 'S' in item['media_source']
  && 'id' in item && 'S' in item['id']
  && 'sentiment' in item && 'N' in item['sentiment']
  && 'timestamp_utc' in item && 'N' in item['timestamp_utc']
)

const formatDynamoResults = results => results.map(item => {
  return {
    product: item['product']['S'],
    source: item['media_source']['S'],
    id: item['id']['S'],
    sentiment: item['sentiment']['N'],
    timestamp_utc : item['timestamp_utc']['N'] 
  }
});

async function routes (fastify, options) {

  const client = new DynamoDB({ 
    region:  options.config.awsDynamoRegion 
  });

  fastify.get('/', async (request, reply) => {
    return { 'message': 'Greetings from the Storedog Sentiment Analysis API' }
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

      if (!results['Items']) { 
        fastify.log.error(`No items found in results.`);
        return {}
      }

      return formatDynamoResults(results['Items'].filter(item => {
        if (!itemValidate(item)) {
          fastify.log.error(`item is invalid: ${JSON.stringify(item)}`)
          return false;
        }
        return true;
      }));

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

module.exports = routes;
