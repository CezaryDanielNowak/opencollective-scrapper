const https = require('https');
const fs = require('fs');

const options = {
  'method': 'POST',
  'hostname': 'opencollective.com',
  'path': '/api/graphql/v2',
  'headers': {
    'Content-Type': 'application/json'
  }
};

/**
 * request API and get results.
 * 
 * @param  {Number} page           starts from 0
 * @param  {Number} limit          limit per page. Response for 100 is already slow.
 * @return {Promise<object>}       Return body asynchronously
 */
module.exports = function getSearchResults(offset, limit = 50) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        const body = Buffer.concat(chunks);
        resolve(JSON.parse(body.toString()));
      });

      res.on("error", reject);
    });

    const postData = JSON.stringify({
      "operationName": "SearchPage",
      "variables": {
        "term": "",
        "type": [
          "COLLECTIVE",
          "EVENT",
          "ORGANIZATION",
          "FUND",
          "PROJECT"
        ],
        "limit": limit,
        "offset": offset,
        "country": null,
        "tag": [],
        "sortBy": {
          "field": "ACTIVITY",
          "direction": "DESC"
        }
      },
      "query": "query SearchPage($term: String!, $type: [AccountType], $country: [CountryISO], $tag: [String], $sortBy: OrderByInput, $isHost: Boolean, $limit: Int, $offset: Int) {\n  accounts(\n    searchTerm: $term\n    type: $type\n    isHost: $isHost\n    limit: $limit\n    offset: $offset\n    skipRecentAccounts: true\n    country: $country\n    orderBy: $sortBy\n    tag: $tag\n  ) {\n    nodes {\n      id\n      isActive\n      type\n      slug\n      name\n      location {\n        id\n        country\n        __typename\n      }\n      tags\n      isHost\n      imageUrl(height: 96)\n      backgroundImageUrl(height: 208)\n      description\n      website\n      currency\n      stats {\n        id\n        totalAmountReceived(useCache: true) {\n          currency\n          valueInCents\n          __typename\n        }\n        totalAmountSpent {\n          currency\n          valueInCents\n          __typename\n        }\n        __typename\n      }\n      ... on Organization {\n        host {\n          id\n          hostFeePercent\n          totalHostedCollectives\n          __typename\n        }\n        __typename\n      }\n      ... on AccountWithParent {\n        parent {\n          id\n          slug\n          backgroundImageUrl\n          location {\n            id\n            country\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      backers: members(role: BACKER) {\n        totalCount\n        __typename\n      }\n      __typename\n    }\n    limit\n    offset\n    totalCount\n    __typename\n  }\n  tagStats(searchTerm: $term) {\n    nodes {\n      id\n      tag\n      __typename\n    }\n    __typename\n  }\n}"
    });

    req.write(postData);

    req.end();
  });

}