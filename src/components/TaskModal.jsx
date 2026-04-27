import { useState } from 'react'
import ConfirmModal from './ConfirmModal'

function TaskModal({ task, onClose, onUpdateTask, onDeleteTask }) {
  const [commentInput, setCommentInput]   = useState('')
  const [isEditing, setIsEditing]         = useState(false)
  const [editTitle, setEditTitle]         = useState(task.title)
  const [editDesc, setEditDesc]           = useState(task.description)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  // Local comments state so the list updates immediately without waiting for
  // the Supabase roundtrip. onUpdateTask persists the change in the background.
  const [comments, setComments]           = useState(task.comments ?? [])

  function handleAddComment(e) {
    e.preventDefault()
    if (!commentInput.trim()) return
    const newComment = commentInput.trim()
    const updatedComments = [...comments, newComment]
    setComments(updatedComments)                             // immediate UI update
    onUpdateTask({ ...task, comments: updatedComments })     // persist to Supabase
    setCommentInput('')
  }

  function handleSaveEdit(e) {
    e.preventDefault()
    if (!editTitle.trim()) return
    onUpdateTask({ ...task, title: editTitle.trim(), description: editDesc.trim(), comments })
    setIsEditing(false)
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
                <input
                  className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all duration-200"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title"
                  autoFocus
                />
                <textarea
                  className="text-sm text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 resize-none leading-relaxed transition-all duration-200"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="text-sm font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 data-testid="task-title" className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">{task.title}</h3>
                  <div className="flex gap-3 shrink-0 pt-0.5">
                    <button
                      data-testid="task-edit-button"
                      className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                    <button
                      data-testid="task-delete-button"
                      className="text-xs text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all duration-200 cursor-pointer"
                      onClick={() => setIsConfirmOpen(true)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {task.description && (
                  <p data-testid="task-description" className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{task.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Comments{comments.length > 0 && ` · ${comments.length}`}
            </h4>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-300 dark:text-slate-600 mb-4">No comments yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 mb-4 list-none p-0">
                {comments.map((comment, index) => (
                  <li
                    key={index}
                    className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2 leading-relaxed"
                  >
                    {comment}
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                data-testid="comment-input"
                className="flex-1 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all duration-200"
                type="text"
                placeholder="Write a comment…"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <button
                type="submit"
                data-testid="add-comment-button"
                className="text-sm font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer shrink-0"
              >
                Add
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700">
            <button
              className="text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {isConfirmOpen && (
        <ConfirmModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This cannot be undone."
          onConfirm={onDeleteTask}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  )
}

export default TaskModal
