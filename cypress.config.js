const { defineConfig } = require("cypress");
const {addCucumberPreprocessorPlugin} = require("@badeball/cypress-cucumber-preprocessor");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  e2e: {
    env: {
      wsUrl: 'wss://sandbox-shared.staging.exberry-uat.io',
      apiUrl: 'https://admin-api-shared.staging.exberry-uat.io',
      user: 'qacandidate@gmail.com',
      password: 'p#xazQI!Y%z^L34a#',
    },
    baseUrl: 'http://google.com',
    defaultCommandTimeout: 60000,
    specPattern: "integration/**/*.feature",
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
          "file:preprocessor",
          createBundler({
            plugins: [createEsbuildPlugin.default(config)],
          })
      );

      return config;
    },
  },
  video: false,
});
