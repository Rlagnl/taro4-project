import defineJestConfig from '@tarojs/test-utils-react/dist/jest.js'

module.exports = defineJestConfig({
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/?(*.)+(spec|test).[jt]s?(x)']
})
