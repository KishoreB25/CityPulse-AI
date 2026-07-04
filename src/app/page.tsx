import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-cp-8 bg-cp-bg-base h-screen overflow-hidden">
      <div className="max-w-7xl w-full space-y-cp-8">
        
        {/* Terminal Header */}
        <header className="border border-cp-border-default bg-cp-bg-surface p-cp-6 shadow-cp-md">
          <div className="flex items-center justify-between border-b border-cp-border-subtle pb-cp-4 mb-cp-4">
            <div>
              <h1 className="text-cp-h1 font-mono uppercase text-cp-text-primary tracking-widest">
                CityPulse AI <span className="text-cp-accent-primary">::</span> Core Initialization
              </h1>
              <p className="text-cp-micro font-mono text-cp-text-secondary mt-1 uppercase">
                System Status: <span className="text-cp-risk-low">Online</span>
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-cp-3 py-cp-1 border border-cp-accent-primary text-cp-accent-primary text-cp-micro font-mono uppercase bg-cp-accent-primary/10 animate-pulse">
                v1.0.0-rc
              </span>
            </div>
          </div>
          <div className="space-y-2 text-cp-body font-mono text-cp-text-muted">
            <p> Booting Multi-Agent orchestrator...</p>
            <p> Loading environmental prediction models...</p>
            <p> Establishing CUDA GPU connections... <span className="text-cp-risk-low">SUCCESS</span></p>
            <p> LangGraph Checkpointers initialized.</p>
          </div>
        </header>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-cp-6">
          
          {/* Left Column: Project Explanation */}
          <section className="border border-cp-border-default bg-cp-bg-surface p-cp-6 flex flex-col justify-between">
            <div>
              <h2 className="text-cp-h2 font-mono uppercase text-cp-text-primary mb-cp-4 border-b border-cp-border-subtle pb-cp-2">
                Mission Parameters
              </h2>
              <div className="space-y-cp-4 text-cp-small font-sans text-cp-text-secondary leading-relaxed">
                <p>
                  <strong className="text-cp-text-primary font-mono uppercase">CityPulse AI</strong> is an autonomous, multi-agent intelligence platform designed to protect urban populations from environmental health risks.
                </p>
                <p>
                  Rather than just displaying data, the system utilizes a <strong>LangGraph orchestrator</strong> to command specialized AI agents. The <span className="text-cp-risk-medium font-mono uppercase">Ingestion Agent</span> continuously monitors air quality and weather. The <span className="text-cp-risk-medium font-mono uppercase">Triage Agent</span> processes citizen complaints to identify spatial hotspots. 
                </p>
                <p>
                  Our <span className="text-cp-risk-high font-mono uppercase">Forecast Agent</span> leverages a Python-based FastAPI backend to run GPU-accelerated simulations, predicting future risk. Finally, the <span className="text-cp-accent-primary font-mono uppercase">Decision & Reflection Agents</span> synthesize this data to propose actionable mitigation strategies—halting only for human authorization.
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: System Access & Architecture */}
          <div className="space-y-cp-6">
            
            {/* CTA Panel */}
            <section className="border border-cp-accent-primary bg-cp-bg-surface p-cp-6 shadow-[0_0_15px_rgba(45,212,191,0.1)]">
              <h2 className="text-cp-h2 font-mono uppercase text-cp-text-primary mb-cp-4">
                Command & Control
              </h2>
              <p className="text-cp-small text-cp-text-secondary mb-cp-6 font-mono">
                Access the Mission Control dashboard to view active agent logic, approve pending decisions, and run GPU-accelerated What-If simulations.
              </p>
              <div className="flex flex-col gap-cp-4">
                <Link 
                  href="/dashboard"
                  className="block w-full text-center py-cp-3 border border-cp-accent-primary bg-cp-accent-primary text-cp-bg-base font-mono font-bold uppercase transition-all hover:bg-cp-accent-primary-hover hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                >
                  Enter Mission Control
                </Link>
                <Link 
                  href="/api/orchestrator/run"
                  target="_blank"
                  className="block w-full text-center py-cp-3 border border-cp-border-strong bg-cp-bg-base text-cp-text-primary font-mono uppercase transition-all hover:border-cp-text-muted hover:bg-cp-bg-surface-raised"
                >
                  Trigger Pipeline API
                </Link>
              </div>
            </section>

            {/* Sub-system Status */}
            <section className="border border-cp-border-default bg-cp-bg-surface p-cp-6">
              <h2 className="text-cp-h2 font-mono uppercase text-cp-text-primary mb-cp-4 border-b border-cp-border-subtle pb-cp-2">
                Sub-Systems
              </h2>
              <ul className="space-y-cp-3 font-mono text-cp-micro uppercase">
                <li className="flex justify-between items-center">
                  <span className="text-cp-text-secondary">Next.js UI Frontend</span>
                  <span className="text-cp-risk-low bg-cp-risk-low-bg px-2 py-0.5 border border-cp-risk-low/20">Online</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-cp-text-secondary">LangGraph Core</span>
                  <span className="text-cp-risk-low bg-cp-risk-low-bg px-2 py-0.5 border border-cp-risk-low/20">Online</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-cp-text-secondary">SQLite / Drizzle DB</span>
                  <span className="text-cp-risk-low bg-cp-risk-low-bg px-2 py-0.5 border border-cp-risk-low/20">Synced</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-cp-text-secondary">FastAPI GPU Service</span>
                  <span className="text-cp-risk-high bg-cp-risk-high-bg px-2 py-0.5 border border-cp-risk-high/20">Active</span>
                </li>
              </ul>
            </section>
            
          </div>
        </div>

      </div>
    </main>
  );
}
