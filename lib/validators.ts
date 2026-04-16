import { z } from 'zod';

// ============ PET SCHEMAS ============

export const createPetSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50), // dog, cat, rabbit, etc.
  breed: z.string().min(1).max(100),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // ISO date
  profile_picture_url: z.string().url().optional(),
});

export const updatePetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(50).optional(),
  breed: z.string().min(1).max(100).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  profile_picture_url: z.string().url().optional(),
});

// ============ TASK SCHEMAS ============

export const createTaskSchema = z.object({
  petId: z.string().uuid('Invalid pet ID'),
  type: z.string().min(1).max(50), // feeding, bathing, medicine, etc.
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(''),
  frequency: z.enum(['daily', 'every_2_days', 'every_3_days', 'weekly', 'twice_weekly', 'every_2_weeks', 'monthly', 'every_2_months', 'once', 'as_needed']),
  nextDueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // ISO date
  nextDueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM format
});

export const updateTaskSchema = z.object({
  type: z.string().min(1).max(50).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  frequency: z.enum(['daily', 'every_2_days', 'every_3_days', 'weekly', 'twice_weekly', 'every_2_weeks', 'monthly', 'every_2_months', 'once', 'as_needed']).optional(),
  nextDueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  nextDueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM format
  isCompleted: z.boolean().optional(),
});

export const completeTaskSchema = z.object({
  notes: z.string().max(1000).optional().default(''),
});

// Type exports for use in route handlers
export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
