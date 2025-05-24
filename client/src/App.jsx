import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";


export default function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [quote, setQuote] = useState(null);
  const [newDeadline, setNewDeadline] = useState("");


  const API_BASE = "http://localhost:5000/api"; 

    // === USER PREFS ===
  const [prefs, setPrefs] = useState(() => {
    const stored = localStorage.getItem("preferences");
    return stored
      ? JSON.parse(stored)
      : { theme: "light", autoComplete: false, enableDeadlines: true };
  });


    // === EFFECT: THEME ===
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", prefs.theme);
    localStorage.setItem("preferences", JSON.stringify(prefs));
  }, [prefs]);


  // Load todos on mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch(`${API_BASE}/todos`); // Changed this line
        const data = await res.json();
        setTodos(data);
      } catch (err) {
        console.error("Failed to fetch todos:", err);
      }
    };
    fetchTodos();
  }, []);

    // === EFFECT: FETCH QUOTE ===
  useEffect(() => {
    fetch("http://localhost:5000/api/quote")
      .then((res) => res.json())
      .then((data) => setQuote(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
  const interval = setInterval(() => {
    setTodos((prevTodos) => {
      return prevTodos.map((todo) => {
        const isMissed =
          todo.deadline &&
          new Date(todo.deadline) < new Date() &&
          !todo.status &&
          !todo._notified;

        if (isMissed) {
          toast.error(`Deadline missed for task: ${todo.todo}`);
          return { ...todo, _notified: true };
        }

        return todo;
      });
    });
  }, 60000); // check every minute

  return () => clearInterval(interval);
}, []);


  // Create new todo
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/todos`, { // Changed this line
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  todo: newTodo,
  status: prefs.autoComplete,
  deadline: newDeadline || null,
}),

      });
      const data = await res.json();
      setTodos((prev) => [...prev, data]);
      setNewTodo("");
      setNewDeadline(""); // reset deadline input

    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  };

  // Toggle status
  const toggleStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, { // Changed this line
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !status }),
      });
      const json = await res.json();
      if (json.acknowledged) {
        setTodos((prev) =>
          prev.map((t) => (t._id === id ? { ...t, status: !status } : t))
        );
      }
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, { // Changed this line
        method: "DELETE",
      });
      const json = await res.json();
      if (json.acknowledged) {
        setTodos((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

    // === RESET ===
  const resetData = () => {
    localStorage.clear();
    setPrefs({ theme: "light", autoComplete: false, enableDeadlines: true });
    setTodos([]);
  };
  const moveTodo = (id, direction) => {
  setTodos((prev) => {
    const index = prev.findIndex((t) => t._id === id);
    if (index < 0) return prev;

    const newTodos = [...prev];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap items
    [newTodos[index], newTodos[targetIndex]] = [
      newTodos[targetIndex],
      newTodos[index],
    ];

    return newTodos;
  });
};

  return (
    <main className="max-w-4xl mx-auto p-6 bg-base-200 min-h-screen flex flex-col md:flex-row gap-6">
      {/* Left: Tasks */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-4 text-primary">Awesome Todos</h1>

        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter a new todo..."
            className="input input-bordered input-primary flex-grow"
          />
          <button className="btn btn-primary" type="submit">
            Create Todo
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="text-center text-gray-500">No todos yet!</p>
        ) : (
          <div className="space-y-4">
            {todos.map((todo, index) => {
  const isOverdue = todo.deadline && new Date(todo.deadline) < new Date();

  return (
    <div
      key={todo._id}
      className="flex items-center justify-between p-4 bg-base-100 rounded-lg shadow"
    >
      <div className="flex-grow flex items-center gap-2">
        <span className="font-bold">{index + 1}.</span>

        <div className="flex-grow flex flex-col">
  <p
    className={`${
      todo.status
        ? "line-through text-gray-400"
        : isOverdue
        ? "text-red-500 font-semibold"
        : ""
    }`}
  >
    {todo.todo}
  </p>
  
  {todo.deadline && (
    <p className={`text-sm ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
      Due: {new Date(todo.deadline).toLocaleString()}
    </p>
  )}
</div>

      </div>

      <div className="flex gap-2">
        <button
          className="btn btn-sm btn-info"
          onClick={() => moveTodo(todo._id, "up")}
          disabled={index === 0}
        >
          ⬆
        </button>
        <button
          className="btn btn-sm btn-info"
          onClick={() => moveTodo(todo._id, "down")}
          disabled={index === todos.length - 1}
        >
          ⬇
        </button>
        <button
          className={`btn btn-sm btn-outline ${
            todo.status ? "btn-success" : "btn-warning"
          }`}
          onClick={() => toggleStatus(todo._id, todo.status)}
        >
          {todo.status ? "☑" : "☐"}
        </button>
        <button
          className="btn btn-sm btn-error"
          onClick={() => deleteTodo(todo._id)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
})}

          </div>
        )}
      </div>

      {/* Right: Quote + Preferences */}
      <div className="w-full md:w-80 space-y-4">
        {/* Daily Quote */}
        <div className="p-4 bg-neutral text-neutral-content rounded-box shadow">
          <h2 className="font-bold text-lg mb-2">Daily Quote</h2>
          {quote ? (
  <p className="italic">“{quote.q}” — {quote.a}</p>
) : (
  <p>Loading quote...</p>
)}

        </div>

        {/* Preferences */}
        <div className="p-4 bg-base-100 rounded-box shadow space-y-2">
          <h2 className="font-bold text-lg">User Preferences</h2>

          <label className="flex justify-between items-center">
            <span>Theme</span>
            <button
              className="btn btn-xs"
              onClick={() =>
                setPrefs((p) => ({
                  ...p,
                  theme: p.theme === "light" ? "dark" : "light",
                }))
              }
            >
              {prefs.theme}
            </button>
          </label>

          <label className="flex justify-between items-center">
            <span>Auto complete task</span>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={prefs.autoComplete}
              onChange={() =>
                setPrefs((p) => ({ ...p, autoComplete: !p.autoComplete }))
              }
            />
          </label>

          <label className="flex justify-between items-center">
            <span>Enable deadlines</span>
              {prefs.enableDeadlines && (
  <input
    type="datetime-local"
    value={newDeadline}
    onChange={(e) => setNewDeadline(e.target.value)}
    className="input input-bordered input-secondary w-full"
  />
)}
          </label>

          <button onClick={resetData} className="btn btn-sm btn-warning mt-2">
            Reset Data
          </button>
        </div>
      </div>
    </main>
  );
}