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
  user_id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'other';
  breed: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  profile_picture_url?: string;
  created_at: string;
}

// Care task types
export interface CareTask {
  id: string;
  pet_id: string;
  type: 'feeding' | 'grooming' | 'vet_checkup' | 'medication' | 'exercise' | 'bathing' | 'cleaning' | 'other';
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once';
  next_due_date: string;
  reminder_time?: string;
  created_at: string;
}

// Care history types
export interface CareHistory {
  id: string;
  task_id: string;
  completed_at: string;
  notes?: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
