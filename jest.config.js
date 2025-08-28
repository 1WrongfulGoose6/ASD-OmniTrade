const { getJestProjects } = require('@nx/jest');

module.exports = {
  projects: getJestProjects(),
  // Let's tell Jest to use babel.config.jest.js for transforming files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.jest.js' }],
  },
};
