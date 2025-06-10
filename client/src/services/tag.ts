import axiosInstance from "@/config/axios";
import type { Tag, CreateTagData, UpdateTagData } from "@/types/tag";

export const tagService = {
  getTags: async (): Promise<Tag[]> => {
    try {
      const response = await axiosInstance.get<Tag[]>('/tags/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  createTag: async (tagData: CreateTagData): Promise<Tag> => {
    try {
      const response = await axiosInstance.post<Tag>('/tags', tagData);
      return response.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  },

  updateTag: async (id: string, updates: UpdateTagData): Promise<Tag> => {
    try {
      const response = await axiosInstance.put<Tag>(`/tags/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating tag ${id}:`, error);
        throw error;
    }
    },

deleteTag: async (id: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/tags/${id}`);
    } catch (error) {
        console.error(`Error deleting tag ${id}:`, error);
        throw error;
    }
    },

    getTagById: async (id: string): Promise<Tag> => {
    try {
        const response = await axiosInstance.get<Tag>(`/tags/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching tag ${id}:`, error);
        throw error;
    }
    }
}
