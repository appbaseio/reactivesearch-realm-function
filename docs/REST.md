## Working with the ReactiveSearch Realm function

The ReactiveSearch Realm function endpoint exposes a REST API that all of ReactiveSearch and Searchbox UI libraries use to express the declarative search intent.

The ReactiveSearch API is documented over [here](https://docs.appbase.io/docs/search/reactivesearch-api/reference).

For this documentation, we are making use of a publicly deployed Realm endpoint. You can substitute this with your deployed function's URL.

```bash
Endpoint: https://us-east-1.aws.webhooks.mongodb-realm.com/api/client/v2.0/app/public-demo-skxjb/service/http_endpoint/incoming_webhook/reactivesearch
```

### Use Cases


#### Building List UIs

A single/multi select facet UI is typically represented with a term query. Here, we will take a look at different ways of creating this UI.

1. Getting the top buckets

<iframe src="https://play.reactivesearch.io/embed/gBOY9B3F41P3o8DZNl4o" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

2. Sort buckets by `asc` order

<iframe src="https://play.reactivesearch.io/embed/LCSl4bQV8NzX3HNTkNtg" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

3. Finding any of the facet items: A multi-select filtering use-case

<iframe src="https://play.reactivesearch.io/embed/moPGn2vjlApQJUPClyCG" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

4. Finding all of the facet items: A multi-select filtering use-case

<iframe src="https://play.reactivesearch.io/embed/PEVFz2Jnus7uhKG7dTb0" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

5. Passing MongoDB aggregation stages directly to override the default query of the term component

<iframe src="https://play.reactivesearch.io/embed/7hYC8U1cG33cE6wkgUEi" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

6. Passing MongoDB aggregation stages directly to override the default query of the result component

<iframe src="https://play.reactivesearch.io/embed/TsOlt9CpxgufdDX0LI4N" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>


#### Building Range UIs

A Range UI is typically represented as a range selector, range input/slider, or a date picker.

1. Get the results within the given range of a field value

<iframe src="https://play.reactivesearch.io/embed/TyxUhuJ77y1DQ8hKL5l2" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

2. Get results within a given range as well as return min, max and histogram aggregations

<iframe src="https://play.reactivesearch.io/embed/yUrnvc9Kt7nt3gg0fNuZ" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

3. Return documents with null values in the path (aka field) for a given range selection

<iframe src="https://play.reactivesearch.io/embed/18KIx3mC4CK3EEnldAur" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

#### Building Geo UIs

A map (Google Maps, OpenStreetMaps) is typically used for building geo UIs. It primarily uses two types of queries.

1. Searching within a circle

<iframe src="https://play.reactivesearch.io/embed/bANFzLidlDl547khEEmF" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

2. Searching within a bounding box

<iframe src="https://play.reactivesearch.io/embed/Cza0tApO2Bp2TVMxgJ3m" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

#### Building Search UIs

A searchbox is typically used for building an autosuggestions or a highlighting based experience.

1. Searching on specific fields with weights

<iframe src="https://play.reactivesearch.io/embed/YmxZ7oDhEjlcPz8WAqtk" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

2. Searching with highlighting enabled

<iframe src="https://play.reactivesearch.io/embed/yBaLhQKu6A4IayJ65POf" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

3. Searching with fuzziness set to 1

<iframe src="https://play.reactivesearch.io/embed/O1r3NUkrzhLqAvrjcBag" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>

4. Searching with autocomplete type

<iframe src="https://play.reactivesearch.io/embed/bWmkZxQ8KSv7pGHcOFp9" style="width:100%; height: 500px; border:0;  overflow:hidden;"
   title=rs-playground-DmIAKMrUXLpwn2zRAaRB
 ></iframe>