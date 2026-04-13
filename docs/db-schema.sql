-- PettyPet MVP Database Schema
-- Run this SQL in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  auth_provider VARCHAR(50) NOT NULL DEFAULT 'email',
  auth_provider_id VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  breed VARCHAR(255),
  gender VARCHAR(10) NOT NULL,
  date_of_birth DATE NOT NULL,
  profile_picture_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user_id lookups
CREATE INDEX idx_pets_user_id ON pets(user_id);

-- Care tasks table
CREATE TABLE IF NOT EXISTS care_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50) NOT NULL,
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for pet_id lookups
CREATE INDEX idx_care_tasks_pet_id ON care_tasks(pet_id);

-- Create index for next_due_date for reminders
CREATE INDEX idx_care_tasks_next_due_date ON care_tasks(next_due_date);

-- Care history table
CREATE TABLE IF NOT EXISTS care_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES care_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for task_id lookups
CREATE INDEX idx_care_history_task_id ON care_history(task_id);

-- Create index for completed_at for analytics
CREATE INDEX idx_care_history_completed_at ON care_history(completed_at);

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Create RLS policies for pets
CREATE POLICY "Users can view their own pets"
  ON pets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own pets"
  ON pets FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for care_tasks
CREATE POLICY "Users can view their own pet's care tasks"
  ON care_tasks FOR SELECT
  USING (
    pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- Create RLS policies for care_history
CREATE POLICY "Users can view their pet's care history"
  ON care_history FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM care_tasks 
      WHERE pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    )
  );
