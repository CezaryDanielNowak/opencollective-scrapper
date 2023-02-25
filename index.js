fs = require('fs');
const getSearchResults = require('./src/getSearchResult');

async function run({ logger, resultsPerPage, offset }) {
  const allAccounts = [];
  let i = offset;

  while (true) {
    try {
      logger(`Fetching offset ${i}`);

      const body = await getSearchResults(i, resultsPerPage);
      const nodes = body.data.accounts.nodes;

      fs.writeFileSync(
        `tmp/${i.toString().padStart(10, '0')}.json`,
        JSON.stringify(nodes),
      );

      if (nodes.length < resultsPerPage) {
        break;
      }
    } catch (err) {
      logger(`Error on offset ${i}`);
      console.warn(err);
      break;
    }
    i += resultsPerPage;
  }

  return true;
}

run({
  logger: console.log.bind(console, '[LOG] '),
  offset: 0,
  resultsPerPage: 50,
}).then(async () => {
  const contentArr = await readFiles('tmp/', '.json');
  const fileName = `accounts ${new Date().toISOString().split('T')[0]}.json`;

  let output = contentArr.reduce((acc, fileContent) => {
    acc.push(...JSON.parse(fileContent));
    return acc;
  }, []);

  // remove duplicates
  output = [...new Map(output.map((item) => [JSON.stringify(item), item])).values()];


  fs.writeFileSync(
    fileName,
    JSON.stringify(output, null, 2),
  );

  console.log(`Output file "${fileName}" created.`);
});

/**
 * readFiles reads content of all files from provided directory.
 *
 * 
 * @param  {string}  dirName    directory path
 * @param  {string}  extension  include files with the following extension
 * @return {Promise<Array>}     contents of all files
 */
function readFiles(dirName, extension = false) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirName, (err, fileNames) => {
      if (err) {
        return reject(err);
      }

      if (extension) {
        fileNames = fileNames.filter((fileName) => fileName.endsWith(extension));
      }
      
      const result = new Array(fileNames.length);
      let processingFiles = fileNames.length;

      fileNames
        .sort()
        .forEach((fileName, i) => {
          fs.readFile(dirName + fileName, 'utf-8', (err, content) => {
            if (err) {
              return reject(err);
            }
            result[i] = content;

            if (!--processingFiles) {
              resolve(result);
            }
          });
      });
    });
  });
}
