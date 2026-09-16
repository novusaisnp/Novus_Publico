const { setServers } = require("node:dns");

const dnsServer = process.env.MONGODB_DNS_SERVER;

if (dnsServer) {
  setServers([dnsServer]);
}
