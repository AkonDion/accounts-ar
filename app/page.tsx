import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          AR Control Center
        </h1>
        <p className="text-muted-foreground mb-8">
          Accounts Receivable Management Dashboard
        </p>
        <Link
          href="/ar"
          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
        >
          Open AR Dashboard
        </Link>
      </div>
    </div>
  );
}
