// User types
export interface User {
  id: string;
  email: string;
  name: string;
  auth_provider: 'email' | 'google' | 'github';
  auth_provider_id?: string;
  password_hash?: string;
  created_at: string;
}

// Pet types
export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  profilePictureUrl?: string;
  createdAt: string;
}

// Care task types
export interface Task {
  id: string;
  petId: string;
  type: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  nextDueDate: string;
  isCompleted: boolean;
  reminderTime?: string;
  createdAt: string;
}

// Care history types
export interface CareHistory {
  id: string;
  petId: string;
  taskId: string;
  taskType: string;
  completedAt: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
