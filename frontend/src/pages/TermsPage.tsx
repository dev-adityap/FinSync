import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel } from '../components/ui/GlassComponents'

export function TermsPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <nav className="mb-8">
          <Link to="/" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to homepage
          </Link>
        </nav>

        <GlassPanel padding="lg">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">Terms of Service</h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-text-secondary"><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">1. Acceptance of Terms</h2>
            <p className="text-text-secondary">
              By accessing and using FinSync, you accept these terms and agree to be bound by them. If you do not agree, please discontinue use.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">2. Use of the Service</h2>
            <p className="text-text-secondary">
              FinSync is provided as-is for data integration and migration validation. You may use the service to upload, process, and reconcile CSV files. You are responsible for the data you upload and the results you generate.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">3. No Warranty</h2>
            <p className="text-text-secondary">
              FinSync is provided "as is" without warranty of any kind. We do not guarantee the accuracy of reconciliation results, the availability of the service, or the suitability of the service for any particular purpose.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">4. Data Responsibility</h2>
            <p className="text-text-secondary">
              You retain ownership of all data you upload. FinSync does not claim ownership of your data. You are responsible for backing up your workspace data. We are not responsible for data loss due to browser storage clearing, device failure, or other causes.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">5. Prohibited Use</h2>
            <ul className="list-disc list-inside text-text-secondary space-y-3">
              <li>Do not attempt to reverse engineer or exploit the backend API.</li>
              <li>Do not upload data you do not have rights to process.</li>
              <li>Do not attempt to circumvent rate limits or processing restrictions.</li>
            </ul>

            <h2 className="text-xl font-semibold text-text-primary mb-2">6. Limitation of Liability</h2>
            <p className="text-text-secondary">
              FinSync and its providers are not liable for any indirect, incidental, or consequential damages arising from your use of the service, including data loss, business interruption, or financial loss.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">7. Changes to Terms</h2>
            <p className="text-text-secondary">
              We may update these terms at any time. Continued use of FinSync after changes constitutes acceptance of the revised terms.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mb-2">8. Contact</h2>
            <p className="text-text-secondary">
              For questions about these terms, contact us through our website. No physical address or email is published.
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}