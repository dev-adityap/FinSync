import React from 'react'
import { Link } from 'react-router-dom'
import { GlassCard, GlassPanel } from '../components/ui/GlassComponents'
import { ArrowRight } from 'lucide-react'

export function PrivacyPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <nav className="mb-8">
          <Link to="/" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to homepage
          </Link>
        </nav>

        <GlassPanel padding="lg">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-text-secondary"><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">1. Local-First Architecture</h2>
            <p className="text-text-secondary">
              FinSync is designed as a local-first application. When you use FinSync without creating an account, all your workspace data — including projects, reconciliation sessions, uploaded file metadata, and results — is stored locally in your browser using IndexedDB.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">2. Data Storage</h2>
            <ul className="list-disc list-inside text-text-secondary space-y-3">
              <li><strong>Browser storage:</strong> Your workspace data persists in your browser's IndexedDB database. It is not transmitted to any server.</li>
              <li><strong>Backend processing:</strong> CSV files uploaded for reconciliation are processed in-memory by the backend and are not permanently stored. Temporary files are cleaned up after processing.</li>
              <li><strong>No cloud sync:</strong> Data does not synchronize across browsers or devices. If you clear your browser data or use a different browser, your workspace will not be available.</li>
            </ul>

            <h2 className="text-xl font-semibold text-text-primary mb-2">3. No Authentication</h2>
            <p className="text-text-secondary">
              FinSync does not require account creation, login, or authentication for core functionality. There are no user accounts, no password storage, and no identity management. The login and registration pages are UI placeholders for future functionality.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">4. Data We Do Not Collect</h2>
            <ul className="list-disc list-inside text-text-secondary space-y-3">
              <li>We do not collect personal identifiers.</li>
              <li>We do not track usage analytics.</li>
              <li>We do not store your financial data on servers.</li>
              <li>We do not share data with third parties.</li>
            </ul>

            <h2 className="text-xl font-semibold text-text-primary mb-2">5. Data Deletion</h2>
            <p className="text-text-secondary">
              You can delete your workspace data at any time through Settings &gt; Local Data Management &gt; Clear All Data. This permanently removes all projects, sessions, and results from your browser's IndexedDB.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">6. Limitations</h2>
            <p className="text-text-secondary">
              FinSync is not currently suitable for confidential enterprise financial data or regulated datasets. The local-first anonymous workspace mode does not provide enterprise-grade access controls, encryption at rest, or audit logging.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">7. Contact</h2>
            <p className="text-text-secondary">
              For questions about this privacy policy, contact us through the placeholder contact information on our website. No physical address or email is published.
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}