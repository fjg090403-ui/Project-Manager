import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { io } from 'socket.io-client';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, GripVertical, MessageSquare, Tag, UserRound, X } from 'lucide-react';
import { Alert, Button, EmptyState, Input, Select, Skeleton, Textarea } from '../components/ui.jsx';
import { api } from '../services/api';

const priorities = ['LOW', 'MEDIUM', 'HIGH'];
const labels = ['Design', 'Backend', 'Frontend', 'QA', 'Launch'];

const emptyTask = {
  title: '',
  description: '',
  columnId: '',
  assigneeId: '',
  priority: 'MEDIUM',
  dueDate: ''
};

export default function Kanban() {
  const socketRef = useRef(null);
  const [boards, setBoards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDraft, setTaskDraft] = useState(emptyTask);
  const [columnDraft, setColumnDraft] = useState('');
  const [comment, setComment] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const currentBoardId = columns[0]?.boardId || boards[0]?.id || '';

  const boardColumns = useMemo(() => {
    return columns
      .filter((column) => !currentBoardId || column.boardId === currentBoardId)
      .sort((a, b) => a.position - b.position);
  }, [columns, currentBoardId]);

  const tasksByColumn = useMemo(() => {
    return boardColumns.reduce((acc, column) => {
      acc[column.id] = tasks
        .filter((task) => task.columnId === column.id)
        .sort((a, b) => a.position - b.position);
      return acc;
    }, {});
  }, [boardColumns, tasks]);

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((task) => task.status === 'DONE').length / tasks.length) * 100);
  }, [tasks]);

  async function loadBoard() {
    const [boardRes, columnRes, taskRes, userRes] = await Promise.all([
      api.get('/boards'),
      api.get('/columns'),
      api.get('/tasks'),
      api.get('/users')
    ]);
    setBoards(boardRes.data);
    setColumns(columnRes.data);
    setTasks(taskRes.data);
    setUsers(userRes.data);
    setTaskDraft((current) => ({ ...current, columnId: current.columnId || columnRes.data[0]?.id || '' }));
    setLoading(false);
  }

  useEffect(() => {
    loadBoard().catch(() => {
      setNotice({ type: 'error', message: 'Could not load the Kanban board.' });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!currentBoardId) return undefined;
    const socket = io(import.meta.env.VITE_REALTIME_URL || 'http://localhost:4000', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;
    socket.emit('joinBoard', currentBoardId);

    const refresh = () => loadBoard();
    const refreshComments = (payload) => {
      loadBoard();
      if (selectedTask?.id && payload?.taskId === selectedTask.id) {
        api.get(`/comments?taskId=${selectedTask.id}`).then(({ data }) => setComments(data));
      }
    };

    socket.on('taskCreated', refresh);
    socket.on('taskUpdated', refresh);
    socket.on('taskMoved', refresh);
    socket.on('taskDeleted', refresh);
    socket.on('commentCreated', refreshComments);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentBoardId, selectedTask?.id]);

  function emit(eventName, payload) {
    socketRef.current?.emit(eventName, { boardId: currentBoardId, ...payload });
  }

  async function createColumn(event) {
    event.preventDefault();
    if (!columnDraft.trim() || !currentBoardId) return;
    await api.post('/columns', {
      name: columnDraft.trim(),
      boardId: Number(currentBoardId),
      position: boardColumns.length
    });
    setColumnDraft('');
    await loadBoard();
    setNotice({ type: 'success', message: 'Column created.' });
  }

  async function createTask(event) {
    event.preventDefault();
    const payload = normalizeTaskPayload(taskDraft);
    const { data } = await api.post('/tasks', payload);
    setTaskDraft({ ...emptyTask, columnId: taskDraft.columnId, priority: 'MEDIUM' });
    await loadBoard();
    emit('taskCreated', { task: data });
    setNotice({ type: 'success', message: 'Task created.' });
  }

  async function updateTask(event) {
    event.preventDefault();
    const payload = normalizeTaskPayload(selectedTask);
    const { data } = await api.put(`/tasks/${selectedTask.id}`, payload);
    setSelectedTask({ ...data, assigneeId: data.assigneeId || '', dueDate: data.dueDate || '' });
    await loadBoard();
    emit('taskUpdated', { task: data });
    setNotice({ type: 'success', message: 'Task updated.' });
  }

  async function quickUpdateTask(task, patch) {
    const payload = normalizeTaskPayload({ ...task, ...patch });
    const { data } = await api.put(`/tasks/${task.id}`, payload);
    setTasks((current) => current.map((item) => item.id === data.id ? data : item));
    emit('taskUpdated', { task: data });
  }

  async function deleteTask() {
    if (!selectedTask) return;
    await api.delete(`/tasks/${selectedTask.id}`);
    const deletedId = selectedTask.id;
    setSelectedTask(null);
    setComments([]);
    await loadBoard();
    emit('taskDeleted', { taskId: deletedId });
    setNotice({ type: 'success', message: 'Task deleted.' });
  }

  async function moveTask(task, columnId, position = 0) {
    const { data } = await api.patch(`/tasks/${task.id}/move`, { columnId, position });
    await loadBoard();
    emit('taskMoved', { task: data, fromColumnId: task.columnId, toColumnId: columnId });
  }

  async function selectTask(task) {
    setSelectedTask({ ...task, assigneeId: task.assigneeId || '', dueDate: task.dueDate || '' });
    const { data } = await api.get(`/comments?taskId=${task.id}`);
    setComments(data);
  }

  async function addComment(event) {
    event.preventDefault();
    const { data } = await api.post('/comments', { taskId: selectedTask.id, content: comment });
    setComment('');
    await selectTask(selectedTask);
    emit('commentCreated', { taskId: selectedTask.id, comment: data });
  }

  function handleDragStart(event) {
    const task = tasks.find((item) => item.id === Number(event.active.id));
    setActiveTask(task || null);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;
    const activeId = Number(active.id);
    const overId = over.id;
    const activeTaskItem = tasks.find((task) => task.id === activeId);
    if (!activeTaskItem) return;

    const overColumnId = String(overId).startsWith('column-')
      ? Number(String(overId).replace('column-', ''))
      : tasks.find((task) => task.id === Number(overId))?.columnId;

    if (!overColumnId || activeTaskItem.columnId === overColumnId) return;

    setTasks((current) => current.map((task) => task.id === activeId ? { ...task, columnId: overColumnId } : task));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = Number(active.id);
    const activeTaskItem = tasks.find((task) => task.id === activeId);
    if (!activeTaskItem) return;

    const overColumnId = String(over.id).startsWith('column-')
      ? Number(String(over.id).replace('column-', ''))
      : tasks.find((task) => task.id === Number(over.id))?.columnId;

    if (!overColumnId) return;

    const columnTasks = tasksByColumn[overColumnId] || [];
    const oldIndex = columnTasks.findIndex((task) => task.id === activeId);
    const overIndex = columnTasks.findIndex((task) => task.id === Number(over.id));
    const position = overIndex >= 0 ? overIndex : columnTasks.length;

    if (oldIndex >= 0 && overIndex >= 0 && oldIndex !== overIndex && activeTaskItem.columnId === overColumnId) {
      const reordered = arrayMove(columnTasks, oldIndex, overIndex);
      setTasks((current) => current.map((task) => {
        const nextPosition = reordered.findIndex((item) => item.id === task.id);
        return nextPosition >= 0 ? { ...task, position: nextPosition } : task;
      }));
    }

    moveTask(activeTaskItem, overColumnId, position);
  }

  return (
    <section className="space-y-5">
      <header className="section-header">
        <div>
          <p className="eyebrow">Kanban</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">Delivery board</h1>
          <p className="mt-2 text-sm text-muted">Drag, prioritize and edit work with a Jira/ClickUp style workflow.</p>
        </div>
        <form className="column-create" onSubmit={createColumn}>
          <Input value={columnDraft} onChange={(e) => setColumnDraft(e.target.value)} placeholder="New column" />
          <Button>Create column</Button>
        </form>
      </header>

      <div className="rounded-xl2 border border-line bg-surface p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-text">Board progress</p>
            <p className="text-xs text-muted">{progress}% completed across {tasks.length} tasks</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{boardColumns.length} columns</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-elevated">
          <div className="h-full rounded-full bg-text transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {notice && <Alert type={notice.type}>{notice.message}</Alert>}

      <form className="task-create task-create-wide" onSubmit={createTask}>
        <Input value={taskDraft.title} onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })} placeholder="Task title" required />
        <Select value={taskDraft.columnId} onChange={(e) => setTaskDraft({ ...taskDraft, columnId: e.target.value })} required>
          {boardColumns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}
        </Select>
        <Select value={taskDraft.assigneeId} onChange={(e) => setTaskDraft({ ...taskDraft, assigneeId: e.target.value })}>
          <option value="">Unassigned</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </Select>
        <Select value={taskDraft.priority} onChange={(e) => setTaskDraft({ ...taskDraft, priority: e.target.value })}>
          {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
        </Select>
        <Input type="date" value={taskDraft.dueDate} onChange={(e) => setTaskDraft({ ...taskDraft, dueDate: e.target.value })} />
        <Button>Create task</Button>
      </form>

      {loading ? (
        <div className="kanban">
          {[1, 2, 3].map((item) => (
            <div className="column" key={item}>
              <Skeleton className="mb-4 h-6 w-32" />
              <Skeleton className="mb-3 h-32" />
              <Skeleton className="h-28" />
            </div>
          ))}
        </div>
      ) : boardColumns.length === 0 ? (
        <EmptyState title="No columns yet" description="Create a column to start organizing work on this board." />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveTask(null)}
        >
          <div className="kanban">
            {boardColumns.map((column) => (
              <KanbanColumn
                column={column}
                key={column.id}
                tasks={tasksByColumn[column.id] || []}
                onSelect={selectTask}
                onQuickUpdate={quickUpdateTask}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {selectedTask && createPortal(
        <TaskModal
          comments={comments}
          comment={comment}
          priorities={priorities}
          selectedTask={selectedTask}
          setComment={setComment}
          setSelectedTask={setSelectedTask}
          users={users}
          onAddComment={addComment}
          onClose={() => setSelectedTask(null)}
          onDelete={deleteTask}
          onUpdate={updateTask}
        />,
        document.body
      )}
    </section>
  );
}

function KanbanColumn({ column, tasks, onSelect, onQuickUpdate }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });

  return (
    <div ref={setNodeRef} className={`column transition duration-300 ${isOver ? 'ring-4 ring-brand-100' : ''}`}>
      <div className="column-title">
        <h2>{column.name}</h2>
        <span>{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-44">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onSelect={onSelect} onQuickUpdate={onQuickUpdate} />
          ))}
          {tasks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-elevated/60 p-5 text-center text-sm text-muted">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskCard({ task, onSelect, onQuickUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-40' : ''}>
      <TaskCard
        attributes={attributes}
        listeners={listeners}
        onQuickUpdate={onQuickUpdate}
        onSelect={onSelect}
        task={task}
      />
    </div>
  );
}

