import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ConfirmModal from '../components/ConfirmModal'
import MemberAvatar, { MEMBER_COLORS } from '../components/MemberAvatar'

// Map a Supabase row (snake_case) to the member shape the rest of the app expects
function toMember(row) {
  return {
    id:                row.id,
    name:              row.name,
    role:              row.role || '',
    color:             row.color,
    trackingStartDate: row.tracking_start_date,
  }
}

// Keep localStorage in sync so other pages (MemberPage, StatsPage, etc.) still work
function syncMembers(members) {
  localStorage.setItem('family-members', JSON.stringify(members))
}

function MemberFormModal({ title, subtitle, initialName, initialRole, initialColor, submitLabel, onSubmit, onClose }) {
  const [name,  setName]  = useState(initialName)
  const [role,  setRole]  = useState(initialRole)
  const [color, setColor] = useState(initialColor)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), role.trim(), color)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Name</label>
            <input
              className="w-full text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-colors"
              placeholder="e.g. Grandma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
              Role <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            </label>
            <input
              className="w-full text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-colors"
              placeholder="e.g. Grandmother"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
              Avatar color
            </label>
            <div className="flex gap-2 flex-wrap">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full cursor-pointer transition-all ${c} ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-slate-700 dark:ring-offset-slate-800 scale-110'
                      : 'hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-slate-300 dark:hover:ring-slate-600'
                  }`}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="text-sm font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              {submitLabel}
            </button>
            <button
              type="button"
              className="text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FamilyPage() {
  const navigate = useNavigate()
  const [members, setMembers]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [showAddModal, setShowAddModal]   = useState(false)
  const [pendingEdit, setPendingEdit]     = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    async function loadMembers() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        const mapped = data.map(toMember)
        setMembers(mapped)
        syncMembers(mapped)
      }
      setLoading(false)
    }

    loadMembers()
  }, [])

  async function handleAddMember(name, role, color) {
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    const trackingStartDate = new Date().toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from('family_members')
      .insert({
        user_id:              session.user.id,
        name,
        role,
        color,
        tracking_start_date: trackingStartDate,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return
    }

    const newMember = toMember(data)
    localStorage.setItem(`family-boards-${newMember.id}`, JSON.stringify({ daily: [], weekly: [], monthly: [] }))

    const updated = [...members, newMember]
    setMembers(updated)
    syncMembers(updated)
    setShowAddModal(false)
  }

  async function handleEditSave(name, role, color) {
    setError(null)
    const { error } = await supabase
      .from('family_members')
      .update({ name, role, color })
      .eq('id', pendingEdit.id)

    if (error) {
      setError(error.message)
      return
    }

    const updated = members.map((m) =>
      m.id === pendingEdit.id ? { ...m, name, role, color } : m
    )
    setMembers(updated)
    syncMembers(updated)
    setPendingEdit(null)
  }

  async function handleDeleteConfirm() {
    setError(null)
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', pendingDelete.id)

    if (error) {
      setError(error.message)
      return
    }

    localStorage.removeItem(`family-boards-${pendingDelete.id}`)
    const updated = members.filter((m) => m.id !== pendingDelete.id)
    setMembers(updated)
    syncMembers(updated)
    setPendingDelete(null)
  }

  if (loading) {
    return (
      <main className="py-10">
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading members...</p>
      </main>
    )
  }

  return (
    <main className="py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Family Members</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a member to view their tasks.</p>
        </div>
        <button
          data-testid="add-member-button"
          className="text-sm font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => setShowAddModal(true)}
        >
          + Add Member
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 mb-6">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            data-testid="member-card"
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => navigate(`/family/${member.id}`)}
          >
            <div className="flex flex-col items-center pt-9 pb-6 px-4 text-center">
              <MemberAvatar member={member} size="xl" />
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 leading-snug">{member.name}</p>
              {member.role
                ? <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{member.role}</p>
                : <p className="text-xs text-transparent mt-1 select-none">·</p>
              }
            </div>

            <div className="flex border-t border-slate-100 dark:border-slate-700">
              <button
                data-testid="edit-member-button"
                className="flex-1 py-3 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-bl-xl"
                onClick={(e) => { e.stopPropagation(); setPendingEdit(member) }}
              >
                Edit
              </button>
              <div className="w-px bg-slate-100 dark:bg-slate-700" />
              <button
                data-testid="delete-member-button"
                className="flex-1 py-3 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer rounded-br-xl"
                onClick={(e) => { e.stopPropagation(); setPendingDelete(member) }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <MemberFormModal
          title="Add Family Member"
          subtitle="New members start with empty task boards."
          initialName=""
          initialRole=""
          initialColor={MEMBER_COLORS[members.length % MEMBER_COLORS.length]}
          submitLabel="Add Member"
          onSubmit={handleAddMember}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {pendingEdit && (
        <MemberFormModal
          title="Edit Family Member"
          subtitle="Update the name, role, or color for this member."
          initialName={pendingEdit.name}
          initialRole={pendingEdit.role}
          initialColor={pendingEdit.color || MEMBER_COLORS[0]}
          submitLabel="Save Changes"
          onSubmit={handleEditSave}
          onClose={() => setPendingEdit(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete Family Member"
          message={`Are you sure you want to delete ${pendingDelete.name}? All their tasks will be permanently removed.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </main>
  )
}

export default FamilyPage
