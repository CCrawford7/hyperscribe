/**
 * TemplateManager
 * Manages note templates with variable substitution
 */
export default class TemplateManager {
  constructor(customTemplates = []) {
    this.builtInTemplates = this.getBuiltInTemplates();
    this.customTemplates = customTemplates;
    this.templates = [...this.builtInTemplates, ...this.customTemplates];
  }

  /**
   * Load custom templates from storage
   * @param {Array} customTemplates - Custom templates from storage
   */
  loadCustomTemplates(customTemplates = []) {
    this.customTemplates = customTemplates;
    this.templates = [...this.builtInTemplates, ...this.customTemplates];
  }

  /**
   * Get all built-in templates
   */
  getBuiltInTemplates() {
    return [
      {
        id: 'blank',
        name: 'Blank',
        description: 'Start with an empty note',
        icon: '📄',
        content: ''
      },
      {
        id: 'meeting-notes',
        name: 'Meeting Notes',
        description: 'Structured meeting notes template',
        icon: '📝',
        content: `# Meeting Notes - [DATE]

## Attendees
-

## Agenda
1.

## Discussion
-

## Action Items
- [ ]

## Next Steps
-

## Notes
`
      },
      {
        id: 'todo-list',
        name: 'Todo List',
        description: 'Organized task list with priorities',
        icon: '✅',
        content: `# Todo List - [DATE]

## High Priority
- [ ]

## Medium Priority
- [ ]

## Low Priority
- [ ]

## Completed
- [x]
`
      },
      {
        id: 'daily-journal',
        name: 'Daily Journal',
        description: 'Daily reflection and planning',
        icon: '📔',
        content: `# Daily Journal - [DATE]

## Gratitude
-
-
-

## Goals for Today
1.
2.
3.

## Evening Reflection
- What went well:
- What could improve:
- Tomorrow's focus:
`
      },
      {
        id: 'bug-report',
        name: 'Bug Report',
        description: 'Structured bug report format',
        icon: '🐛',
        content: `# Bug Report - [DATE]

## Description
Brief description of the issue

## Steps to Reproduce
1.
2.
3.

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser:
- OS:
- Version:

## Screenshots/Logs
`
      },
      {
        id: 'project-notes',
        name: 'Project Notes',
        description: 'Project planning and tracking',
        icon: '📊',
        content: `# Project: [PROJECT_NAME]
Date: [DATE]

## Overview
Brief project description

## Goals
1.
2.
3.

## Tasks
- [ ]
- [ ]
- [ ]

## Resources
-

## Notes
`
      },
      {
        id: 'brainstorm',
        name: 'Brainstorm',
        description: 'Free-form brainstorming template',
        icon: '💡',
        content: `# Brainstorm Session - [DATE]

## Topic
What are we brainstorming?

## Ideas
-
-
-

## Questions
-
-

## Next Actions
- [ ]
`
      },
      {
        id: 'code-snippet',
        name: 'Code Snippet',
        description: 'Code with documentation',
        icon: '💻',
        content: `# Code Snippet - [DATE]

## Description


## Language


## Code
\`\`\`
// Your code here
\`\`\`

## Usage


## Notes

`
      }
    ];
  }

  /**
   * Get all available templates
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId) {
    return this.templates.find(t => t.id === templateId);
  }

  /**
   * Apply template with variable substitution
   */
  applyTemplate(templateId, variables = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let content = template.content;

    // Default variables
    const vars = {
      DATE: this.formatDate(new Date()),
      TIME: this.formatTime(new Date()),
      DATETIME: this.formatDateTime(new Date()),
      PROJECT_NAME: '',
      ...variables
    };

    // Replace variables
    Object.keys(vars).forEach(key => {
      const placeholder = `[${key}]`;
      const value = vars[key];
      // Escape regex special characters in placeholder
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      content = content.replace(new RegExp(escapedPlaceholder, 'g'), value);
    });

    return content;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format time as HH:MM
   */
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Format date and time
   */
  formatDateTime(date) {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  /**
   * Add custom template
   * @param {Object} template - Template object with id, name, content, icon, description
   * @returns {Object} The added template
   */
  addTemplate(template) {
    // Validate template
    if (!template.id || !template.name || template.content === undefined) {
      throw new Error('Invalid template: must have id, name, and content');
    }

    // Check for duplicate ID
    if (this.getTemplate(template.id)) {
      throw new Error(`Template with ID '${template.id}' already exists`);
    }

    const newTemplate = {
      icon: '📄',
      description: '',
      ...template,
      isCustom: true
    };

    this.customTemplates.push(newTemplate);
    this.templates = [...this.builtInTemplates, ...this.customTemplates];

    return newTemplate;
  }

  /**
   * Check if a template is built-in
   * @param {string} templateId - Template ID
   * @returns {boolean} True if built-in, false if custom
   */
  isBuiltIn(templateId) {
    return this.builtInTemplates.some(t => t.id === templateId);
  }

  /**
   * Get all custom templates
   * @returns {Array} Array of custom templates
   */
  getCustomTemplates() {
    return this.customTemplates;
  }

  /**
   * Remove custom template
   * @param {string} templateId - Template ID to remove
   * @returns {boolean} True if removed, false if not found or built-in
   */
  removeTemplate(templateId) {
    // Prevent removing built-in templates
    if (this.isBuiltIn(templateId)) {
      throw new Error(`Cannot remove built-in template: ${templateId}`);
    }

    const index = this.customTemplates.findIndex(t => t.id === templateId);
    if (index === -1) {
      throw new Error(`Custom template not found: ${templateId}`);
    }

    this.customTemplates.splice(index, 1);
    this.templates = [...this.builtInTemplates, ...this.customTemplates];
    return true;
  }
}
