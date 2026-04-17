'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Pet {
  id: string;
  name: string;
}

interface Task {
  id: string;
  pet_id: string;
  type: string;
  title: string;
  description?: string;
  frequency: string;
  next_due_date: string;
  next_due_time?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  type: string;
  title: string;
  description: string;
  frequency: string;
  next_due_date: string;
  next_due_time: string;
}

const taskIcons: Record<string, string> = {
  feeding: '🍖',
  medicine: '💊',
  vet: '🏥',
  grooming: '✨',
  exercise: '🏃',
  training: '🎓',
  default: '📋',
};

const taskColors: Record<string, string> = {
  feeding: 'from-neutral to-neutral border-border-color',
  medicine: 'from-neutral to-neutral border-border-color',
  vet: 'from-red-100 to-red-50 border-red-200',
  grooming: 'from-neutral to-neutral border-border-color',
  exercise: 'from-green-100 to-green-50 border-green-200',
  training: 'from-neutral to-neutral border-border-color',
  default: 'from-neutral to-neutral border-border-color',
};

export default function TasksPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    type: 'feeding',
    title: '',
    description: '',
    frequency: 'daily',
    next_due_date: new Date().toISOString().split('T')[0],
    next_due_time: '08:00',
  });

  const taskTypes = [
    { value: 'feeding', label: '🍖 Feeding' },
    { value: 'medicine', label: '💊 Medicine' },
    { value: 'vet', label: '🏥 Vet' },
    { value: 'grooming', label: '✨ Grooming' },
    { value: 'exercise', label: '🏃 Exercise' },
    { value: 'training', label: '🎓 Training' },
  ];

  const frequencies = [
    // Daily options
    { value: 'daily', label: '🕐 Daily' },
    { value: 'every_2_days', label: '⏰ Every 2 days' },
    { value: 'every_3_days', label: '⏰ Every 3 days' },
    
    // Weekly options
    { value: 'weekly', label: '📅 Weekly' },
    { value: 'twice_weekly', label: '📅 Twice a week' },
    { value: 'every_2_weeks', label: '📅 Every 2 weeks' },
    
    // Monthly options
    { value: 'monthly', label: '📆 Monthly' },
    { value: 'every_2_months', label: '📆 Every 2 months' },
    
    // Special
    { value: 'once', label: '✓ Once' },
    { value: 'as_needed', label: '📝 As needed' },
  ];

  // Fetch pet info
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const token = localStorage.getItem('pettypet_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/pets/${petId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch pet');
        const data = await response.json();
        setPet(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching pet');
      }
    };

    if (petId) fetchPet();
  }, [petId, router]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('pettypet_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/tasks?petId=${petId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        
        // Convert API response (camelCase) to local Task format (snake_case)
        const convertedTasks = (data.data || []).map((apiTask: any) => ({
          id: apiTask.id,
          pet_id: apiTask.petId,
          type: apiTask.type,
          title: apiTask.title,
          description: apiTask.description,
          frequency: apiTask.frequency,
          next_due_date: apiTask.nextDueDate,
          next_due_time: apiTask.nextDueTime,
          created_at: apiTask.createdAt,
          updated_at: apiTask.createdAt,
        }));
        
        setTasks(convertedTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching tasks');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchTasks();
    }
  }, [petId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('pettypet_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const endpoint = editingId ? `/api/tasks/${editingId}` : '/api/tasks';
      const method = editingId ? 'PUT' : 'POST';

      const requestBody: any = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        frequency: formData.frequency,
        nextDueDate: formData.next_due_date,
      };

      // Only include nextDueTime if it's in valid HH:MM format
      if (formData.next_due_time && /^\d{2}:\d{2}$/.test(formData.next_due_time)) {
        requestBody.nextDueTime = formData.next_due_time;
      }

      // Include petId for POST requests
      if (!editingId) {
        requestBody.petId = petId;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to save task');

      const data = await response.json();
      const apiTask = data.data;

      // Convert API response (camelCase) to local Task format (snake_case)
      const newTask: Task = {
        id: apiTask.id,
        pet_id: apiTask.petId,
        type: apiTask.type,
        title: apiTask.title,
        description: apiTask.description,
        frequency: apiTask.frequency,
        next_due_date: apiTask.nextDueDate,
        next_due_time: apiTask.nextDueTime,
        created_at: apiTask.createdAt,
        updated_at: apiTask.createdAt,
      };

      if (editingId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingId ? newTask : t))
        );
      } else {
        setTasks((prev) => [newTask, ...prev]);
      }

      setSuccess(
        editingId ? '✅ Task updated successfully!' : '✅ Task created successfully!'
      );
      resetForm();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    setDeleteLoading(true);

    try {
      const token = localStorage.getItem('pettypet_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSuccess('✅ Task deleted successfully!');
      setShowDeleteConfirm(null);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting task');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    // Safely parse the date, handling ISO format or plain date strings
    let dateStr = new Date().toISOString().split('T')[0]; // default to today
    if (task.next_due_date) {
      dateStr = task.next_due_date.includes('T') 
        ? task.next_due_date.split('T')[0]
        : task.next_due_date;
    }
    
    const timeStr = task.next_due_time || '08:00';
    
    setFormData({
      type: task.type,
      title: task.title,
      description: task.description || '',
      frequency: task.frequency,
      next_due_date: dateStr,
      next_due_time: timeStr,
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'feeding',
      title: '',
      description: '',
      frequency: 'daily',
      next_due_date: new Date().toISOString().split('T')[0],
      next_due_time: '08:00',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateStr: string | undefined) => {
    try {
      if (!dateStr) return 'N/A';
      
      // Parse date string - handle both ISO format and plain dates
      let date: Date;
      if (dateStr.includes('T')) {
        // ISO format with time
        date = new Date(dateStr);
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Plain date format YYYY-MM-DD - parse manually to avoid timezone issues
        const [year, month, day] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) return 'Today';
      if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr || 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral via-white to-neutral flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="w-12 h-12 border-4 border-border-color border-t-primary rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.02,
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.15 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-white to-neutral">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-border-color"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={`/pets/${petId}`}>
            <motion.button
              className="text-text-primary hover:text-text-primary font-medium transition-colors flex items-center gap-2"
              whileHover={{ x: -4 }}
            >
              ← Back
            </motion.button>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">
            {pet?.name}&apos;s Care Tasks 🐾
          </h1>
          <div className="w-16" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-6 text-green-700 font-medium"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6 text-red-700 font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Tasks List */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Task Cards */}
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <motion.div
                  className={`bg-gradient-to-br ${
                    taskColors[task.type] || taskColors.default
                  } border-2 rounded-2xl p-6 transition-all`}
                  variants={cardHoverVariants}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">
                          {taskIcons[task.type] || taskIcons.default}
                        </span>
                        <div>
                          <h3 className="text-xl font-bold text-text-primary">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-text-primary mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Task Info */}
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        <span className="inline-block bg-white bg-opacity-60 px-3 py-1 rounded-full font-semibold text-text-primary">
                          {frequencies.find((f) => f.value === task.frequency)
                            ?.label || task.frequency}
                        </span>
                        <span className="inline-block bg-white bg-opacity-60 px-3 py-1 rounded-full text-text-primary">
                          Next: {formatDate(task.next_due_date)}{' '}
                          {task.next_due_time && `${task.next_due_time}`}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <motion.button
                        onClick={() => handleEdit(task)}
                        className="bg-primary hover:bg-primary text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✏️ Edit
                      </motion.button>
                      <motion.button
                        onClick={() => setShowDeleteConfirm(task.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🗑️
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center py-12"
              variants={itemVariants}
            >
              <p className="text-text-primary text-lg mb-4">
                No care tasks yet! 📋
              </p>
              <p className="text-primary mb-6">
                Create your first task to get started
              </p>
            </motion.div>
          )}

          {/* Add Task Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="w-full bg-gradient-to-r from-secondary to-primary hover:shadow-lg text-white font-bold py-4 rounded-2xl border-2 border-border-color transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              + Add New Task
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => resetForm()}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  {editingId ? '✏️ Edit Task' : '➕ Create New Task'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Task Type */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Task Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {taskTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Morning Feeding"
                      required
                      className="w-full px-4 py-3 border-2 border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add details about this task..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Frequency *
                    </label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {frequencies.map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Next Due Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">
                        Next Due Date *
                      </label>
                      <input
                        type="date"
                        name="next_due_date"
                        value={formData.next_due_date || new Date().toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Reminder Time */}
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        name="next_due_time"
                        value={formData.next_due_time || '08:00'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      className={`flex-1 ${
                        saving
                          ? 'bg-secondary'
                          : 'bg-gradient-to-r from-secondary to-primary hover:shadow-lg'
                      } text-white font-bold py-3 rounded-xl transition-all disabled:cursor-not-allowed`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving
                        ? editingId
                          ? 'Updating...'
                          : 'Creating...'
                        : editingId
                        ? 'Update Task'
                        : 'Create Task'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => resetForm()}
                      className="flex-1 bg-secondary/40 text-text-primary font-bold py-3 rounded-xl hover:bg-secondary/40 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Delete Task?
              </h3>
              <p className="text-text-primary mb-8">
                This action cannot be undone. The task will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deleteLoading}
                  className={`flex-1 ${
                    deleteLoading ? 'bg-secondary' : 'bg-red-500 hover:bg-red-600'
                  } text-white font-bold py-3 rounded-lg transition-all disabled:cursor-not-allowed`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </motion.button>
                <motion.button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-secondary/40 text-text-primary font-bold py-3 rounded-lg hover:bg-secondary/40 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
