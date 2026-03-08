/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["/node_modules/"],
  extensionsToTreatAsEsm: [".ts"],
};
