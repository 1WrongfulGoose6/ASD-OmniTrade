const { getJestProjects } = require('@nx/jest');

module.exports = {
  projects: getJestProjects(),
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.jest.js' }],
  },
};
