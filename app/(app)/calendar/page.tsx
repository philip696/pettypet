'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Pet {
  id: string;
  name: string;
}

interface Task {
  id: string;
  pet_id: string;
  petName: string;
  type: string;
  title: string;
  description?: string;
  frequency: string;
  next_due_date: string;
  next_due_time?: string;
  created_at: string;
  updated_at: string;
}

interface TasksByDate {
  [date: string]: Task[];
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

const frequencyColors: Record<string, string> = {
  daily: 'ring-2 ring-primary',
  every_2_days: 'ring-2 ring-border-color',
  every_3_days: 'ring-2 ring-border-color',
  weekly: 'ring-2 ring-primary',
  twice_weekly: 'ring-2 ring-primary',
  every_2_weeks: 'ring-2 ring-border-color',
  monthly: 'ring-2 ring-primary',
  every_2_months: 'ring-2 ring-border-color',
  once: '',
  as_needed: 'ring-2 ring-primary',
};

const frequencyBadges: Record<string, string> = {
  daily: '🔁',
  every_2_days: '🔁',
  every_3_days: '🔁',
  weekly: '🔄',
  twice_weekly: '🔄',
  every_2_weeks: '🔄',
  monthly: '📅',
  every_2_months: '📅',
  once: '',
  as_needed: '⚡',
};

const taskBgColors: Record<string, string> = {
  feeding: 'from-neutral to-neutral border-border-color',
  medicine: 'from-neutral to-neutral border-border-color',
  vet: 'from-red-100 to-red-50 border-red-200',
  grooming: 'from-neutral to-neutral border-border-color',
  exercise: 'from-green-100 to-green-50 border-green-200',
  training: 'from-neutral to-neutral border-border-color',
  default: 'from-neutral to-neutral border-border-color',
};

// Helper function to format frequency string for display
const formatFrequencyLabel = (frequency: string): string => {
  const labels: Record<string, string> = {
    daily: 'Every day',
    every_2_days: 'Every 2 days',
    every_3_days: 'Every 3 days',
    weekly: 'Every week',
    twice_weekly: 'Twice weekly',
    every_2_weeks: 'Every 2 weeks',
    monthly: 'Every month',
    every_2_months: 'Every 2 months',
    once: 'Once',
    as_needed: 'As needed',
  };
  return labels[frequency] || frequency;
};

// Helper function to generate all occurrences of a recurring task for the next 12 months
const generateTaskOccurrences = (task: Task, endDate: Date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)): Task[] => {
  if (task.frequency === 'once' || task.frequency === 'as_needed') {
    return [task];
  }

  const occurrences: Task[] = [];
  let currentDate = new Date(task.next_due_date);
  const end = new Date(endDate);

  while (currentDate <= end) {
    occurrences.push({
      ...task,
      next_due_date: formatDateForComparison(currentDate),
    });

    // Calculate next occurrence
    const nextDate = new Date(currentDate);
    switch (task.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'every_2_days':
        nextDate.setDate(nextDate.getDate() + 2);
        break;
      case 'every_3_days':
        nextDate.setDate(nextDate.getDate() + 3);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'twice_weekly':
        nextDate.setDate(nextDate.getDate() + 3);
        break;
      case 'every_2_weeks':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'every_2_months':
        nextDate.setMonth(nextDate.getMonth() + 2);
        break;
      default:
        break;
    }

    currentDate = nextDate;
  }

  return occurrences;
};

