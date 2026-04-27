import { useState, useEffect } from 'react'
import familyData from '../data/familyData'
import ConfirmModal from '../components/ConfirmModal'
import { supabase } from '../lib/supabaseClient'

// ── Data helpers ──────────────────────────────────────────────────────────────

function getStoredMembers() {
  try {
    const saved = localStorage.getItem('family-members')
    if (saved) return JSON.parse(saved)
  } catch {}
  return familyData.map((m) => ({ id: m.id, name: m.name, role: m.role ?? '' }))
}

// Convert a flat Supabase row to the shape the UI expects
function toTemplate(row) {
  return {
    id:          row.id,
    title:       row.title,
    description: row.description || '',
  }
}

// Group a flat array of Supabase rows by their `type` field
function groupByType(rows) {
  const grouped = { daily: [], weekly: [], monthly: [] }
  rows.forEach((row) => {
    if (grouped[row.type]) {
      grouped[row.type].push(toTemplate(row))
    }
  })
  return grouped
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AddTemplateForm({ onSubmit, onCancel }) {
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit(title.trim(), description.trim())
    setTitle('')
    setDescription('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600 mb-2"
    >
      <input
        type="text"
        placeholder="Template title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all duration-200"
      />
      <input
        type="text"
        placeholder="Short description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all duration-200"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-1.5 rounded-lg cursor-pointer hover:bg-slate-700 dark:hover:bg-white hover:shadow-md transition-all duration-200"
        >
          Add Template
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function TemplateCard({ template, onUpdate, onDelete }) {
  const [isEditing, setIsEditing]     = useState(false)
  const [editTitle, setEditTitle]     = useState(template.title)
  const [editDesc, setEditDesc]       = useState(template.description)
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    if (!editTitle.trim()) return
    onUpdate({ ...template, title: editTitle.trim(), description: editDesc.trim() })
    setIsEditing(false)
  }

  function handleCancelEdit() {
    setEditTitle(template.title)
    setEditDesc(template.description)
    setIsEditing(false)
  }

  return (
    <>
      <div data-testid="template-card" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm">
        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all duration-200"
            />
            <input
              type="text"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Short description (optional)"
              className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all duration-200"
            />
            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                className="text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-1.5 rounded-lg cursor-pointer hover:bg-slate-700 dark:hover:bg-white hover:shadow-md transition-all duration-200"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {template.title}
              </p>
              {template.description && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  {template.description}
                </p>
              )}
            </div>
            <div className="flex gap-3 shrink-0 pt-0.5">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer"
              >
                Edit
              </button>
              <button
                data-testid="delete-template-button"
                onClick={() => setConfirmOpen(true)}
                className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all duration-200 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Delete Template"
          message={`Delete "${template.title}"? This cannot be undone.`}
          onConfirm={onDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  )
}

function TemplateSection({ label, templates, onAddTemplate, onUpdateTemplate, onDeleteTemplate }) {
  const [showForm, setShowForm] = useState(false)

  function handleSubmit(title, description) {
    onAddTemplate(title, description)
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {label}
        </h2>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {templates.length} {templates.length === 1 ? 'template' : 'templates'}
        </span>
        {!showForm && (
          <button
            data-testid="add-template-button"
            onClick={() => setShowForm(true)}
            className="text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
          >
            + Add
          </button>
        )}
      </div>

      {showForm && (
        <AddTemplateForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {templates.length === 0 && !showForm ? (
        <p className="text-xs text-slate-300 dark:text-slate-600 py-4 text-center">
          No {label.toLowerCase()} templates yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUpdate={onUpdateTemplate}
              onDelete={() => onDeleteTemplate(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

function TemplatesPage() {
  const members = getStoredMembers()

  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [templates, setTemplates]               = useState({ daily: [], weekly: [], monthly: [] })
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState(null)

  // Fetch templates from Supabase whenever the selected member changes
  useEffect(() => {
    if (!selectedMemberId) {
      setTemplates({ daily: [], weekly: [], monthly: [] })
      return
    }

    async function loadTemplates() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('member_id', selectedMemberId)
        .order('created_at', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setTemplates(groupByType(data))
      }
      setLoading(false)
    }

    loadTemplates()
  }, [selectedMemberId])

  async function addTemplate(periodType, title, description) {
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()

    const { data, error } = await supabase
      .from('task_templates')
      .insert({
        user_id:     session.user.id,
        member_id:   selectedMemberId,
        type:        periodType,
        title,
        description,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return
    }

    setTemplates((prev) => ({
      ...prev,
      [periodType]: [...prev[periodType], toTemplate(data)],
    }))
  }

  async function updateTemplate(periodType, updatedTemplate) {
    setError(null)
    const { error } = await supabase
      .from('task_templates')
      .update({ title: updatedTemplate.title, description: updatedTemplate.description })
      .eq('id', updatedTemplate.id)

    if (error) {
      setError(error.message)
      return
    }

    setTemplates((prev) => ({
      ...prev,
      [periodType]: prev[periodType].map((t) =>
        t.id === updatedTemplate.id ? updatedTemplate : t
      ),
    }))
  }

  async function deleteTemplate(periodType, templateId) {
    setError(null)
    const { error } = await supabase
      .from('task_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      setError(error.message)
      return
    }

    setTemplates((prev) => ({
      ...prev,
      [periodType]: prev[periodType].filter((t) => t.id !== templateId),
    }))
  }

  if (members.length === 0) {
    return (
      <main className="py-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Templates</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          No family members yet. Add someone on the{' '}
          <a href="/family" className="text-slate-600 dark:text-slate-300 underline underline-offset-2 hover:text-slate-900 dark:hover:text-slate-100">
            Family page
          </a>{' '}
          to get started.
        </p>
      </main>
    )
  }

  return (
    <main className="py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Templates</h1>

      {/* Member selector */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Member
        </p>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId((prev) => prev === m.id ? '' : m.id)}
              className={[
                'px-4 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer',
                selectedMemberId === m.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200',
              ].join(' ')}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {!selectedMemberId ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            Select a family member to view their templates.
          </p>
        </div>
      ) : loading ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading templates...</p>
      ) : (
        <div className="flex flex-col gap-8">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
          <TemplateSection
            label="Daily"
            templates={templates.daily}
            onAddTemplate={(title, desc) => addTemplate('daily', title, desc)}
            onUpdateTemplate={(t) => updateTemplate('daily', t)}
            onDeleteTemplate={(id) => deleteTemplate('daily', id)}
          />
          <TemplateSection
            label="Weekly"
            templates={templates.weekly}
            onAddTemplate={(title, desc) => addTemplate('weekly', title, desc)}
            onUpdateTemplate={(t) => updateTemplate('weekly', t)}
            onDeleteTemplate={(id) => deleteTemplate('weekly', id)}
          />
          <TemplateSection
            label="Monthly"
            templates={templates.monthly}
            onAddTemplate={(title, desc) => addTemplate('monthly', title, desc)}
            onUpdateTemplate={(t) => updateTemplate('monthly', t)}
            onDeleteTemplate={(id) => deleteTemplate('monthly', id)}
          />
        </div>
      )}
    </main>
  )
}

export default TemplatesPage
