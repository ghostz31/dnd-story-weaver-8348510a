export default {
  // Environnement de test
  testEnvironment: 'jsdom',
  
  // Extensions de fichiers à traiter
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Patterns pour trouver les tests
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)'
  ],
  

  
  // Fichiers de setup
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  
  // Transformation des fichiers
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true
    }]
  },
  
  // Extensions ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Couverture de code
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/test/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.*',
    '!src/**/*.spec.*'
  ],
  
  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Reporters de couverture
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Dossier de sortie de la couverture
  coverageDirectory: 'coverage',
  
  // Ignorer les modules node_modules sauf certains
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@radix-ui))'
  ],
  
  // Configuration des globals
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Mock des fichiers statiques
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  }
}; 