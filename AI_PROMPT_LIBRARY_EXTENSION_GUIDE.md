# AI Prompt Library GNOME Extension Development Guide

## Overview

This guide will walk you through creating a GNOME Shell extension called "ai-prompt-library" - a comprehensive cheat sheet for AI prompts that provides quick access to various prompt templates organized by AI model and application.

## Features to Implement

- **Quick Access**: Toggle prompt library window with keyboard shortcut
- **Top Bar Integration**: Access via icon in GNOME top bar
- **Prompt Management**: Create, edit, delete, and organize prompts
- **Organization**: Sort prompts by AI model and application
- **Data Persistence**: Export and import prompt library data
- **User-Friendly Interface**: Clean, searchable interface for prompt templates
- **Copy Functionality**: One-click copying of prompt templates
- **Unit Testing**: Comprehensive test coverage

## Prerequisites

- GNOME Shell 45+ (ESModules support)
- Basic understanding of JavaScript and GJS
- Familiarity with GNOME Shell extension development

## Part 1: Project Setup

### 1.1 Creating the Extension Structure

Use the GNOME extensions tool to create the basic structure:

```bash
gnome-extensions create --interactive
```

When prompted:
- **Name**: "AI Prompt Library"
- **Description**: "A comprehensive cheat sheet for AI prompts with quick access and organization features"
- **UUID**: "ai-prompt-library@github.com"
- **Template**: Choose "Indicator" (for top bar integration)

### 1.2 Directory Structure

Your extension should have the following structure:
```
~/.local/share/gnome-shell/extensions/ai-prompt-library@yourdomain.com/
├── extension.js           # Main extension logic
├── metadata.json         # Extension metadata
├── prefs.js             # Preferences/settings UI
├── stylesheet.css       # Custom styling
├── ui/
│   ├── promptWindow.js  # Main prompt library window
│   ├── promptEditor.js  # Prompt creation/editing dialog
│   └── exportDialog.js  # Import/export functionality
├── data/
│   ├── promptManager.js # Data management logic
│   └── defaultPrompts.js # Default prompt templates
├── utils/
│   ├── keybindings.js   # Keyboard shortcut handling
│   └── clipboard.js     # Clipboard operations
├── schemas/
│   └── org.gnome.shell.extensions.ai-prompt-library.gschema.xml
└── tests/
    ├── test-promptManager.js
    ├── test-keybindings.js
    └── test-ui.js
```

## Part 2: Core Extension Framework

### 2.1 Metadata Configuration

Update `metadata.json` to include:
- Proper shell version compatibility
- Settings schema
- Required permissions
- Keybinding definitions

### 2.2 Main Extension Class

Design the main extension class with:
- **enable()**: Initialize top bar indicator, register keybindings, load prompt data
- **disable()**: Clean up resources, remove UI elements, save data
- **Properties**: Store references to UI components and data managers

## Part 3: User Interface Design

### 3.1 Top Bar Indicator

Create a panel button that:
- Shows an AI/document icon
- Provides quick access to the prompt library
- Indicates when the library window is open
- Offers context menu with common actions

### 3.2 Main Prompt Library Window

Design a modal window featuring:
- **Header**: Search bar, filter options, and action buttons
- **Sidebar**: Categories (AI Models, Applications, Custom)
- **Main Area**: Grid/list view of prompt cards
- **Footer**: Import/Export buttons and settings access

### 3.3 Prompt Card Design

Each prompt card should display:
- Prompt title and description
- AI model and application tags
- Preview of prompt text (truncated)
- Action buttons (Copy, Edit, Delete)
- Visual indicators for custom vs. default prompts

### 3.4 Prompt Editor Dialog

Create a dialog for prompt management with:
- **Title field**: Prompt name/title
- **Description field**: Brief description of prompt use
- **Category selectors**: AI model and application dropdowns
- **Prompt text area**: Multi-line editor with syntax highlighting
- **Tags field**: Custom tags for better organization
- **Preview section**: Shows how the prompt will appear

## Part 4: Data Management

### 4.1 Prompt Data Structure

Design a JSON schema for prompts:
```
{
  "id": "unique-identifier",
  "title": "Prompt Title",
  "description": "What this prompt does",
  "category": {
    "aiModel": "ChatGPT/Claude/Gemini/Other",
    "application": "Coding/Writing/Analysis/Other"
  },
  "content": "The actual prompt text",
  "tags": ["tag1", "tag2"],
  "isCustom": true/false,
  "dateCreated": "ISO date",
  "dateModified": "ISO date",
  "usageCount": 0
}
```

### 4.2 Data Storage

Implement data persistence using:
- **GSettings**: For extension preferences and settings
- **JSON files**: For prompt library data in user config directory
- **Backup system**: Automatic backups before major operations

### 4.3 Default Prompts

Include a curated collection of default prompts covering:
- **Coding**: Code review, debugging, documentation, refactoring
- **Writing**: Content creation, editing, tone adjustment
- **Analysis**: Data analysis, research, summarization
- **Creative**: Brainstorming, ideation, creative writing
- **Business**: Email templates, meeting notes, project planning

## Part 5: Key Features Implementation

### 5.1 Keyboard Shortcuts

Implement configurable keybindings for:
- **Toggle Library**: Default `<Super><Shift>P`
- **Quick Copy Last**: Copy most recently used prompt
- **Search Mode**: Focus search bar when library is open
- **Close Library**: Escape key handling

