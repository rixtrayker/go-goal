import type {
  Goal as GraphQLGoal,
  Project as GraphQLProject,
  Task as GraphQLTask,
  Tag as GraphQLTag,
  Note as GraphQLNote,
  Workspace as GraphQLWorkspace,
  Flow as GraphQLFlow,
  Dashboard as GraphQLDashboard,
  CreateGoalInput,
  CreateProjectInput,
  CreateTaskInput,
  CreateTagInput,
  CreateNoteInput,
  CreateWorkspaceInput,
  CreateFlowInput,
  UpdateGoalInput,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdateTagInput,
  UpdateNoteInput,
  UpdateWorkspaceInput,
  UpdateFlowInput,
} from './graphql';

// Enhanced Goal interface with component-specific properties
export interface Goal extends GraphQLGoal {
  // Additional computed properties for UI
  is_overdue?: boolean;
  progress_percentage?: number;
  days_until_due?: number;
  status_color?: string;
  priority_order?: number;
}

// Enhanced Project interface with component-specific properties
export interface Project extends GraphQLProject {
  // Additional computed properties for UI
  completion_percentage?: number;
  active_goals_count?: number;
  completed_goals_count?: number;
  total_tasks_count?: number;
  is_archived?: boolean;
  status_color?: string;
}

// Enhanced Task interface with component-specific properties
export interface Task extends GraphQLTask {
  // Additional computed properties for UI
  is_overdue?: boolean;
  days_until_due?: number;
  status_color?: string;
  priority_order?: number;
  estimated_hours?: number;
  actual_hours?: number;
}

// Enhanced Tag interface with component-specific properties
export interface Tag extends GraphQLTag {
  // Additional computed properties for UI
  usage_count?: number;
  is_favorite?: boolean;
  hex_color?: string;
  brightness?: 'light' | 'dark';
}

// Enhanced Note interface with component-specific properties
export interface Note extends GraphQLNote {
  // Additional computed properties for UI
  is_pinned?: boolean;
  character_count?: number;
  last_edited_by?: string;
  is_markdown?: boolean;
}

// Enhanced Workspace interface with component-specific properties
export interface Workspace extends GraphQLWorkspace {
  // Additional computed properties for UI
  is_active?: boolean;
  member_count?: number;
  storage_used?: number;
  last_activity?: string;
}

// Enhanced Flow interface with component-specific properties
export interface Flow extends GraphQLFlow {
  // Additional computed properties for UI
  is_active?: boolean;
  completion_percentage?: number;
  days_remaining?: number;
  is_overdue?: boolean;
  child_count?: number;
  total_items_count?: number;
}

// Enhanced Dashboard interface with component-specific properties
export interface Dashboard extends GraphQLDashboard {
  // Additional computed properties for UI
  productivity_score?: number;
  week_completion_rate?: number;
  overdue_items_count?: number;
}

// Form data interfaces for component props
export interface GoalFormData extends Omit<CreateGoalInput, 'projectId'> {
  projectId?: number;
  flowId?: number | null;
}

export interface ProjectFormData extends Omit<CreateProjectInput, 'workspaceId'> {
  workspaceId?: number;
  flowId?: number | null;
}

export interface TaskFormData extends Omit<CreateTaskInput, 'projectId'> {
  projectId?: number;
  goalId?: number | null;
  flowId?: number | null;
}

export interface TagFormData extends CreateTagInput {
  parentId?: number | null;
}

export interface NoteFormData extends Omit<CreateNoteInput, 'entityId' | 'entityType'> {
  entityId?: number;
  entityType?: string;
}

export interface WorkspaceFormData extends CreateWorkspaceInput {}

export interface FlowFormData extends Omit<CreateFlowInput, 'workspaceId'> {
  workspaceId?: number;
  parentId?: number | null;
}

// Form error interfaces
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface GoalFormErrors extends FormErrors {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  projectId?: string;
  dueDate?: string;
  flowId?: string;
}

export interface ProjectFormErrors extends FormErrors {
  title?: string;
  description?: string;
  status?: string;
  workspaceId?: string;
  flowId?: string;
}

export interface TaskFormErrors extends FormErrors {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  goalId?: string;
  dueDate?: string;
  flowId?: string;
}

export interface TagFormErrors extends FormErrors {
  name?: string;
  color?: string;
  parentId?: string;
}

// Component prop interfaces
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  color?: string;
}

export interface FormFieldProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  help_text?: string;
  class?: string;
}

export interface TagInputProps {
  available_tags: Tag[];
  selected_tags: Tag[];
  placeholder?: string;
  max_tags?: number;
  allow_create?: boolean;
  disabled?: boolean;
  error?: string;
  on_tags_change: (tags: Tag[]) => void;
  on_tag_create?: (name: string) => Promise<Tag>;
}

// Navigation and routing interfaces
export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  badge_count?: number;
  is_active?: boolean;
  children?: NavigationItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ar';
  timezone: string;
  date_format: string;
  notifications_enabled: boolean;
}

// Filter and search interfaces
export interface FilterOptions {
  status?: string[];
  priority?: string[];
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  project_ids?: number[];
  goal_ids?: number[];
}

export interface SearchOptions {
  query: string;
  filters?: FilterOptions;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Component state interfaces
export interface LoadingState {
  is_loading: boolean;
  message?: string;
}

export interface ErrorState {
  has_error: boolean;
  message?: string;
  details?: any;
}

export interface PaginationState {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

// Modal and dialog interfaces
export interface ModalProps {
  is_open: boolean;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  mask_closable?: boolean;
  on_close: () => void;
}

export interface ConfirmDialogProps extends ModalProps {
  message: string;
  confirm_text?: string;
  cancel_text?: string;
  variant?: 'info' | 'warning' | 'danger';
  on_confirm: () => void;
  on_cancel?: () => void;
}

// Button and action interfaces
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  is_loading?: boolean;
  icon?: string;
  icon_only?: boolean;
  class?: string;
  on_click: () => void;
}

// Data table interfaces
export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: any) => string;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: PaginationState;
  selection?: {
    enabled: boolean;
    selected_keys: string[];
    on_selection_change: (keys: string[]) => void;
  };
  on_sort?: (column: string, order: 'asc' | 'desc') => void;
  on_filter?: (filters: Record<string, any>) => void;
}

// Constants for dropdown options
export const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' },
];

export const STATUS_OPTIONS = {
  goal: [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
  ] as SelectOption[],
  project: [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
    { value: 'on_hold', label: 'On Hold' },
  ] as SelectOption[],
  task: [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ] as SelectOption[],
  flow: [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
  ] as SelectOption[],
};