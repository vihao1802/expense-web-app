export interface Tag {
  _id: string;
  name: string;
  color?: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

export interface CreateTagData {
  name: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}