### 5.2 Search and Filtering

Create a robust search system with:
- **Text search**: Search in titles, descriptions, and content
- **Category filters**: Filter by AI model and application
- **Tag filters**: Filter by custom tags
- **Usage filters**: Show frequently used, recently added, etc.
- **Saved searches**: Save common filter combinations

### 5.3 Copy Functionality

Implement clipboard operations:
- **One-click copy**: Copy prompt to clipboard with visual feedback
- **Template variables**: Support for placeholder substitution
- **Copy history**: Track recently copied prompts
- **Formatting options**: Plain text vs. formatted copy

### 5.4 Import/Export System

Create data portability features:
- **Export formats**: JSON, CSV, markdown
- **Import validation**: Schema validation and error handling
- **Backup creation**: Automatic backup before import
- **Merge strategies**: Options for handling duplicates
- **Sharing capabilities**: Generate shareable prompt collections

## Part 6: Settings and Preferences

### 6.1 Extension Preferences

Implement a preferences dialog with:
- **Appearance**: Theme, window size, prompt card layout
- **Behavior**: Default categories, auto-copy settings
- **Keybindings**: Customizable keyboard shortcuts
- **Data**: Backup frequency, default export format
- **Advanced**: Debug mode, performance settings

### 6.2 GSettings Schema

Create a settings schema defining:
- Keybinding configurations
- UI preferences
- Data storage locations
- Feature toggles

## Part 7: Testing Strategy

### 7.1 Unit Tests

Create comprehensive tests for:

**Data Management Tests**:
- Prompt creation, modification, deletion
- Data validation and sanitization
- Import/export functionality
- Search and filtering operations

**UI Component Tests**:
- Window creation and destruction
- Keyboard navigation
- Search functionality
- Copy operations

**Integration Tests**:
- Keybinding registration and handling
- Top bar indicator behavior
- Settings persistence
- Extension enable/disable cycles

### 7.2 Test Framework Setup

Implement testing using:
- **GJS Test Framework**: For unit testing GJS-specific code
- **Mock Objects**: For GNOME Shell API interactions
- **Test Data**: Sample prompt collections for testing
- **Automated Testing**: CI/CD pipeline for automated testing

### 7.3 Manual Testing Procedures

Create test plans for:
- User workflow testing
- Performance testing with large prompt libraries
- Keyboard accessibility testing
- Multi-monitor setup testing

## Part 8: Performance Optimization

### 8.1 Memory Management

Optimize for:
- **Lazy loading**: Load prompt data only when needed
- **Resource cleanup**: Proper disposal of UI elements
- **Memory leaks**: Monitor and prevent memory leaks
- **Efficient data structures**: Use appropriate data structures

### 8.2 UI Performance

Ensure smooth performance through:
- **Virtualized lists**: For large prompt collections
- **Debounced search**: Prevent excessive search operations
- **Async operations**: Non-blocking data operations
- **Caching strategies**: Cache frequently accessed data

## Part 9: Accessibility

### 9.1 Keyboard Navigation

Implement full keyboard support:
- Tab navigation through all UI elements
- Arrow key navigation in prompt lists
- Keyboard shortcuts for all major actions
- Screen reader compatibility

### 9.2 Visual Accessibility

Ensure visual accessibility through:
- High contrast theme support
- Scalable UI elements
- Clear visual indicators
- Proper focus indicators

## Part 10: Distribution and Maintenance

### 10.1 Extension Packaging

Prepare for distribution:
- **Metadata validation**: Ensure all required fields are present
- **Translation support**: Internationalization framework
- **Documentation**: User guide and developer documentation
- **Screenshots**: Extension showcase images

### 10.2 Version Management

Implement version control:
- **Semantic versioning**: Follow semver for releases
- **Changelog**: Maintain detailed changelog
- **Migration scripts**: Handle data format changes
- **Backwards compatibility**: Support for older GNOME versions

## Development Workflow

1. **Setup**: Create extension structure and basic metadata
2. **Core Framework**: Implement main extension class and basic UI
3. **Data Layer**: Build prompt management and storage system
4. **UI Components**: Create all user interface elements
5. **Features**: Implement search, filtering, and organization
6. **Import/Export**: Add data portability features
7. **Testing**: Comprehensive testing implementation
8. **Polish**: Performance optimization and accessibility
9. **Documentation**: User and developer documentation
10. **Distribution**: Package and distribute extension

## Best Practices

- **Code Organization**: Keep code modular and well-organized
- **Error Handling**: Implement robust error handling throughout
- **User Feedback**: Provide clear feedback for all operations
- **Data Validation**: Validate all user input and imported data
- **Security**: Sanitize data and handle sensitive information properly
- **Performance**: Monitor and optimize performance regularly
- **Accessibility**: Ensure the extension is usable by everyone
- **Documentation**: Maintain clear, up-to-date documentation

## Resources and References

- [GNOME Shell Extensions Guide](https://gjs.guide/extensions/development/creating.html)
- [GJS Documentation](https://gjs.guide/)
- [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/)
- [GNOME Shell API Documentation](https://gjs-docs.gnome.org/)
- [Extension Development Best Practices](https://wiki.gnome.org/Projects/GnomeShell/Extensions)

This guide provides a comprehensive roadmap for building a feature-rich AI Prompt Library extension that integrates seamlessly with GNOME Shell while providing powerful prompt management capabilities. 