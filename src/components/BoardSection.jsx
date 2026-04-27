import { useState } from 'react'
import { DndContext, useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'

const columns = [
  {
    id:         'todo',
    label:      'To Do',
    topBorder:  'border-t-2 border-t-slate-300',
    labelColor: 'text-slate-500 dark:text-slate-400',
    badgeBg:    'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  },
  {
    id:         'inprogress',
    label:      'In Progress',
    topBorder:  'border-t-2 border-t-amber-400',
    labelColor: 'text-amber-600 dark:text-amber-400',
    badgeBg:    'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    id:         'done',
    label:      'Done',
    topBorder:  'border-t-2 border-t-emerald-400',
    labelColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg:    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
]

function AddTaskForm({ onSubmit, onCancel }) {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600">
      <input
        className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all duration-200"
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <input
        className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all duration-200"
        type="text"
        placeholder="Short description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-1.5 rounded-lg cursor-pointer hover:bg-slate-700 dark:hover:bg-white hover:shadow-md transition-all duration-200"
        >
          Add Task
        </button>
        <button
          type="button"
          className="text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function Column({ label, columnId, topBorder, labelColor, badgeBg, tasks, onUpdateTask, onDeleteTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <div
      ref={setNodeRef}
      data-testid={`column-${columnId}`}
      className={[
        'rounded-xl flex flex-col transition-all min-h-[8rem]',
        topBorder,
        isOver
          ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-inset ring-emerald-200 dark:ring-emerald-800'
          : 'bg-slate-50 dark:bg-slate-700/40',
      ].join(' ')}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h4 className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>{label}</h4>
        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 tabular-nums ${badgeBg}`}>
          {tasks.length}
        </span>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-slate-200 dark:border-slate-600 mb-3" />

      {/* Task list */}
      <div className="flex flex-col gap-2.5 px-3 pb-3">
        {tasks.length === 0
          ? <p className="text-xs text-slate-300 dark:text-slate-600 text-center py-5">No tasks yet</p>
          : tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
              />
            ))
        }
      </div>
    </div>
  )
}

function BoardSection({ title, boardId, boardData, onAddTask, onUpdateTask, onMoveTask, onDeleteTask }) {
  const [showForm, setShowForm] = useState(false)

  function handleSubmit(taskTitle, description) {
    onAddTask(boardId, taskTitle, description)
    setShowForm(false)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onMoveTask(active.id, over.id)
  }

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors duration-200">
      <div className={`flex items-center mb-4 ${title ? 'justify-between' : 'justify-end'}`}>
        {title && <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>}
        {!showForm && (
          <button
            data-testid="add-task-button"
            className="text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            onClick={() => setShowForm(true)}
          >
            + Add Task
          </button>
        )}
      </div>

      {showForm && (
        <AddTaskForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {boardData.length === 0 ? (
        <p className="text-sm text-slate-300 dark:text-slate-600 text-center py-10">
          No tasks for this period — click + Add Task to get started.
        </p>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {columns.map((col) => (
              <Column
                key={col.id}
                label={col.label}
                columnId={col.id}
                topBorder={col.topBorder}
                labelColor={col.labelColor}
                badgeBg={col.badgeBg}
                tasks={boardData.filter((t) => t.status === col.id)}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </DndContext>
      )}
    </section>
  )
}

export default BoardSection
