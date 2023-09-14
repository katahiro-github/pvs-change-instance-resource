const log4js = require("log4js");
const config = {
  appenders: {
    consoleLog: {
      type: 'console',
    }
  },
  categories: {
    default: {
      appenders: ["consoleLog"],
      level: "ALL"
    },
  },
};
log4js.configure(config);
const console = log4js.getLogger();
module.exports = {
  console
}