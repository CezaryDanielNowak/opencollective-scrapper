fs = require('fs');
const getSearchResults = require('./src/getSearchResult');

async function run({ logger, resultsPerPage, fileName, offset }) {
  const allAccounts = [];
  let i = offset;

  while (true) {
    try {
      logger(`Fetching offset ${i}`);

      const body = await getSearchResults(i, resultsPerPage);
      const nodes = body.data.accounts.nodes;

      allAccounts.push(...nodes);
      if (nodes.length < resultsPerPage) {
        break;
      }
    } catch (err) {
      logger(`Error on offset ${i}`);
      allAccounts.push(`ERROR ON PAGE ${i}`);
      console.warn(err);
      break;
    }
    ++i;
  }

  fs.writeFileSync(
    fileName,
    JSON.stringify(allAccounts, null, 2),
  );
}

run({
  fileName: `accounts ${new Date().toISOString().split('T')[0]}.json`,
  logger: console.log.bind(console, '[LOG] '),
  offset: 0,
  resultsPerPage: 50,
});

