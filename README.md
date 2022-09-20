Storedog Sentiment Analysis API
===
This demo application is useful for extending the Storedog infrastructure with a fictional sentiment analysis API. An example narrative is that Storedog has partnered with a service that will measure people's sentiment (bad, neutral, good) about Storedog products when they are mentioned on social media. They will then post results to this API that Storedog has created for them.

You can simulate the partner's service by using a shell script (or node, or python, or whatever) to send random items to the `/create` endpoint, as described below.

You can see the latest sentiment results at the `/query` endpoint.

Requirements
---

- This was tested with node 16 on a Mac. It should run fine on Linux, too.
- An existing DynamoDB table. The app is hardcoded with `storedog-sentiment-v2` in `us-west-2`.
- AWS credentials.

Usage
---

Assuming you have a DynamoDB table named `storedog-sentiment-v2` in `us-west-2` (these are currently hardcoded):

```sh
npm install

AWS_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx \
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
npm start
```

It listens on port 3000 by default, and logs to a file `saa.log`. These are configurable in `index.js`

Endpoints
---
The API has three JSON endpoints:

`GET /` 
: displays a welcome message

`GET /query` 
: displays a list of items. You can add the query string `?minutes=10` to get items created in the last 10 minutes. Any number of minutes works.

`POST /create`
: which accepts a JSON payload to create an item.


You can create items like this:

```sh
curl -X POST 
  -H 'Content-Type: application/json' \
  -d '{ "product" : "monitoring-bag", "source": "twitter", "sentiment": "0" }' \
  localhost:3000/create
```

Where `product` is a string representing a storedog product. It can be anything, but the actual products in old storedog are:

- datadog-jr-spaghetti
- spree-jr-spaghetti
- datadog-jr-spaghetti
- datadog-mug
- datadog-stein
- monitoring-stein
- monitoring-mug
- datadog-tote
- datadog-bag
- spree-tote
- spree-bag

`source` can be any string, but is intended to be a social media source:

- facebook
- instagram
- twitter
- tiktock

Sentiment can be any number, but it is intended to be one of:

| value | sentiment |
| --    | --        |
| -1    | bad       |
|  0    | neutral   |
|  1    | positive  |

