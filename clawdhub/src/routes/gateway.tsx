import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/gateway')({
  component: GatewayRoute,
})

function GatewayRoute() {
  return (
    <main className="section">
      <div className="hero">
        <div className="hero-copy">
          <span className="hero-badge">solanaclawd.com / gateway</span>
          <h1 className="hero-title">OpenClawd Gateway</h1>
          <p className="hero-subtitle">
            The OpenClawd gateway bridges Seeker, terminal, and operator surfaces to the OpenClawd runtime.
          </p>
          <div className="hero-actions">
            <Link to="/setup/gateway" className="btn btn-primary">
              Install Gateway
            </Link>
            <Link to="/hub" className="btn">
              Browse Hub
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
