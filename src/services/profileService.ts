import { api } from './api';

export interface UpdateBasicProfileDto {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface CreateAddressDto {
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CreatePetDto {
  name: string;
  type: string;
  breed?: string;
  age?: number;
}

export const profileService = {
  async getProfile() {
    return api('/profile', { method: 'GET' });
  },

  async updateBasicProfile(dto: UpdateBasicProfileDto) {
    return api('/profile/basic', {
      method: 'POST',
      data: dto as unknown as Record<string, unknown>,
    });
  },

  async addAddress(dto: CreateAddressDto) {
    return api('/profile/address', {
      method: 'POST',
      data: dto as unknown as Record<string, unknown>,
    });
  },

  async addPet(dto: CreatePetDto) {
    return api('/profile/pet', {
      method: 'POST',
      data: dto as unknown as Record<string, unknown>,
    });
  },
};
