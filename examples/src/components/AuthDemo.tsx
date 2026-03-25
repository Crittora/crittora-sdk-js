import { useState } from 'react'
import {
  createClientWithCredentials,
  createClientWithBearer,
  createClientWithCognito,
  getEnvConfig,
} from '../lib/crittora'

type AuthType = 'credentials' | 'bearer' | 'cognito'

export default function AuthDemo() {
  const [authType, setAuthType] = useState<AuthType>('credentials')
  const [apiKey, setApiKey] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [bearerToken, setBearerToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [testResult, setTestResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const config = getEnvConfig()

  const handleTestAuth = async () => {
    setLoading(true)
    setError('')
    setTestResult('')

    try {
      let client
      let result

      if (authType === 'credentials') {
        if (!apiKey.trim()) {
          setError('API Key is required for credentials auth')
          setLoading(false)
          return
        }
        client = createClientWithCredentials({
          apiKey: apiKey.trim(),
          accessKey: accessKey.trim() || undefined,
          secretKey: secretKey.trim() || undefined,
        })
        result = await client.encrypt({ data: 'Auth test' })
        setTestResult(`API Credentials authentication successful! Encrypted data: ${result.encryptedData.substring(0, 50)}...`)
      } else if (authType === 'bearer') {
        if (!bearerToken.trim()) {
          setError('Bearer token is required')
          setLoading(false)
          return
        }
        client = createClientWithBearer(bearerToken.trim())
        result = await client.encrypt({ data: 'Auth test' })
        setTestResult(`Bearer token authentication successful! Encrypted data: ${result.encryptedData.substring(0, 50)}...`)
      } else if (authType === 'cognito') {
        if (!username.trim() || !password.trim()) {
          setError('Username and password are required for Cognito auth')
          setLoading(false)
          return
        }
        const { client: cognitoClient } = await createClientWithCognito({
          username: username.trim(),
          password: password.trim(),
        })
        result = await cognitoClient.encrypt({ data: 'Auth test' })
        setTestResult(`Cognito authentication successful! Token obtained. Encrypted data: ${result.encryptedData.substring(0, 50)}...`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication test failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUseEnvConfig = () => {
    if (config.hasUsername && config.hasPassword) {
      setAuthType('cognito')
      setUsername(config.hasUsername ? '***configured***' : '')
      setPassword('')
    } else if (config.hasApiKey) {
      setAuthType('credentials')
      setApiKey(config.hasApiKey ? '***configured***' : '')
      setAccessKey(config.hasAccessKey ? '***configured***' : '')
      setSecretKey(config.hasSecretKey ? '***configured***' : '')
    }
  }

  return (
    <div className="demo-section">
      <h2>Authentication Demo</h2>
      <p className="description">
        This demo shows the different authentication methods supported by the Crittora SDK.
      </p>

      {(config.hasApiKey || config.hasUsername) && (
        <div className="info">
          Environment configuration detected. You can use it or enter custom credentials below.
        </div>
      )}

      {(config.hasApiKey || config.hasUsername) && (
        <button onClick={handleUseEnvConfig} className="small">
          Use Environment Config
        </button>
      )}

      <div className="form-group">
        <label>Authentication Type:</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="authType"
              value="credentials"
              checked={authType === 'credentials'}
              onChange={() => setAuthType('credentials')}
            />
            API Credentials (apiKey + optional accessKey/secretKey)
          </label>
          <label>
            <input
              type="radio"
              name="authType"
              value="bearer"
              checked={authType === 'bearer'}
              onChange={() => setAuthType('bearer')}
            />
            Bearer Token
          </label>
          <label>
            <input
              type="radio"
              name="authType"
              value="cognito"
              checked={authType === 'cognito'}
              onChange={() => setAuthType('cognito')}
            />
            Cognito (username/password)
          </label>
        </div>
      </div>

      {authType === 'credentials' && (
        <>
          <div className="form-group">
            <label htmlFor="apiKey">API Key *</label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="accessKey">Access Key (optional)</label>
            <input
              id="accessKey"
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Enter access key"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="secretKey">Secret Key (optional)</label>
            <input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter secret key"
              disabled={loading}
            />
          </div>
        </>
      )}

      {authType === 'bearer' && (
        <div className="form-group">
          <label htmlFor="bearerToken">Bearer Token *</label>
          <input
            id="bearerToken"
            type="text"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            placeholder="Enter your bearer token"
            disabled={loading}
          />
        </div>
      )}

      {authType === 'cognito' && (
        <>
          <div className="form-group">
            <label htmlFor="cognitoUsername">Username *</label>
            <input
              id="cognitoUsername"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cognitoPassword">Password *</label>
            <input
              id="cognitoPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
        </>
      )}

      <div className="button-group">
        <button
          onClick={handleTestAuth}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {testResult && <div className="result success">{testResult}</div>}
    </div>
  )
}
