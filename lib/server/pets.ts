import { supabaseAdmin } from '@/lib/supabase-server';
import { Pet } from '@/types';

/**
 * Create a new pet for a user
 */
export async function createPet(
  userId: string,
  name: string,
  type: string,
  breed: string,
  gender: 'male' | 'female' | 'other',
  dob: string, // ISO date format
  profilePictureUrl?: string
): Promise<{ success: boolean; data?: Pet; error?: string }> {
  try {
    const { data: pet, error } = await supabaseAdmin
      .from('pets')
      .insert([
        {
          user_id: userId,
          name,
          type,
          breed,
          gender,
          date_of_birth: dob,
          profile_picture_url: profilePictureUrl || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error || !pet) {
      return {
        success: false,
        error: error?.message || 'Failed to create pet',
      };
    }

    return {
      success: true,
      data: {
        id: pet.id,
        userId: pet.user_id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        gender: pet.gender,
        dateOfBirth: pet.date_of_birth,
        profilePictureUrl: pet.profile_picture_url,
        createdAt: pet.created_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating pet',
    };
  }
}

/**
 * Get a single pet by ID
 */
export async function getPet(
  petId: string
): Promise<{ success: boolean; data?: Pet; error?: string }> {
  try {
    const { data: pet, error } = await supabaseAdmin
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (error || !pet) {
      return {
        success: false,
        error: error?.message || 'Pet not found',
      };
    }

    return {
      success: true,
      data: {
        id: pet.id,
        userId: pet.user_id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        gender: pet.gender,
        dateOfBirth: pet.date_of_birth,
        profilePictureUrl: pet.profile_picture_url,
        createdAt: pet.created_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching pet',
    };
  }
}

/**
 * Get all pets for a user
 */
export async function getUserPets(
  userId: string
): Promise<{ success: boolean; data?: Pet[]; error?: string }> {
  try {
    const { data: pets, error } = await supabaseAdmin
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch pets',
      };
    }

    const formattedPets: Pet[] = (pets || []).map((pet) => ({
      id: pet.id,
      userId: pet.user_id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      gender: pet.gender,
      dateOfBirth: pet.date_of_birth,
      profilePictureUrl: pet.profile_picture_url,
      createdAt: pet.created_at,
    }));

    return {
      success: true,
      data: formattedPets,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching pets',
    };
  }
}

/**
 * Update a pet
 */
export async function updatePet(
  petId: string,
  updates: Partial<{
    name: string;
    type: string;
    breed: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
  }>
): Promise<{ success: boolean; data?: Pet; error?: string }> {
  try {
    // Transform camelCase to snake_case for database
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.breed !== undefined) dbUpdates.breed = updates.breed;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;

    const { data: pet, error } = await supabaseAdmin
      .from('pets')
      .update(dbUpdates)
      .eq('id', petId)
      .select()
      .single();

    if (error || !pet) {
      return {
        success: false,
        error: error?.message || 'Failed to update pet',
      };
    }

    return {
      success: true,
      data: {
        id: pet.id,
        userId: pet.user_id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        gender: pet.gender,
        dateOfBirth: pet.date_of_birth,        profilePictureUrl: pet.profile_picture_url,        createdAt: pet.created_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error updating pet',
    };
  }
}

/**
 * Delete a pet
 */
export async function deletePet(
  petId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('pets')
      .delete()
      .eq('id', petId);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete pet',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting pet',
    };
  }
}

/**
 * Verify pet ownership before operations
 */
export async function verifyPetOwnership(
  petId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data: pet, error } = await supabaseAdmin
      .from('pets')
      .select('user_id')
      .eq('id', petId)
      .single();

    if (error || !pet) return false;
    return pet.user_id === userId;
  } catch {
    return false;
  }
}
