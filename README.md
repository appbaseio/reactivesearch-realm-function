# ReactiveSearch Realm Function


The ReactiveSearch Realm project deploys the ReactiveSearch API as a transpiled JS code into a Realm function. The goal of this project is to enable Atlas Search users to be able to build search UIs using [Searchbox](https://opensource.appbase.io/searchbox) and [ReactiveSearch](https://opensource.appbase.io/reactivesearch) UI libraries.

> **Note on current project status:** This project is being actively developed and currently in a MVP stage where Atlas Search users can deploy the Realm function and run it with the React Searchbox library. Follow the below guides to get started and test this.

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
  curl --location --request POST 'http://localhost:8080/_reactivesearch' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "query": [{
            "id": "search",
            "type": "search",
            "dataField": "*",
            "size": 5
        }],
        "mongodb": {
            "db": "sample_airbnb",
            "collection": "listingsAndReviews"
        }
    }'
  ```

## How To Use

Go over the steps to deploy this project over [here](https://docs.appbase.io/docs/reactivesearch/atlas-search/deploy/).
