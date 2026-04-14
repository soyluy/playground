export interface TodoFilter {
  /**
   * Search for a string in the title and description (regex search).
   */
  search?: string;
  /**
   * Filter by tags (includes any of the tags).
   */
  tags?: number[];
  /**
   * Filter only todos that have all of the tags.
   */
  allIncludeTags?: number[];
  /**
   * Filter only todos that have none of the tags.
   */
  allExcludeTags?: number[];
  /**
   * Filter by completed status.
   */
  completed?: boolean;
  /**
   * Sort by field.
   */
  sortBy?: 'title' | 'dueDate' | 'createdAt' | 'updatedAt';
  /**
   * Sort order.
   */
  sortOrder?: 'asc' | 'desc';
  /**
   * Filter by due date before.
   */
  dueDateBefore?: Date;
  /**
   * Filter by due date after.
   */
  dueDateAfter?: Date;
  /**
   * Filter by owner ID.
   */
  ownerId?: number;
}
