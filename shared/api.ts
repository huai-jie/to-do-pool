export interface TodoList {
  isShared?: boolean;
  title: string;
  description: string;
  items: TodoListItem[];
}

export interface TodoListItem {
  // Non-empty in API request and response
  id?: string;

  // Non-empty in API response
  versionstamp?: string;

  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PoolList {
  items: PoolListItem[];
}

export interface PoolListItem {
  title: string;
  link: string;
  createdAt: number;
  updatedAt: number;
}

export interface TodoListMeta {
  title: string;
  description: string;
  createdAt?: number;
  updatedAt?: number;
}
