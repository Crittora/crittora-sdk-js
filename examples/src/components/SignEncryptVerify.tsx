import { useState, useEffect } from 'react'
import { CrittoraClient, initClient, getEnvConfig } from '../lib/crittora'

export default function SignEncryptVerify() {
  const [client, setClient] = useState<CrittoraClient | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [plaintext, setPlaintext] = useState('')
  const [signedCiphertext, setSignedCiphertext] = useState('')
  const [verifyResult, setVerifyResult] = useState<{
    decryptedData: string
    isValidSignature: boolean
    signedBy?: string
    signedTimestamp?: string
  } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initError, setInitError] = useState('')

  const config = getEnvConfig()

  // Initialize client on mount
  useEffect(() => {
    const init = async () => {
      try {
        const c = await initClient()
        if (c) {
          setClient(c)
          setAuthenticated(true)
        } else {
          setInitError('Failed to initialize client. Check your .env configuration.')
        }
      } catch (err) {
        setInitError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }
    init()
  }, [])

  const handleSignEncrypt = async () => {
    if (!plaintext.trim()) {
      setError('Please enter plaintext to sign and encrypt')
      return
    }

    if (!client) {
      setError('Client not initialized. Check your .env configuration.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await client.signEncrypt({ data: plaintext })
      setSignedCiphertext(result.encryptedData)
      setVerifyResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign + Encrypt failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDecryptVerify = async () => {
    if (!signedCiphertext.trim()) {
      setError('No signed ciphertext to decrypt and verify')
      return
    }

    if (!client) {
      setError('Client not initialized. Check your .env configuration.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await client.decryptVerify({ encryptedData: signedCiphertext })
      setVerifyResult({
        decryptedData: result.decryptedData,
        isValidSignature: result.isValidSignature,
        signedBy: result.signedBy,
        signedTimestamp: result.signedTimestamp,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decrypt + Verify failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPlaintext('')
    setSignedCiphertext('')
    setVerifyResult(null)
    setError('')
  }

  return (
    <div className="demo-section">
      <h2>Sign & Verify Demo</h2>
      <p className="description">
        This demo shows how to sign a message before encrypting, then decrypt and verify the signature.
        This provides confidentiality + authenticity.
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

      <div className="form-group">
        <label htmlFor="signPlaintext">Message to Sign & Encrypt</label>
        <textarea
          id="signPlaintext"
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          placeholder="Enter text to sign and encrypt..."
          rows={3}
          disabled={loading || !authenticated}
        />
      </div>

      <div className="button-group">
        <button onClick={handleSignEncrypt} disabled={loading || !authenticated || !plaintext.trim()}>
          {loading ? 'Signing...' : 'Sign + Encrypt'}
        </button>
        <button
          onClick={handleDecryptVerify}
          disabled={loading || !authenticated || !signedCiphertext.trim()}
        >
          {loading ? 'Verifying...' : 'Decrypt + Verify'}
        </button>
        <button onClick={handleClear} className="secondary">
          Clear
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {signedCiphertext && (
        <div className="result">
          <label>Signed Ciphertext (Base64):</label>
          <pre className="code">{signedCiphertext}</pre>
        </div>
      )}

      {verifyResult && (
        <div className={`result ${verifyResult.isValidSignature ? 'success' : 'warning'}`}>
          <div className="verification-status">
            <span className={`badge ${verifyResult.isValidSignature ? 'valid' : 'invalid'}`}>
              {verifyResult.isValidSignature ? '✓ Signature Valid' : '✗ Signature Invalid'}
            </span>
          </div>
          <label>Decrypted Message:</label>
          <pre className="code">{verifyResult.decryptedData}</pre>
          {verifyResult.signedBy && (
            <div className="meta">
              <span>Signed by: {verifyResult.signedBy}</span>
              {verifyResult.signedTimestamp && (
                <span>Timestamp: {new Date(verifyResult.signedTimestamp).toLocaleString()}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
