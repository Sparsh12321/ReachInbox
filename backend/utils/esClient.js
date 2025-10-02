const { Client } = require("@elastic/elasticsearch");

const esClient = new Client({
  node: "http://localhost:9200",  // Elastic running locally
  
});

module.exports = esClient;
