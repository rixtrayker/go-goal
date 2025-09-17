# Life Contexts Feature

## Overview

The Life Contexts feature allows you to organize your goals, projects, and tasks around meaningful life themes or periods. Unlike traditional habit tracking, contexts represent broader life areas that can run in parallel and be nested, providing a high-level perspective on your life's direction.

## Key Concepts

### What are Contexts?

Contexts are thematic containers that represent different areas or periods of your life. They help you:

- **Visualize your life's direction** with color-coded themes
- **Track progress across multiple life areas** simultaneously
- **Understand the bigger picture** of how individual tasks contribute to life goals
- **Maintain focus** on what matters most during specific time periods

### Examples of Contexts

- **Financial Goals**: "Saving $4000 by July"
- **Career Development**: "Finding a new remote job"
- **Health & Fitness**: "Losing weight and building strength"
- **Habit Building**: "Fixing sleep schedule and daily routines"
- **Personal Growth**: "Learning new skills and reading more"

## Features

### 1. Color-Coded Visualization

Each context has a unique color that appears throughout the application:
- **Context cards** have colored left borders
- **Dashboard status bar** shows active contexts with colored indicators
- **Tasks, goals, and projects** display colored dots when associated with contexts
- **Timeline view** uses colors to show context periods

### 2. Time-Based Organization

Contexts can have:
- **Start dates** to mark when a life theme begins
- **End dates** to define completion or transition periods
- **Status tracking** (active, paused, completed, cancelled)

### 3. Hierarchical Structure

Contexts support nesting:
- **Parent contexts** for broad life areas (e.g., "Health & Wellness")
- **Child contexts** for specific goals (e.g., "Weight Loss", "Sleep Improvement")
- **Unlimited nesting levels** for complex life organization

### 4. Cross-Entity Association

Contexts can be associated with:
- **Projects** - entire project themes
- **Goals** - specific objectives within a context
- **Tasks** - individual actions contributing to a context

## Usage

### Creating Contexts

1. Navigate to the **Contexts** page
2. Click **"+ New Context"**
3. Fill in the context details:
   - **Title**: Clear, descriptive name
   - **Description**: Optional details about the context
   - **Color**: Choose a distinctive color for visualization
   - **Status**: Set initial status (usually "active")
   - **Time Period**: Set start and end dates
   - **Parent Context**: Optional, for nesting

### Managing Contexts

- **Edit**: Click the edit icon on any context card
- **Delete**: Click the delete icon (with confirmation)
- **View Stats**: See progress metrics for each context
- **Timeline**: Visualize context periods over time

### Associating with Other Entities

When creating or editing projects, goals, or tasks:
1. Select a **Context** from the dropdown
2. The entity will inherit the context's color coding
3. View the association in lists and detail views

## Dashboard Integration

The dashboard provides a **Context Status Bar** that shows:
- **Active contexts** with their colors
- **Quick access** to context management
- **Visual reminders** of current life themes

## API Reference

### Context Endpoints

```
GET    /api/v1/contexts              # List all contexts
POST   /api/v1/contexts              # Create new context
GET    /api/v1/contexts/{id}         # Get specific context
PUT    /api/v1/contexts/{id}         # Update context
DELETE /api/v1/contexts/{id}         # Delete context
GET    /api/v1/contexts/{id}/stats   # Get context statistics
```

### Context Model

```json
{
  "id": 1,
  "title": "Financial Goals",
  "description": "Saving money and building wealth",
  "color": "#10B981",
  "status": "active",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-07-01T00:00:00Z",
  "parentId": null,
  "workspaceId": 1,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Database Schema

### Contexts Table

```sql
CREATE TABLE contexts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    parent_id INTEGER REFERENCES contexts(id) ON DELETE SET NULL,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Context Associations

Contexts are linked to other entities via `context_id` foreign keys:
- `projects.context_id`
- `goals.context_id`
- `tasks.context_id`

## Best Practices

### 1. Context Naming

- Use **action-oriented titles**: "Building Healthy Habits" vs "Health"
- Be **specific but not too narrow**: "Career Growth" vs "Learning Python"
- Include **time context** when relevant: "Q1 Financial Goals"

### 2. Color Selection

- Choose **distinctive colors** that are easy to distinguish
- Use **meaningful associations**: Green for health, Blue for work, etc.
- Avoid **too many similar colors** to prevent confusion

### 3. Time Periods

- Set **realistic timeframes** for context completion
- Use **overlapping periods** for parallel life themes
- **Review and adjust** dates as life circumstances change

### 4. Context Hierarchy

- Start with **broad parent contexts** (Health, Career, Relationships)
- Create **specific child contexts** for focused goals
- **Limit nesting depth** to 2-3 levels for clarity

### 5. Status Management

- **Active**: Currently working on this life theme
- **Paused**: Temporarily on hold but may resume
- **Completed**: Successfully finished this life period
- **Cancelled**: No longer relevant or abandoned

## Integration with Existing Features

### Projects
- Projects can be associated with contexts for thematic organization
- Context colors appear on project cards and lists
- Project progress contributes to context statistics

### Goals
- Goals inherit context theming and color coding
- Context association helps prioritize goal importance
- Goal completion affects context progress metrics

### Tasks
- Tasks show context indicators for quick identification
- Context association helps with task prioritization
- Task completion contributes to context achievement

### Tags
- Contexts complement but don't replace the tagging system
- Use contexts for **life themes** and tags for **specific attributes**
- Combine both systems for maximum organization flexibility

## Future Enhancements

### Planned Features

1. **Context Analytics**
   - Progress tracking over time
   - Success rate metrics
   - Time investment analysis

2. **Context Templates**
   - Pre-defined context types
   - Quick setup for common life themes
   - Community-shared templates

3. **Context Notifications**
   - Deadline reminders
   - Progress milestone alerts
   - Context transition notifications

4. **Advanced Visualization**
   - Context timeline charts
   - Progress heatmaps
   - Context relationship diagrams

5. **Context Collaboration**
   - Shared contexts for teams/families
   - Context-based task delegation
   - Collaborative context planning

## Migration Guide

### From Tags to Contexts

If you're currently using tags for life organization:

1. **Identify tag patterns** that represent life themes
2. **Create contexts** for major life areas
3. **Associate existing entities** with appropriate contexts
4. **Keep tags** for specific attributes (priority, type, etc.)
5. **Gradually transition** to context-based organization

### Data Migration

The contexts feature includes database migrations that:
- Create the contexts table
- Add context_id columns to existing tables
- Preserve all existing data
- Provide example contexts for immediate use

## Troubleshooting

### Common Issues

1. **Context colors not showing**
   - Check that context_id is properly set
   - Verify context exists and is active
   - Clear browser cache

2. **Context statistics not updating**
   - Ensure entities are properly associated
   - Check context status is "active"
   - Refresh the page

3. **Context hierarchy not working**
   - Verify parent_id references valid context
   - Check for circular references
   - Ensure parent context exists

### Support

For additional help with contexts:
- Check the API documentation
- Review the database schema
- Test with the provided example data
- Create an issue in the project repository

## Conclusion

The Life Contexts feature transforms your goal management from a simple task list into a comprehensive life organization system. By providing visual theming, time-based organization, and hierarchical structure, contexts help you maintain focus on what matters most while tracking progress across multiple life areas.

Use contexts to create a meaningful framework for your personal development and achieve a better balance between different aspects of your life.