// Helper function to format date for comparison (YYYY-MM-DD)
const formatDateForComparison = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTaskComplete = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  // Fetch all pets and their tasks
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const token = localStorage.getItem('pettypet_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch all pets
        const petsResponse = await fetch('/api/pets', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!petsResponse.ok) throw new Error('Failed to fetch pets');
        const petsData = await petsResponse.json();
        const pets: Pet[] = petsData.data || [];

        // Fetch tasks for each pet
        const allTasks: Task[] = [];
        for (const pet of pets) {
          const tasksResponse = await fetch(`/api/tasks?petId=${pet.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (tasksResponse.ok) {
            const tasksData = await tasksResponse.json();
            const petTasks = (tasksData.data || []).map((apiTask: any) => ({
              id: apiTask.id,
              pet_id: apiTask.petId,
              petName: pet.name,
              type: apiTask.type,
              title: apiTask.title,
              description: apiTask.description,
              frequency: apiTask.frequency,
              next_due_date: apiTask.nextDueDate,
              next_due_time: apiTask.nextDueTime,
              created_at: apiTask.createdAt,
              updated_at: apiTask.createdAt,
            }));
            allTasks.push(...petTasks);
          }
        }

        // Group tasks by date and expand recurring tasks
        const grouped: TasksByDate = {};
        allTasks.forEach((task) => {
          // Generate all occurrences for recurring tasks
          const occurrences = generateTaskOccurrences(task);
          
          occurrences.forEach((occurrence) => {
            // Extract just the date part (YYYY-MM-DD) from next_due_date
            const dateKey = occurrence.next_due_date.split('T')[0];
            if (!grouped[dateKey]) {
              grouped[dateKey] = [];
            }
            grouped[dateKey].push(occurrence);
          });
        });

        setTasks(allTasks);
        setTasksByDate(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, [router]);

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: (number | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const formatDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getTasksForDate = (day: number) => {
    const dateStr = formatDateString(day);
    return tasksByDate[dateStr] || [];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDateString(day);
    setSelectedDate(dateStr);
    setSelectedTasks(getTasksForDate(day));
  };

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get upcoming tasks for sidebar
  const parseTaskDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    let taskDate = new Date();
    
    if (dateStr.includes('T')) {
      taskDate = new Date(dateStr);
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      taskDate = new Date(year, month - 1, day);
    } else {
      taskDate = new Date(dateStr);
    }
    
    if (isNaN(taskDate.getTime())) return null;
    return taskDate;
  };

  const upcomingTasks = tasks
    .filter((task) => {
      const parsedDate = parseTaskDate(task.next_due_date);
      return parsedDate !== null;
    })
    .sort((a, b) => {
      const dateA = parseTaskDate(a.next_due_date)?.getTime() || 0;
      const dateB = parseTaskDate(b.next_due_date)?.getTime() || 0;
      if (dateA !== dateB) return dateA - dateB;
      return (a.next_due_time || '00:00').localeCompare(b.next_due_time || '00:00');
    })
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Month Navigation */}
              <div className="bg-gradient-to-r from-primary to-primary text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    ← Previous
                  </button>
                  <h2 className="text-2xl font-bold">{monthYear}</h2>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="font-semibold text-center text-text-primary text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dateTasks = getTasksForDate(day);
                    const isCurrentDay = isToday(day);

                    return (
                      <motion.button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`aspect-square relative rounded-xl border-2 transition-all flex flex-col items-center justify-start p-2 ${
                          isCurrentDay
                            ? 'bg-gradient-to-br from-primary to-primary text-white border-accent shadow-lg'
                            : dateTasks.length > 0
                            ? 'bg-gradient-to-br from-neutral to-neutral border-border-color hover:shadow-md'
                            : 'bg-neutral border-border-color hover:shadow-sm'
                        } ${
                          dateTasks.some(t => t.frequency !== 'once') ? frequencyColors[dateTasks.find(t => t.frequency !== 'once')?.frequency || 'once'] : ''
                        }`}
                      >
                        <span className={`text-sm font-bold ${isCurrentDay ? 'text-white' : 'text-text-primary'}`}>
                          {day}
                        </span>
                        {dateTasks.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-0.5 justify-center items-center">
                            {dateTasks.slice(0, 2).map((task, idx) => (
                              <div key={idx} className="flex items-center gap-0.5">
                                <span
                                  className="text-sm"
                                  title={task.title}
                                >
                                  {taskIcons[task.type] || taskIcons.default}
                                </span>
                                {frequencyBadges[task.frequency] && (
                                  <span className="text-xs">
                                    {frequencyBadges[task.frequency]}
                                  </span>
                                )}
                              </div>
                            ))}
                            {dateTasks.length > 2 && (
                              <span className={`text-xs font-bold mt-0.5 ${isCurrentDay ? 'text-white' : 'text-text-primary'}`}>
                                +{dateTasks.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Tasks Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-green-500 to-primary text-white p-6">
                <h3 className="text-xl font-bold">Upcoming Tasks</h3>
                <p className="text-green-100 text-sm">Next 5 tasks across all pets</p>
              </div>

              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-primary">No upcoming tasks</p>
                    <p className="text-sm text-text-secondary mt-2">All caught up! 🎉</p>
                  </div>
                ) : (
                  upcomingTasks.map((task, idx) => {
                    // Parse date safely - handle both ISO format and plain dates
                    let taskDate: Date;
                    if (task.next_due_date.includes('T')) {
                      // ISO format with time
                      taskDate = new Date(task.next_due_date);
                    } else if (task.next_due_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      // Plain date format YYYY-MM-DD - parse manually to avoid timezone issues
                      const [year, month, day] = task.next_due_date.split('-').map(Number);
                      taskDate = new Date(year, month - 1, day);
                    } else {
                      taskDate = new Date(task.next_due_date);
                    }

                    // Check if date is valid
                    if (isNaN(taskDate.getTime())) {
                      return null;
                    }

                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    let dateLabel = taskDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });

                    if (
                      taskDate.getDate() === today.getDate() &&
                      taskDate.getMonth() === today.getMonth()
                    ) {
                      dateLabel = 'Today';
                    } else if (
                      taskDate.getDate() === tomorrow.getDate() &&
                      taskDate.getMonth() === tomorrow.getMonth()
                    ) {
                      dateLabel = 'Tomorrow';
                    }

                    const timeLabel = task.next_due_time
                      ? new Date(`2000-01-01T${task.next_due_time}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'No time';

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-xl border-l-4 bg-gradient-to-r ${
                          taskBgColors[task.type] || taskBgColors.default
                        } hover:shadow-md transition ${
                          completedTasks.has(task.id) ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={completedTasks.has(task.id)}
                            onChange={() => toggleTaskComplete(task.id)}
                            className="w-5 h-5 mt-1 rounded border-border-color text-primary cursor-pointer flex-shrink-0"
                          />
                          <span className="text-2xl flex-shrink-0">{taskIcons[task.type] || taskIcons.default}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold text-text-primary ${
                                completedTasks.has(task.id) ? 'line-through text-primary' : ''
                              }`}>
                                {task.title}
                              </h4>
                              {frequencyBadges[task.frequency] && (
                                <span className="text-sm" title={task.frequency}>
                                  {frequencyBadges[task.frequency]}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm text-text-primary ${
                              completedTasks.has(task.id) ? 'text-text-secondary' : ''
                            }`}>
                              {task.petName}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className={`text-xs text-primary ${
                                completedTasks.has(task.id) ? 'text-text-secondary' : ''
                              }`}>
                                {dateLabel} at {timeLabel}
                              </p>
                              {task.frequency !== 'once' && (
                                <span className="text-xs px-2 py-1 bg-white/40 rounded-full">
                                  {formatFrequencyLabel(task.frequency)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>

      {/* Date Details Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDate(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary to-primary text-white p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {selectedTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-primary">No tasks scheduled for this day</p>
                    <p className="text-sm text-text-secondary mt-2">Take a rest! 🌟</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTasks.map((task, idx) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-xl border-2 bg-gradient-to-r ${
                          taskBgColors[task.type] || taskBgColors.default
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{taskIcons[task.type] || taskIcons.default}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-text-primary">{task.title}</h4>
                            <p className="text-sm text-text-primary">{task.petName}</p>
                            {task.description && (
                              <p className="text-sm text-text-primary mt-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-3 text-xs text-text-primary">
                              <span className="inline-block bg-white/50 px-2 py-1 rounded">
                                {task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)}
                              </span>
                              {task.next_due_time && (
                                <span className="inline-block bg-white/50 px-2 py-1 rounded">
                                  {new Date(
                                    `2000-01-01T${task.next_due_time}`
                                  ).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-neutral p-4 border-t flex gap-3">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="flex-1 px-4 py-2 rounded-lg bg-secondary/40 text-text-primary font-semibold hover:bg-secondary/40 transition"
                >
                  Close
                </button>
                {selectedTasks.length > 0 && (
                  <Link
                    href={`/pets/${selectedTasks[0].pet_id}/tasks`}
                    onClick={() => setSelectedDate(null)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary text-white font-semibold hover:shadow-lg transition text-center"
                  >
                    View Tasks
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-border-color border-t-primary animate-spin" />
              <p className="text-text-primary font-semibold">Loading calendar...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
