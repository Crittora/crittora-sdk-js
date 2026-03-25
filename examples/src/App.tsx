import { useState } from 'react'
import EncryptDecrypt from './components/EncryptDecrypt'
import SignEncryptVerify from './components/SignEncryptVerify'
import AuthDemo from './components/AuthDemo'

type Tab = 'encrypt' | 'sign' | 'auth'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('encrypt')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'encrypt', label: 'Basic Encryption' },
    { id: 'sign', label: 'Sign & Verify' },
    { id: 'auth', label: 'Authentication' },
  ]

  return (
    <div className="app">
      <header className="header">
        <h1>Crittora SDK JS - React Example</h1>
        <p>Secure messaging and encryption demo</p>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'encrypt' && <EncryptDecrypt />}
        {activeTab === 'sign' && <SignEncryptVerify />}
        {activeTab === 'auth' && <AuthDemo />}
      </main>
    </div>
  )
}

export default App
