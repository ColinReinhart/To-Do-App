import { useEffect, useState } from 'react';
import { remult } from 'remult';
import { Task } from './shared/Task';

const taskRepo = remult.repo(Task);

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const addTask = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await taskRepo.insert({ title: newTaskTitle }) // <- replace with this line
      setNewTaskTitle("")
    } catch (error: unknown) {
      alert((error as { message: string }).message)
    }
  }

useEffect(() => {
  return taskRepo
    .liveQuery({
      limit: 20,
      orderBy: { createdAt: "asc" }
    })
    .subscribe(info => setTasks(info.applyChanges))
}, [])

  return (
    <div>
      <h1>Todos</h1>
      <main>
        <form onSubmit={addTask}>
          <input
            value={newTaskTitle}
            placeholder="What needs to be done?"
            onChange={e => setNewTaskTitle(e.target.value)}
          />
          <button>Add</button>
        </form>
        {tasks.length === 0 && <p>No tasks found.</p>} {/* ✅ Show a message if no tasks */}
        {
          tasks.map(task => {
            const setTask = (value: Task) =>
              setTasks(tasks => tasks.map(t => (t === task ? value : t)))

            const setCompleted = async (completed: boolean) =>
              await taskRepo.save({ ...task, completed })
 
            const setTitle = (title: string) => setTask({ ...task, title })

            const saveTask = async () => {
              try {
                await taskRepo.save(task)
              } catch (error: unknown) {
                alert((error as { message: string }).message)
              }
            }

            const deleteTask = async () => {
              try {
                await taskRepo.delete(task)
              } catch (error: unknown) {
                alert((error as { message: string }).message)
              }
            }

            return (
              <div key={task.id}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={e => setCompleted(e.target.checked)}
                />
                <input value={task.title} onChange={e => setTitle(e.target.value)} />
                <button onClick={saveTask}>Save</button>
                <button onClick={deleteTask}>Delete</button>
              </div>
            )
          })
        }
      </main>
    </div>
  );
}