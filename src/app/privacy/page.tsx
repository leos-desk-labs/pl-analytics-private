export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      <div className="text-gray-300 space-y-4">
        <p>
          Peoples League Analytics is an internal analytics dashboard that aggregates
          publicly available social media metrics from platforms including TikTok,
          Instagram, and YouTube.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">Data Collection</h2>
        <p>
          This application collects analytics data from connected social media accounts
          that have authorized access. We only access data that account owners have
          explicitly permitted through platform OAuth flows.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">Data Usage</h2>
        <p>
          Collected data is used solely for internal analytics and reporting purposes
          within Peoples League. We do not sell or share data with third parties.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">Contact</h2>
        <p>
          For privacy-related inquiries, please contact the Peoples League team.
        </p>
        <p className="text-gray-500 text-sm mt-8">
          Last updated: January 2025
        </p>
      </div>
    </div>
  );
}
