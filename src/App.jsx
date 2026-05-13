import { useEffect, useMemo, useState } from 'react'
import './App.css'
const STORAGE_KEY = 'todo-crud-react.todos'

const getInitialTodos = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function App() {
  const [todos, setTodos] = useState(getInitialTodos)
  const [newTodoText, setNewTodoText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'completed') return todos.filter((todo) => todo.completed)
    return todos
  }, [todos, filter])

  const completedCount = todos.filter((todo) => todo.completed).length
  const activeCount = todos.length - completedCount

  const createTodo = (event) => {
    event.preventDefault()
    const trimmed = newTodoText.trim()
    if (!trimmed) return

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString()

    setTodos((prev) => [
      {
        id,
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ])
    setNewTodoText('')
  }

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const saveEdit = (id) => {
    const trimmed = editingText.trim()
    if (!trimmed) return

    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: trimmed } : todo)),
    )
    setEditingId(null)
    setEditingText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    if (editingId === id) {
      cancelEdit()
    }
  }

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
    if (editingId && todos.some((todo) => todo.id === editingId && todo.completed)) {
      cancelEdit()
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Todo CRUD App</h1>
        <p>Create, read, update, and delete your tasks.</p>
      </header>

      <form className="new-todo-form" onSubmit={createTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(event) => setNewTodoText(event.target.value)}
          placeholder="Add a new task..."
          aria-label="New todo"
        />
        <button type="submit">Add</button>
      </form>

      <section className="toolbar" aria-label="Todo controls">
        <div className="filters" role="tablist" aria-label="Filter todos">
          <button
            type="button"
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button
            type="button"
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>
        <button
          type="button"
          className="clear-completed"
          onClick={clearCompleted}
          disabled={completedCount === 0}
        >
          Clear completed
        </button>
      </section>

      <ul className="todo-list">
        {visibleTodos.length === 0 ? (
          <li className="empty-state">No todos in this view.</li>
        ) : (
          visibleTodos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`Mark ${todo.text} as ${todo.completed ? 'active' : 'completed'}`}
              />

              {editingId === todo.id ? (
                <form
                  className="edit-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveEdit(todo.id)
                  }}
                >
                  <input
                    type="text"
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    autoFocus
                    aria-label="Edit todo"
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span className="todo-text">{todo.text}</span>
                  <div className="item-actions">
                    <button type="button" onClick={() => startEditing(todo)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteTodo(todo.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </main>
  )
}

export default App
