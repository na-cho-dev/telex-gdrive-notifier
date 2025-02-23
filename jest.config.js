export default {
  testEnvironment: "node",
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  setupFiles: ["./jest.setup.js"],
};
