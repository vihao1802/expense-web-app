import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { tagService } from '@/services/tag';
import type { Tag } from '@/types/tag';

interface TagContextType {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  createTag: (name: string) => Promise<Tag | null>;
  updateTag: (id: string, updates: { name: string; color?: string }) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<boolean>;
  getTagById: (id: string) => Tag | undefined;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

interface TagProviderProps {
  children: ReactNode;
}

export const TagProvider = ({ children }: TagProviderProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all tags for the current user
  const fetchTags = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await tagService.getTags();
      setTags(res);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch tags';
      setError(errorMessage);
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Create a new tag
  const createTag = async (name: string): Promise<Tag | null> => {
    if (!user?._id) return null;
    
    try {
      const res = await tagService.createTag({
        name,
      });
      const newTag = res;
      setTags(prev => [...prev, newTag]);
      toast.success('Thêm loại chi tiêu thành công');
      return newTag;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMsg = error.response?.data?.message || 'Failed to create tag';
      toast.error(errorMsg);
      console.error('Error creating tag:', error);
      return null;
    }
  };

  // Update an existing tag
  const updateTag = async (id: string, updates: { name: string; color?: string }): Promise<Tag | null> => {
    try {
      const res = await tagService.updateTag(id, updates);
      const updatedTag = res;
      
      setTags(prev => 
        prev.map(tag => tag._id === id ? { ...tag, ...updatedTag } : tag)
      );
      
      toast.success('Cập nhật loại chi tiêu thành công');
      return updatedTag;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMsg = error.response?.data?.message || 'Failed to update tag';
      toast.error(errorMsg);
      console.error('Error updating tag:', error);
      return null;
    }
  };

  // Delete a tag
  const deleteTag = async (id: string): Promise<boolean> => {
    try {
      await tagService.deleteTag(id);
      
      setTags(prev => prev.filter(tag => tag._id !== id));
      toast.success('Xóa loại chi tiêu thành công');
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMsg = error.response?.data?.message || 'Failed to delete tag';
      toast.error(errorMsg);
      console.error('Error deleting tag:', error);
      return false;
    }
  };

  // Get a tag by ID
  const getTagById = useCallback((id: string): Tag | undefined => {
    return tags.find(tag => tag._id === id);
  }, [tags]);

  // Fetch tags when user logs in
  useEffect(() => {
      fetchTags();
  }, [fetchTags]);

  const value = {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
  };

  return (
    <TagContext.Provider value={value}>
      {children}
    </TagContext.Provider>
  );
};

export const useTags = (): TagContextType => {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
};
