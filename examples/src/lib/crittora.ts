import { CrittoraClient, bearerToken, ApiCredentials, CognitoAuthProvider } from '@crittora/sdk-js'

// Re-export CrittoraClient for components
export { CrittoraClient }

// Get configuration from environment variables
const apiKey = import.meta.env.VITE_CRITTORA_API_KEY || ''
const accessKey = import.meta.env.VITE_CRITTORA_ACCESS_KEY || ''
const secretKey = import.meta.env.VITE_CRITTORA_SECRET_KEY || ''
const username = import.meta.env.VITE_CRITTORA_USERNAME || ''
const password = import.meta.env.VITE_CRITTORA_PASSWORD || ''
const baseUrl = import.meta.env.VITE_CRITTORA_BASE_URL || '/api'

console.log('crittora.ts - env vars loaded')
console.log('  username present:', !!username, username ? `prefix: ${username.substring(0,4)}` : '')
console.log('  password present:', !!password, password ? `prefix: ${password.substring(0,4)}` : '')
console.log('  apiKey present:', !!apiKey, apiKey ? `prefix: ${apiKey.substring(0,4)}` : '')

export interface ClientConfig {
  apiKey: string
  accessKey?: string
  secretKey?: string
  baseUrl?: string
}

export interface CognitoConfig {
  username: string
  password: string
  userPoolId?: string
  clientId?: string
}

// Use window.fetch wrapped to ensure proper Window binding
const browserFetch: typeof fetch = (input, init) => {
  console.log('Using wrapped fetch - input:', typeof input)
  return window.fetch(input, init)
}
console.log('browserFetch created - wrapping window.fetch')

/**
 * Creates a CrittoraClient with API credentials authentication
 */
export function createClientWithCredentials(config: ClientConfig): CrittoraClient {
  console.log('createClientWithCredentials called with fetch:', typeof browserFetch)
  const credentials: ApiCredentials = {
    apiKey: config.apiKey,
  }

  if (config.accessKey) {
    credentials.accessKey = config.accessKey
  }
  if (config.secretKey) {
    credentials.secretKey = config.secretKey
  }

  return new CrittoraClient({
    credentials,
    baseUrl: config.baseUrl || undefined,
    fetch: browserFetch,
  })
}

/**
 * Creates a CrittoraClient with Cognito authentication (username/password)
 * Returns the client and auth tokens
 */
export async function createClientWithCognito(config: CognitoConfig): Promise<{
  client: CrittoraClient
  tokens: { idToken: string; accessToken: string; refreshToken: string }
}> {
  console.log('createClientWithCognito - logging in with:', config.username, 'fetch:', typeof browserFetch)
  const auth = new CognitoAuthProvider({
    userPoolId: config.userPoolId || 'us-east-1_Tmljk4Uiw',
    clientId: config.clientId || '5cvaao4qgphfp38g433vi5e82u',
    username: config.username,
    password: config.password,
  })

  console.log('Calling auth.login...')
  const tokens = await auth.login({
    username: config.username,
    password: config.password,
  })
  console.log('Login successful, creating client with fetch:', typeof browserFetch)

  const client = new CrittoraClient({
    auth,
    credentials: {
      apiKey: config.apiKey || '',
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    },
    baseUrl: baseUrl || undefined,
    fetch: browserFetch,
  })

  return { client, tokens }
}

/**
 * Creates a CrittoraClient with Bearer token authentication
 */
export function createClientWithBearer(token: string): CrittoraClient {
  return new CrittoraClient({
    auth: bearerToken(token),
    baseUrl: baseUrl || undefined,
    fetch: browserFetch,
  })
}

/**
 * Creates a CrittoraClient using environment variables
 */
export async function createClientFromEnv(): Promise<CrittoraClient | null> {
  console.log('createClientFromEnv - checking credentials')
  console.log('  use cognito:', !!(username && password))
  console.log('  use api key:', !!apiKey)

  if (username && password) {
    console.log('Using Cognito authentication')
    const auth = new CognitoAuthProvider({
      userPoolId: 'us-east-1_Tmljk4Uiw',
      clientId: '5cvaao4qgphfp38g433vi5e82u',
      username,
      password,
    })

    try {
      console.log('Calling auth.login with username:', username)
      await auth.login({ username, password })
      console.log('Cognito login successful, creating client')

      return new CrittoraClient({
        auth,
        credentials: {
          apiKey,
          accessKey: accessKey || undefined,
          secretKey: secretKey || undefined,
        },
        baseUrl: baseUrl || undefined,
        fetch: browserFetch,
      })
    } catch (err) {
      console.error('Cognito login failed:', err)
      throw err
    }
  }

  if (apiKey) {
    console.log('Using API credentials with fetch:', typeof browserFetch)
    return new CrittoraClient({
      credentials: {
        apiKey,
        accessKey: accessKey || undefined,
        secretKey: secretKey || undefined,
      },
      baseUrl: baseUrl || undefined,
      fetch: browserFetch,
    })
  }

  console.warn('No authentication credentials found in environment')
  return null
}

/**
 * Get current configuration status
 */
export function getEnvConfig() {
  return {
    hasApiKey: !!apiKey,
    hasAccessKey: !!accessKey,
    hasSecretKey: !!secretKey,
    hasUsername: !!username,
    hasPassword: !!password,
    baseUrl: baseUrl || '(default)',
  }
}

// Export a function to initialize client (async)
export async function initClient(): Promise<CrittoraClient | null> {
  console.log('initClient called')
  return createClientFromEnv()
}
