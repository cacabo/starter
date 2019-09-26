let dotenv = require('dotenv')

// Set default to "development"
const nodeEnv = process.env.ENV_FILE || 'development'
const configEnvResult = dotenv.config({
  path: `./env/${nodeEnv}.env`,
})

if (configEnvResult.error) {
  throw configEnvResult.error
}
