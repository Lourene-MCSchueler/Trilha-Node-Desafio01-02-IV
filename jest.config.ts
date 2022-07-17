export default {
  preset: "ts-jest",
  clearMocks: true,
  bail: true,
  coverageProvider: "v8",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  setupFiles: ['<rootDir>/jest/setVar.ts'],
};
