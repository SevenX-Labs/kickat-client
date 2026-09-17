import { api } from './api';

export interface UpdateBasicProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
}

export interface CreateAddressDto {
  type?: 'HOME' | 'WORK' | 'OTHER';
  houseFlat?: string;
  buildingStreet?: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CreatePetDto {
  species: 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'OTHER';
  name: string;
  breed?: string;
  age?: number;
  ageUnit?: 'YEARS' | 'MONTHS';
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  weight?: number;
  weightUnit?: 'KG' | 'LBS';
  dietaryPreference?: 'DRY' | 'WET' | 'BOTH' | 'HOME_COOKED';
  allergies?: string[];
}

export const profileService = {
  /**
   * GET /profile (Fetch complete profile with addresses and pets)
   */
  async getProfile() {
    return api('/profile', { method: 'GET' });
  },

  /**
   * POST /profile/basic (Step 1: Save Basic Profile)
   */
  async updateBasicProfile(dto: UpdateBasicProfileDto) {
    return api('/profile/basic', {
      method: 'POST',
      data: dto as unknown as Record<string, unknown>,
    });
  },

  /**
   * POST /profile/address (Step 2: Add Delivery Address)
   */
  async addAddress(dto: CreateAddressDto) {
    return api('/profile/address', {
      method: 'POST',
      data: dto as unknown as Record<string, unknown>,
    });
  },

  /**
   * POST /profile/pet (Step 3: Add Pet Profile - triggers profileCompleted: true)
   */
  async addPet(dto: CreatePetDto) {
    return api('/profile/pet', {
      method: 'POST',
      data: dto as unknown as Record<string, unknown>,
    });
  },

  /**
   * PUT /profile/addresses/:id (Update Address by ID)
   */
  async updateAddress(addressId: string, dto: Partial<CreateAddressDto>) {
    return api(`/profile/addresses/${addressId}`, {
      method: 'PUT',
      data: dto as unknown as Record<string, unknown>,
    });
  },

  /**
   * DELETE /profile/addresses/:id (Delete Address by ID)
   */
  async deleteAddress(addressId: string) {
    return api(`/profile/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  /**
   * PUT /profile/pets/:id (Update Pet Profile by ID)
   */
  async updatePet(petId: string, dto: Partial<CreatePetDto>) {
    return api(`/profile/pets/${petId}`, {
      method: 'PUT',
      data: dto as unknown as Record<string, unknown>,
    });
  },

  /**
   * DELETE /profile/pets/:id (Delete Pet Profile by ID)
   */
  async deletePet(petId: string) {
    return api(`/profile/pets/${petId}`, {
      method: 'DELETE',
    });
  },
};
