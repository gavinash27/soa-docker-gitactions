import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { busPassApi, getErrorMessage } from './api.js'

const EMPTY_PASS = { passNumber: '', holderName: '', validUntil: '', fee: '' }

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    bus: <><rect x="3" y="3" width="18" height="15" rx="3"/><path d="M3 11h18M7 18v3m10-3v3M7 7h.01M17 7h.01M7 14h.01M17 14h.01"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    edit: <><path d="m15 5 4 4M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z"/></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.7-2L20 12M4 12l2.7 5a7 7 0 0 0 11.7-2"/></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed)
}

function PassForm({ initialValue, onClose, onSave, saving, error }) {
  const [form, setForm] = useState(initialValue || EMPTY_PASS)
  const editing = Boolean(initialValue?.id)
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = (event) => {
    event.preventDefault()
    onSave({ passNumber: form.passNumber.trim(), holderName: form.holderName.trim(), validUntil: form.validUntil, fee: Number(form.fee) })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-top"><div><p className="eyebrow">Pass details</p><h2 id="form-title">{editing ? 'Edit bus pass' : 'Issue a bus pass'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close form"><Icon name="close" /></button></div>
        <p className="form-description">{editing ? `Updating pass #${initialValue.id}.` : 'Add a new travel pass to your records.'}</p>
        <form className="pass-form" onSubmit={submit}>
          <label>Pass number<input name="passNumber" value={form.passNumber} onChange={change} placeholder="e.g. BP-2026-014" maxLength="100" required /></label>
          <label>Holder name<input name="holderName" value={form.holderName} onChange={change} placeholder="Full name" maxLength="100" required /></label>
          <div className="field-row"><label>Valid until<input name="validUntil" type="date" value={form.validUntil} onChange={change} required /></label><label>Fee (₹)<input name="fee" type="number" min="0" step="0.01" value={form.fee} onChange={change} placeholder="0.00" required /></label></div>
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <div className="form-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create pass'}</button></div>
        </form>
      </section>
    </div>
  )
}

