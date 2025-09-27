export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Time: { input: string; output: string; }
};

export type CreateFlowInput = {
  color: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['Time']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['Time']['input']>;
  status: Scalars['String']['input'];
  title: Scalars['String']['input'];
  workspaceId: Scalars['Int']['input'];
};

export type CreateGoalInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['Time']['input']>;
  flowId?: InputMaybe<Scalars['Int']['input']>;
  priority: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
  status: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateNoteInput = {
  content: Scalars['String']['input'];
  entityId: Scalars['Int']['input'];
  entityType: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  flowId?: InputMaybe<Scalars['Int']['input']>;
  status: Scalars['String']['input'];
  title: Scalars['String']['input'];
  workspaceId: Scalars['Int']['input'];
};

export type CreateTagInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateTaskInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['Time']['input']>;
  flowId?: InputMaybe<Scalars['Int']['input']>;
  goalId?: InputMaybe<Scalars['Int']['input']>;
  priority: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
  status: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateWorkspaceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type Dashboard = {
  __typename?: 'Dashboard';
  recentProjects: Array<Project>;
  todayTasks: Array<Task>;
  upcomingGoals: Array<Goal>;
  workspaceStats: WorkspaceStats;
};

export type Flow = {
  __typename?: 'Flow';
  children?: Maybe<Array<Flow>>;
  color: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['Time']['output']>;
  goals?: Maybe<Array<Goal>>;
  id: Scalars['ID']['output'];
  parent?: Maybe<Flow>;
  parentId?: Maybe<Scalars['Int']['output']>;
  projects?: Maybe<Array<Project>>;
  startDate?: Maybe<Scalars['Time']['output']>;
  status: Scalars['String']['output'];
  tasks?: Maybe<Array<Task>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  workspaceId: Scalars['Int']['output'];
};

export type Goal = {
  __typename?: 'Goal';
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['Time']['output']>;
  flow?: Maybe<Flow>;
  flowId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Array<Note>>;
  priority: Scalars['String']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  tags?: Maybe<Array<Tag>>;
  tasks?: Maybe<Array<Task>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  assignTag: Scalars['Boolean']['output'];
  createFlow: Flow;
  createGoal: Goal;
  createNote: Note;
  createProject: Project;
  createTag: Tag;
  createTask: Task;
  createWorkspace: Workspace;
  deleteFlow: Scalars['Boolean']['output'];
  deleteGoal: Scalars['Boolean']['output'];
  deleteNote: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deleteTag: Scalars['Boolean']['output'];
  deleteTask: Scalars['Boolean']['output'];
  deleteWorkspace: Scalars['Boolean']['output'];
  removeTag: Scalars['Boolean']['output'];
  updateFlow: Flow;
  updateGoal: Goal;
  updateNote: Note;
  updateProject: Project;
  updateTag: Tag;
  updateTask: Task;
  updateWorkspace: Workspace;
};


export type MutationAssignTagArgs = {
  entityId: Scalars['Int']['input'];
  entityType: Scalars['String']['input'];
  tagId: Scalars['Int']['input'];
};


export type MutationCreateFlowArgs = {
  input: CreateFlowInput;
};


export type MutationCreateGoalArgs = {
  input: CreateGoalInput;
};


export type MutationCreateNoteArgs = {
  input: CreateNoteInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateTagArgs = {
  input: CreateTagInput;
};


export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeleteFlowArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGoalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteNoteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTagArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkspaceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveTagArgs = {
  entityId: Scalars['Int']['input'];
  entityType: Scalars['String']['input'];
  tagId: Scalars['Int']['input'];
};


export type MutationUpdateFlowArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFlowInput;
};


export type MutationUpdateGoalArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGoalInput;
};


export type MutationUpdateNoteArgs = {
  id: Scalars['ID']['input'];
  input: UpdateNoteInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProjectInput;
};


export type MutationUpdateTagArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTagInput;
};


export type MutationUpdateTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTaskInput;
};


export type MutationUpdateWorkspaceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWorkspaceInput;
};

export type Note = {
  __typename?: 'Note';
  content: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  entityId: Scalars['Int']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  tags?: Maybe<Array<Tag>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type Project = {
  __typename?: 'Project';
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  flow?: Maybe<Flow>;
  flowId?: Maybe<Scalars['Int']['output']>;
  goals?: Maybe<Array<Goal>>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Array<Note>>;
  status: Scalars['String']['output'];
  tags?: Maybe<Array<Tag>>;
  tasks?: Maybe<Array<Task>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  workspaceId: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  dashboard: Dashboard;
  flow?: Maybe<Flow>;
  flows: Array<Flow>;
  goal?: Maybe<Goal>;
  goals: Array<Goal>;
  note?: Maybe<Note>;
  notes: Array<Note>;
  project?: Maybe<Project>;
  projects: Array<Project>;
  tag?: Maybe<Tag>;
  tags: Array<Tag>;
  task?: Maybe<Task>;
  tasks: Array<Task>;
  workspace?: Maybe<Workspace>;
  workspaces: Array<Workspace>;
};


export type QueryDashboardArgs = {
  workspaceId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryFlowArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFlowsArgs = {
  workspaceId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGoalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGoalsArgs = {
  projectId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryNoteArgs = {
  id: Scalars['ID']['input'];
};


export type QueryNotesArgs = {
  entityId?: InputMaybe<Scalars['Int']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectsArgs = {
  workspaceId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTagArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTagsArgs = {
  parentId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTasksArgs = {
  goalId?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceArgs = {
  id: Scalars['ID']['input'];
};

export type Tag = {
  __typename?: 'Tag';
  children?: Maybe<Array<Tag>>;
  color: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  goals?: Maybe<Array<Goal>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Array<Note>>;
  parent?: Maybe<Tag>;
  parentId?: Maybe<Scalars['Int']['output']>;
  projects?: Maybe<Array<Project>>;
  tasks?: Maybe<Array<Task>>;
  updatedAt: Scalars['Time']['output'];
};

export type Task = {
  __typename?: 'Task';
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['Time']['output']>;
  flow?: Maybe<Flow>;
  flowId?: Maybe<Scalars['Int']['output']>;
  goal?: Maybe<Goal>;
  goalId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Array<Note>>;
  priority: Scalars['String']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  tags?: Maybe<Array<Tag>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type UpdateFlowInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['Time']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['Time']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  workspaceId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateGoalInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['Time']['input']>;
  flowId?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNoteInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  flowId?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  workspaceId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTagInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTaskInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['Time']['input']>;
  flowId?: InputMaybe<Scalars['Int']['input']>;
  goalId?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWorkspaceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Workspace = {
  __typename?: 'Workspace';
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  flows?: Maybe<Array<Flow>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  projects?: Maybe<Array<Project>>;
  updatedAt: Scalars['Time']['output'];
};

export type WorkspaceStats = {
  __typename?: 'WorkspaceStats';
  completedTasks: Scalars['Int']['output'];
  pendingTasks: Scalars['Int']['output'];
  totalGoals: Scalars['Int']['output'];
  totalProjects: Scalars['Int']['output'];
  totalTasks: Scalars['Int']['output'];
};
