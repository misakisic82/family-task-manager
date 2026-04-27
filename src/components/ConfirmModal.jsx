function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{message}</p>

        <div className="flex gap-2 justify-end">
          <button
            className="text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="text-sm font-semibold bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
