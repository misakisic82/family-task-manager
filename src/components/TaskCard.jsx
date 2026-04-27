import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import TaskModal from './TaskModal'
import { isMissed } from '../utils/periodKey'

function GripIcon() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
      <circle cx="3" cy="3"  r="1.3" />
      <circle cx="7" cy="3"  r="1.3" />
      <circle cx="3" cy="8"  r="1.3" />
      <circle cx="7" cy="8"  r="1.3" />
      <circle cx="3" cy="13" r="1.3" />
      <circle cx="7" cy="13" r="1.3" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 7.5a1 1 0 0 1-1 1H3.5l-2 2V2.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5Z" />
    </svg>
  )
}

function TaskCard({ task, onUpdateTask, onDeleteTask }) {
  const [isOpen, setIsOpen] = useState(false)

  const missed = isMissed(task)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        data-testid="task-card"
        style={dragStyle}
        className={[
          'rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden group cursor-pointer',
          missed
            ? 'bg-red-50/60 dark:bg-slate-800 border border-red-200 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-800'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
        ].join(' ')}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-stretch">
          {/* Drag handle */}
          <div
            className="flex items-center justify-center w-8 shrink-0 text-slate-200 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-grab active:cursor-grabbing border-r border-slate-100 dark:border-slate-700 transition-colors"
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
          >
            <GripIcon />
          </div>

          {/* Content */}
          <div className="px-3 py-3 flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug truncate">
              {task.title}
            </p>

            {task.description && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed line-clamp-2">
                {task.description}
              </p>
            )}

            {(task.isGenerated || missed) && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {task.isGenerated && (
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                    Template
                  </span>
                )}
                {missed && (
                  <span className="text-[10px] font-medium tracking-wide text-red-400 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                    Missed
                  </span>
                )}
              </div>
            )}

            {(task.comments ?? []).length > 0 && (
              <div className="flex items-center gap-1 mt-2 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 transition-colors">
                <CommentIcon />
                <span className="text-xs tabular-nums">
                  {task.comments.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <TaskModal
          task={task}
          onClose={() => setIsOpen(false)}
          onUpdateTask={onUpdateTask}
          onDeleteTask={() => {
            onDeleteTask(task.id)
            setIsOpen(false)
          }}
        />
      )}
    </>
  )
}

export default TaskCard