function Dashboard() {
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [query, setQuery] = useState('')
  const [lookupId, setLookupId] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const loadPasses = useCallback(async () => {
    setLoading(true)
    setPageError('')
    try {
      const response = await busPassApi.list()
      setPasses(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadPasses() }, [loadPasses])
  const visiblePasses = useMemo(() => passes.filter((pass) => [pass.passNumber, pass.holderName, pass.id].some((value) => String(value ?? '').toLowerCase().includes(query.toLowerCase()))), [passes, query])
  const totalFees = passes.reduce((sum, pass) => sum + (Number(pass.fee) || 0), 0)

  async function savePass(data) {
    setSaving(true); setFormError('')
    try {
      if (modal?.id) await busPassApi.update(modal.id, data)
      else await busPassApi.create(data)
      setModal(null); setNotice(modal?.id ? 'Bus pass updated.' : 'Bus pass created.')
      await loadPasses()
    } catch (error) { setFormError(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  async function findPass(event) {
    event.preventDefault()
    const id = lookupId.trim()
    if (!id) { await loadPasses(); return }
    setLoading(true); setPageError(''); setNotice('')
    try {
      const response = await busPassApi.find(id)
      setPasses(response.data ? [response.data] : [])
      if (!response.data) setPageError(`No bus pass found with ID ${id}.`)
    } catch (error) { setPasses([]); setPageError(getErrorMessage(error)) }
    finally { setLoading(false) }
  }

  async function deletePass(pass) {
    if (!window.confirm(`Delete bus pass ${pass.passNumber} for ${pass.holderName}? This cannot be undone.`)) return
    setPageError(''); setNotice('')
    try {
      const response = await busPassApi.remove(pass.id)
      setNotice(typeof response.data === 'string' ? response.data : 'Bus pass deleted.')
      if (lookupId.trim() === String(pass.id)) setLookupId('')
      await loadPasses()
    } catch (error) { setPageError(getErrorMessage(error)) }
  }

  function openForm(pass = null) { setFormError(''); setModal(pass || {}); }

  return (
    <>
      <header className="navbar"><NavLink className="brand" to="/"><span className="brand-mark"><Icon name="bus" size={20} /></span><span>Pass<span className="brand-accent">Desk</span></span></NavLink><nav aria-label="Main navigation"><NavLink to="/">Overview</NavLink><a href="#passes">Bus passes</a></nav><div className="service-status"><span className={`status-dot ${pageError ? 'status-down' : ''}`} />{pageError ? 'Service issue' : 'CrudService'}</div></header>
      <main className="page-content">
        <section className="welcome-row"><div><p className="eyebrow">Bus pass management</p><h1>Your passes, in one place.</h1><p className="intro">Create, find and manage bus passes from your CrudService.</p></div><button className="button button-primary create-button" onClick={() => openForm()}><Icon name="plus" size={17} /> New bus pass</button></section>
        <section className="stats-grid" aria-label="Pass summary"><article className="stat-card"><span className="stat-icon"><Icon name="card" /></span><div><span className="stat-label">Total passes</span><strong>{loading ? '—' : passes.length}</strong><span className="stat-note">Currently on record</span></div></article><article className="stat-card"><span className="stat-icon stat-icon-warm"><Icon name="calendar" /></span><div><span className="stat-label">Fees on record</span><strong>{loading ? '—' : money(totalFees)}</strong><span className="stat-note">Combined pass fees</span></div></article><article className="stat-card stat-card-accent"><div className="accent-copy"><span className="stat-label">Manage your records</span><strong>Keep every journey moving.</strong><span className="stat-note">Create or update a pass in a few clicks.</span></div><span className="accent-arrow"><Icon name="arrow" size={21} /></span></article></section>
        <section className="table-card" id="passes"><div className="table-heading"><div><p className="eyebrow">Pass directory</p><h2>All bus passes</h2></div><button className="refresh-button" onClick={() => { setLookupId(''); setQuery(''); loadPasses() }}><Icon name="refresh" size={16} /> Refresh</button></div>
          <div className="toolbar"><form className="lookup-form" onSubmit={findPass}><label className="search-box"><Icon name="search" size={17} /><input aria-label="Find pass by ID" type="number" min="1" value={lookupId} onChange={(event) => setLookupId(event.target.value)} placeholder="Find by pass ID" /></label><button className="button button-secondary lookup-button" type="submit">Find ID</button></form><label className="search-box filter-box"><Icon name="search" size={17} /><input aria-label="Search passes" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search passes…" /></label></div>
          {notice && <p className="alert alert-success" role="status">{notice}<button className="alert-close" onClick={() => setNotice('')} aria-label="Dismiss">×</button></p>}
          {pageError && <div className="alert alert-error" role="alert"><span>{pageError}</span><button className="button button-secondary retry-button" onClick={loadPasses}>Try again</button></div>}
          <div className="table-scroll"><table><thead><tr><th>PASS</th><th>HOLDER</th><th>VALID UNTIL</th><th>FEE</th><th className="actions-heading">ACTIONS</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="5" className="empty-state"><span className="spinner" />Loading bus passes…</td></tr> : visiblePasses.length === 0 ? <tr><td colSpan="5" className="empty-state"><span className="empty-icon"><Icon name="bus" size={24} /></span><strong>{query ? 'No matching passes' : lookupId ? 'No pass found' : 'No bus passes yet'}</strong><span>{query ? 'Try a different name, number or ID.' : 'Create your first pass to see it here.'}</span>{!query && <button className="button button-primary empty-cta" onClick={() => openForm()}>Create a pass</button>}</td></tr> : visiblePasses.map((pass) => <tr key={pass.id}><td><div className="pass-cell"><span className="pass-avatar"><Icon name="card" size={17} /></span><span><strong>{pass.passNumber}</strong><small>ID #{pass.id}</small></span></div></td><td className="holder-cell">{pass.holderName}</td><td><span className="date-cell"><Icon name="calendar" size={15} />{formatDate(pass.validUntil)}</span></td><td className="fee-cell">{money(pass.fee)}</td><td><div className="row-actions"><button className="action-button edit-action" onClick={() => openForm(pass)} aria-label={`Edit ${pass.passNumber}`} title="Edit pass"><Icon name="edit" size={16} /></button><button className="action-button delete-action" onClick={() => deletePass(pass)} aria-label={`Delete ${pass.passNumber}`} title="Delete pass"><Icon name="trash" size={16} /></button></div></td></tr>)}
          </tbody></table></div><div className="table-footer"><span>{loading ? 'Loading records…' : `Showing ${visiblePasses.length} of ${passes.length} ${passes.length === 1 ? 'pass' : 'passes'}`}</span><span>Connected to <strong>CrudService · 8081</strong></span></div>
        </section><footer className="page-footer"><span>PassDesk</span><span>Simple tools for smooth journeys.</span></footer>
      </main>
      {modal !== null && <PassForm key={modal.id || 'new'} initialValue={modal.id ? modal : null} onClose={() => setModal(null)} onSave={savePass} saving={saving} error={formError} />}
    </>
  )
}

function App() {
  return <Routes><Route path="*" element={<Dashboard />} /></Routes>
}

export default App
