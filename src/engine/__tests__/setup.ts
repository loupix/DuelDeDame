// Configuration globale pour les tests
import 'jest'

// Mock des timers pour les tests asynchrones
jest.useFakeTimers()

// Configuration des timeouts
jest.setTimeout(10000)

// Mock des console.log pour éviter le spam dans les tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Configuration des tests
beforeEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})