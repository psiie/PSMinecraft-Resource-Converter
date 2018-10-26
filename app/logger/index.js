const loggingEnabled = process.env.LOG;

function logger(params) {
  if (!loggingEnabled) return;
  console.log.call(this, params); // eslint-disable-line
}

module.exports = logger;
