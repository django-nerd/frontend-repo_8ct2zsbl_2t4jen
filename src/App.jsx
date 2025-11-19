import Workflow from './components/Workflow'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/flame-icon.svg" alt="Flames" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-semibold text-white">Noven Pro</h1>
              <p className="text-xs text-slate-400">Intelligentes Wareneingang-Workflow</p>
            </div>
          </div>
        </header>

        <Workflow />
      </div>
    </div>
  )
}

export default App