import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || ''

function Section({ title, children }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <h2 className="text-white font-semibold mb-3">{title}</h2>
      {children}
    </div>
  )
}

export default function Workflow() {
  const [supplier, setSupplier] = useState('')
  const [reference, setReference] = useState('')
  const [deliveries, setDeliveries] = useState([])
  const [active, setActive] = useState(null)
  const [items, setItems] = useState([])

  async function refreshExpected() {
    const res = await fetch(`${API}/deliveries?status.in=PENDING&status.in=DRAFT`)
    const data = await res.json()
    setDeliveries(data)
  }

  async function createDelivery() {
    const res = await fetch(`${API}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplier, reference })
    })
    const d = await res.json()
    setSupplier(''); setReference('')
    setActive(d)
    refreshExpected()
  }

  async function openDelivery(d) {
    const res = await fetch(`${API}/deliveries/${d.id}`)
    const data = await res.json()
    setActive(data.delivery)
    setItems(data.items)
  }

  async function addItem(expectedQty) {
    if (!active) return
    const res = await fetch(`${API}/deliveries/${active.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedQty: Number(expectedQty) })
    })
    const it = await res.json()
    setItems([it, ...items])
  }

  async function receive(itemId, qty) {
    const res = await fetch(`${API}/deliveries/${active.id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ itemId, qty: Number(qty) }] })
    })
    const d = await res.json()
    setActive(d)
    openDelivery(d)
  }

  async function sendToQuality() {
    if (!active) return
    const res = await fetch(`${API}/deliveries/${active.id}/send-to-quality`, { method: 'POST' })
    const d = await res.json()
    setActive(d)
    refreshExpected()
  }

  useEffect(() => {
    refreshExpected()
  }, [])

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Section title="Neue Bestellung erfassen">
        <div className="flex gap-2">
          <input className="flex-1 bg-slate-900 text-white rounded px-3 py-2 border border-slate-700" placeholder="Lieferant" value={supplier} onChange={e=>setSupplier(e.target.value)} />
          <input className="flex-1 bg-slate-900 text-white rounded px-3 py-2 border border-slate-700" placeholder="Referenz" value={reference} onChange={e=>setReference(e.target.value)} />
          <button onClick={createDelivery} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded">Erfassen</button>
        </div>
      </Section>

      <Section title="Erwartet (PENDING/DRAFT)">
        <div className="space-y-2 max-h-80 overflow-auto">
          {deliveries.map(d => (
            <div key={d.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded px-3 py-2">
              <div>
                <div className="text-white text-sm font-medium">{d.reference || 'Ohne Referenz'}</div>
                <div className="text-xs text-slate-400">Status: {d.status} • Empfangen: {d.receivedQty}</div>
              </div>
              <button onClick={() => openDelivery(d)} className="text-blue-400 hover:underline">Öffnen</button>
            </div>
          ))}
          {deliveries.length === 0 && <div className="text-slate-400 text-sm">Keine erwarteten Lieferungen</div>}
        </div>
      </Section>

      <Section title="Empfang / Positionen">
        {!active && <div className="text-slate-400 text-sm">Keine Lieferung ausgewählt</div>}
        {active && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-white">{active.reference || 'Ohne Referenz'}</div>
              <div className="text-slate-400 text-sm">Status: {active.status} • Empfangen: {active.receivedQty}</div>
            </div>
            <div className="flex gap-2">
              <input id="qty" type="number" min="0" className="bg-slate-900 text-white rounded px-3 py-2 border border-slate-700" placeholder="Menge (neu)" />
              <button onClick={() => addItem(document.getElementById('qty').value)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded">Position hinzufügen</button>
              <button onClick={sendToQuality} className="ml-auto bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded">In Prüfung schicken</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-auto">
              {items.map(i => (
                <div key={i.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded px-3 py-2">
                  <div>
                    <div className="text-white text-sm">Erwartet: {i.expectedQty} • Empfangen: {i.receivedQty}</div>
                    <div className="text-xs text-slate-400">Status: {i.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" defaultValue={0} className="w-24 bg-slate-900 text-white rounded px-2 py-1 border border-slate-700" id={`r-${i.id}`} />
                    <button onClick={() => receive(i.id, document.getElementById(`r-${i.id}`).value)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Buchen</button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="text-slate-400 text-sm">Keine Positionen</div>}
            </div>
          </div>
        )}
      </Section>

      <Section title="Nächste Schritte">
        <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
          <li>Qualitätsprüfung durchführen (IN_QUALITY_CHECK)</li>
          <li>Einlagerung mit Lagerplatz-Zuweisung</li>
          <li>Abschluss</li>
        </ul>
      </Section>
    </div>
  )
}
