import React, { useState } from 'react';

const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 mb-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition duration-150">
      <div className="flex items-center gap-3 flex-1 mr-2">
        {/* Checkbox for Complete/Uncomplete */}
        <input
          type="checkbox"
          checked={todo.is_completed}
          onChange={() => onToggle(todo.id)}
          className="w-5 h-5 text-slate-800 rounded focus:ring-slate-800 cursor-pointer"
        />

        {/* Editing Mode or Text Display */}
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-800"
            autoFocus
          />
        ) : (
          <span
            className={`flex-1 text-slate-800 ${
              todo.is_completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {todo.title}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded hover:bg-emerald-700 transition"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded hover:bg-slate-300 transition"
          >
            Edit
          </button>
        )}

        <button
          onClick={() => onDelete(todo.id)}
          className="text-xs bg-rose-600 text-white px-2.5 py-1.5 rounded hover:bg-rose-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TodoItem;