import { supabaseAdmin } from '@/lib/supabase-server';
import { Task, CareHistory } from '@/types';

/**
 * Create a new care task for a pet
 */
export async function createTask(
  petId: string,
  type: string,
  title: string,
  description: string,
  frequency: string, // daily, weekly, monthly, once
  nextDueDate: string, // ISO date format or timestamp
  nextDueTime?: string // HH:MM format
): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    // Ensure nextDueDate is a valid ISO timestamp
    let dueDateTime = nextDueDate;
    if (!nextDueDate.includes('T')) {
      // If it's just a date, add time
      dueDateTime = `${nextDueDate}T00:00:00Z`;
    }

    const { data: task, error } = await supabaseAdmin
      .from('care_tasks')
      .insert([
        {
          pet_id: petId,
          type,
          title,
          description,
          frequency,
          next_due_date: dueDateTime,
          reminder_time: nextDueTime || null,
          is_completed: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error || !task) {
      return {
        success: false,
        error: error?.message || 'Failed to create task',
      };
    }

    return {
      success: true,
      data: {
        id: task.id,
        petId: task.pet_id,
        type: task.type,
        title: task.title,
        description: task.description,
        frequency: task.frequency,
        nextDueDate: task.next_due_date,
        nextDueTime: task.reminder_time,
        isCompleted: task.is_completed,
        createdAt: task.created_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating task',
    };
  }
}

/**
 * Get all tasks for a specific pet
 */
export async function getTasksByPet(
  petId: string
): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    const { data: tasks, error } = await supabaseAdmin
      .from('care_tasks')
      .select('*')
      .eq('pet_id', petId)
      .order('next_due_date', { ascending: true });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch tasks',
      };
    }

    const formattedTasks: Task[] = (tasks || []).map((task) => ({
      id: task.id,
      petId: task.pet_id,
      type: task.type,
      title: task.title,
      description: task.description,
      frequency: task.frequency,
      nextDueDate: task.next_due_date,
      nextDueTime: task.reminder_time,
      isCompleted: task.is_completed,
      createdAt: task.created_at,
    }));

    return {
      success: true,
      data: formattedTasks,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching tasks',
    };
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: Partial<{
    type: string;
    title: string;
    description: string;
    frequency: string;
    nextDueDate: string;
    nextDueTime: string;
    isCompleted: boolean;
  }>
): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    // Transform camelCase to snake_case for database
    const dbUpdates: Record<string, any> = {};
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.nextDueDate !== undefined) dbUpdates.next_due_date = updates.nextDueDate;
    if (updates.nextDueTime !== undefined) dbUpdates.reminder_time = updates.nextDueTime;
    if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;

    const { data: task, error } = await supabaseAdmin
      .from('care_tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .select()
      .single();

    if (error || !task) {
      return {
        success: false,
        error: error?.message || 'Failed to update task',
      };
    }

    return {
      success: true,
      data: {
        id: task.id,
        petId: task.pet_id,
        type: task.type,
        title: task.title,
        description: task.description,
        frequency: task.frequency,
        nextDueDate: task.next_due_date,
        nextDueTime: task.reminder_time,
        isCompleted: task.is_completed,
        createdAt: task.created_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error updating task',
    };
  }
}

/**
 * Mark a task as complete and log to care_history
 */
export async function completeTask(
  taskId: string
): Promise<{ success: boolean; data?: CareHistory; error?: string }> {
  try {
    // Get task details
    const { data: task, error: taskError } = await supabaseAdmin
      .from('care_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    // Create care history entry
    const { data: history, error: historyError } = await supabaseAdmin
      .from('care_history')
      .insert([
        {
          task_id: taskId,
          completed_at: new Date().toISOString(),
          notes: '',
        },
      ])
      .select()
      .single();

    if (historyError || !history) {
      return {
        success: false,
        error: historyError?.message || 'Failed to log completion',
      };
    }

    // Update task to mark as completed and set next due date
    let nextDueDate = null;
    if (task.frequency === 'daily') {
      const tomorrow = new Date(task.next_due_date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextDueDate = tomorrow.toISOString();
    } else if (task.frequency === 'weekly') {
      const nextWeek = new Date(task.next_due_date);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextDueDate = nextWeek.toISOString();
    } else if (task.frequency === 'monthly') {
      const nextMonth = new Date(task.next_due_date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextDueDate = nextMonth.toISOString();
    }

    await supabaseAdmin
      .from('care_tasks')
      .update({
        is_completed: true,
        next_due_date: nextDueDate,
      })
      .eq('id', taskId);

    return {
      success: true,
      data: {
        id: history.id,
        petId: task.pet_id,
        taskId: history.task_id,
        taskType: task.type,
        completedAt: history.completed_at,
        notes: history.notes,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error completing task',
    };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  taskId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify ownership
    const { data: task, error: taskError } = await supabaseAdmin
      .from('care_tasks')
      .select('pet_id')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    // Check if pet belongs to user
    const { data: pet, error: petError } = await supabaseAdmin
      .from('pets')
      .select('user_id')
      .eq('id', task.pet_id)
      .single();

    if (petError || !pet || pet.user_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const { error } = await supabaseAdmin
      .from('care_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete task',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting task',
    };
  }
}

/**
 * Verify task ownership (indirectly through pet ownership)
 */
export async function verifyTaskOwnership(
  taskId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data: task, error } = await supabaseAdmin
      .from('care_tasks')
      .select('pet_id')
      .eq('id', taskId)
      .single();

    if (error || !task) return false;

    // Check if pet belongs to user
    const { data: pet, error: petError } = await supabaseAdmin
      .from('pets')
      .select('user_id')
      .eq('id', task.pet_id)
      .single();

    if (petError || !pet) return false;
    return pet.user_id === userId;
  } catch {
    return false;
  }
}
