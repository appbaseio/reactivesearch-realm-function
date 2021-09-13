# reactivesearch-realm-function

## Setup

- Clone repo: `git clone https://github.com/appbaseio-confidential/reactivesearch-realm-function.git`
- Change working dir: `cd reactivesearch-realm-function`
- Install dependencies: `npm i`
- Start local build with hot reload: `npm start`
- Test local build: `npm run start:test`

## Local Testing

- Add valid env `cp .env.sample .env`
- Update env variables in `.env` file. `DB_URL` and `DB_NAME` are the required env
- Start local server `npm run dev`
- Local server exposes 2 endpoints to test the functionality
  - `/:collection_name/_reactivesearch` -> Endpoint to execute rs query and get mongo response. Sample output `{data: []}`. `collection_name` is dynamic param that one can pass against which query is to be executed
  - `/:collection_name/_reactivesearch/validate` -> Endpoint to validate rs query and get the aggregation pipleline in response.
- Make `curl` / `rest` request

  ```sh
  curl -XPOST localhost:8080/listingsAndReviews/_reactivesearch -H 'Content-Type: application/json' -d '{"query": [{"id": "test", "value": "room", "dataField": ["name"], "type": "search", "index": "default"}]}'
  ```

## Deploying realm function

- #### `yarn install`
  Install all the dependencies
- #### `yarn global install typescript concat`
  Install typescript and build utilities
- #### `node rs-cli --private-api-key <private api key> --public-api-key <public api key> --app-id <application id>`
  Deploys webhook to your Realm app