function TaskCard({ task, onSelect, onQuickUpdate, attributes, listeners, overlay = false }) {
  const priorityTone = task.priority?.toLowerCase() || 'medium';
  const label = labels[task.id % labels.length];

  return (
    <article className={`task-card priority-${priorityTone} ${overlay ? 'w-80 rotate-1 shadow-lift' : ''}`} onClick={() => onSelect?.(task)}>
      <div className="task-card-head">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-1 text-[11px] font-bold text-muted">
              <Tag size={12} /> {label}
            </span>
            <span>{task.priority || 'MEDIUM'}</span>
          </div>
          <h3>{task.title}</h3>
        </div>
        <button className="rounded-lg p-1.5 text-muted transition hover:bg-elevated hover:text-text" onClick={(event) => event.stopPropagation()} {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
      </div>
      <p className="line-clamp-2 text-sm leading-6 text-muted">{task.description || 'No description'}</p>
      <div className="task-meta">
        <Avatar name={task.assigneeName} />
        <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {task.dueDate || 'No due date'}</span>
        <span className="inline-flex items-center gap-1"><MessageSquare size={13} /> Comments</span>
      </div>
      <div className="mt-3 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
        <Select className="h-9 text-xs" value={task.priority || 'MEDIUM'} onChange={(event) => onQuickUpdate?.(task, { priority: event.target.value })}>
          {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
        </Select>
        <Input className="h-9 text-xs" type="date" value={task.dueDate || ''} onChange={(event) => onQuickUpdate?.(task, { dueDate: event.target.value })} />
      </div>
    </article>
  );
}

function TaskModal({ comments, comment, priorities, selectedTask, setComment, setSelectedTask, users, onAddComment, onClose, onDelete, onUpdate }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] border border-line bg-surface p-6 shadow-lift">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Task details</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text">Edit task</h2>
          </div>
          <button className="rounded-xl bg-elevated p-2 text-muted transition hover:text-text" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onUpdate} className="form">
          <Input value={selectedTask.title} onChange={(event) => setSelectedTask({ ...selectedTask, title: event.target.value })} />
          <Textarea value={selectedTask.description || ''} onChange={(event) => setSelectedTask({ ...selectedTask, description: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Select value={selectedTask.assigneeId || ''} onChange={(event) => setSelectedTask({ ...selectedTask, assigneeId: event.target.value })}>
              <option value="">Unassigned</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
            </Select>
            <Select value={selectedTask.priority || 'MEDIUM'} onChange={(event) => setSelectedTask({ ...selectedTask, priority: event.target.value })}>
              {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </Select>
            <Input type="date" value={selectedTask.dueDate || ''} onChange={(event) => setSelectedTask({ ...selectedTask, dueDate: event.target.value })} />
          </div>
          <div className="drawer-actions">
            <Button>Save task</Button>
            <button type="button" className="danger-button" onClick={onDelete}>Delete task</button>
          </div>
        </form>
        <div className="mt-6">
          <h3 className="text-sm font-bold text-text">Comments</h3>
          <div className="comments-list mt-3">
            {comments.length === 0 ? <p className="comment text-muted">No comments yet.</p> : comments.map((item) => (
              <p className="comment" key={item.id}><strong>{item.authorName}</strong> {item.content}</p>
            ))}
          </div>
          <form onSubmit={onAddComment} className="comment-form">
            <Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add comment" required />
            <Button>Add comment</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  if (!name) {
    return <span className="inline-flex items-center gap-1 text-xs text-muted"><UserRound size={13} /> Unassigned</span>;
  }
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-text text-[10px] font-bold text-surface">{initials(name)}</span>
      {name}
    </span>
  );
}

function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function normalizeTaskPayload(task) {
  return {
    title: task.title,
    description: task.description || '',
    columnId: Number(task.columnId),
    assigneeId: task.assigneeId ? Number(task.assigneeId) : null,
    clearAssignee: !task.assigneeId,
    priority: task.priority || 'MEDIUM',
    dueDate: task.dueDate || null,
    clearDueDate: !task.dueDate
  };
}
