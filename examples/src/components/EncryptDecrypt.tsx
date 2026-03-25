import { useState, useEffect } from 'react'
import { CrittoraClient, initClient, getEnvConfig } from '../lib/crittora'

export default function EncryptDecrypt() {
  const [client, setClient] = useState<CrittoraClient | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [plaintext, setPlaintext] = useState('')
  const [ciphertext, setCiphertext] = useState('')
  const [decrypted, setDecrypted] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initError, setInitError] = useState('')

  const config = getEnvConfig()

  console.log('Config:', config)

  // Initialize client on mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing client...')
        const c = await initClient()
        console.log('Client initialized:', c)
        if (c) {
          setClient(c)
          setAuthenticated(true)
          console.log('Authentication successful')
        } else {
          const msg = 'Failed to initialize client. Check your .env configuration.'
          console.error(msg)
          setInitError(msg)
        }
      } catch (err) {
        console.error('Init error:', err)
        const msg = err instanceof Error ? err.message : 'Authentication failed'
        setInitError(msg)
      }
    }
    init()
  }, [])

  const handleEncrypt = async () => {
    if (!plaintext.trim()) {
      setError('Please enter plaintext to encrypt')
      return
    }

    if (!client) {
      setError('Client not initialized. Check your .env configuration.')
      return
    }

    setLoading(true)
    setError('')
    console.log('Calling encrypt...')
    try {
      const result = await client.encrypt({ data: plaintext })
      console.log('Encrypt result:', result)
      setCiphertext(result.encryptedData)
      setDecrypted('')
    } catch (err) {
      console.error('Encrypt error:', err)
      setError(err instanceof Error ? err.message : 'Encryption failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDecrypt = async () => {
    if (!ciphertext.trim()) {
      setError('No ciphertext to decrypt')
      return
    }

    if (!client) {
      setError('Client not initialized. Check your .env configuration.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await client.decrypt({ encryptedData: ciphertext })
      setDecrypted(result.decryptedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPlaintext('')
    setCiphertext('')
    setDecrypted('')
    setError('')
  }

  return (
    <div className="demo-section">
      <h2>Basic Encryption Demo</h2>
      <p className="description">
        This demo shows the basic encrypt/decrypt flow using the Crittora SDK.
        It uses Cognito authentication with username/password from environment.
      </p>

      {!authenticated && !initError && (
        <div className="info">
          Authenticating...
        </div>
      )}

      {initError && (
        <div className="error">{initError}</div>
      )}

      {config.hasUsername && config.hasPassword && (
        <div className="info">
          Using Cognito authentication (username/password from env)
        </div>
      )}

      {!config.hasUsername && !config.hasPassword && !config.hasApiKey && (
        <div className="warning">
          No credentials found in .env. Please check your configuration.
        </div>
      )}

      <div className="form-group">
        <label htmlFor="plaintext">Plaintext</label>
        <textarea
          id="plaintext"
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          placeholder="Enter text to encrypt..."
          rows={3}
          disabled={loading || !authenticated}
        />
      </div>

      <div className="button-group">
        <button onClick={handleEncrypt} disabled={loading || !authenticated || !plaintext.trim()}>
          {loading ? 'Encrypting...' : 'Encrypt'}
        </button>
        <button onClick={handleDecrypt} disabled={loading || !authenticated || !ciphertext.trim()}>
          {loading ? 'Decrypting...' : 'Decrypt'}
        </button>
        <button onClick={handleClear} className="secondary">
          Clear
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {ciphertext && (
        <div className="result">
          <label>Ciphertext (Base64):</label>
          <pre className="code">{ciphertext}</pre>
        </div>
      )}

      {decrypted && (
        <div className="result success">
          <label>Decrypted Result:</label>
          <pre className="code">{decrypted}</pre>
        </div>
      )}
    </div>
  )
}
