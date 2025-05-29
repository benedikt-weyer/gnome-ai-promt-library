import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';

import {ClipboardManager} from '../utils/clipboard.js';

const PromptCard = GObject.registerClass(
class PromptCard extends St.Button {
    _init(prompt, promptWindow) {
        super._init({
            style_class: 'prompt-card',
            can_focus: true,
            reactive: true,
        });
        
        this._prompt = prompt;
        this._promptWindow = promptWindow;
        this._clipboardManager = promptWindow._clipboardManager;
        
        this._buildUI();
        this._connectSignals();
    }
    
    _buildUI() {
        // Main container
        const box = new St.BoxLayout({
            vertical: true,
            style_class: 'prompt-card-content',
        });
        
        // Header with title and actions
        const header = new St.BoxLayout({
            style_class: 'prompt-card-header',
        });
        
        // Title
        this._titleLabel = new St.Label({
            text: this._prompt.title,
            style_class: 'prompt-card-title',
        });
        this._titleLabel.clutter_text.set_ellipsize(Pango.EllipsizeMode.END);
        header.add_child(this._titleLabel);
        
        // Spacer
        header.add_child(new St.Widget({ x_expand: true }));
        
        // Action buttons container
        const actions = new St.BoxLayout({
            style_class: 'prompt-card-actions',
        });
        
        // Favorite button
        this._favoriteButton = new St.Button({
            style_class: 'prompt-card-action-button',
            can_focus: true,
        });
        this._updateFavoriteIcon();
        this._favoriteButton.connect('clicked', () => this._onFavoriteClicked());
        actions.add_child(this._favoriteButton);
        
        // Copy button
        const copyButton = new St.Button({
            style_class: 'prompt-card-action-button',
            can_focus: true,
        });
        copyButton.set_child(new St.Icon({
            icon_name: 'edit-copy-symbolic',
            icon_size: 16,
        }));
        copyButton.connect('clicked', () => this._onCopyClicked());
        actions.add_child(copyButton);
        
        header.add_child(actions);
        box.add_child(header);
        
        // Description
        if (this._prompt.description) {
            const descLabel = new St.Label({
                text: this._prompt.description,
                style_class: 'prompt-card-description',
            });
            descLabel.clutter_text.set_ellipsize(Pango.EllipsizeMode.END);
            descLabel.clutter_text.set_line_wrap(true);
            descLabel.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD_CHAR);
            box.add_child(descLabel);
        }
        
        // Tags and category
        const meta = new St.BoxLayout({
            style_class: 'prompt-card-meta',
        });
        
        // AI Model tag
        const modelTag = new St.Label({
            text: this._prompt.category.aiModel,
            style_class: 'prompt-card-tag prompt-card-tag-model',
        });
        meta.add_child(modelTag);
        
        // Application tag
        const appTag = new St.Label({
            text: this._prompt.category.application,
            style_class: 'prompt-card-tag prompt-card-tag-app',
        });
        meta.add_child(appTag);
        
        // Usage count (if > 0)
        if (this._prompt.usageCount > 0) {
            const usageLabel = new St.Label({
                text: `${this._prompt.usageCount} uses`,
                style_class: 'prompt-card-usage',
            });
            meta.add_child(usageLabel);
        }
        
        box.add_child(meta);
        
        // Content preview
        const preview = this._createContentPreview();
        if (preview) {
            box.add_child(preview);
        }
        
        this.set_child(box);
    }
    
    _createContentPreview() {
        const content = this._prompt.content;
        if (!content || content.length < 50) return null;
        
        // Create a short preview
        const preview = content.substring(0, 120);
        const previewText = preview.length < content.length ? preview + '...' : preview;
        
        const previewLabel = new St.Label({
            text: previewText,
            style_class: 'prompt-card-preview',
        });
        previewLabel.clutter_text.set_ellipsize(Pango.EllipsizeMode.END);
        previewLabel.clutter_text.set_line_wrap(true);
        previewLabel.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD_CHAR);
        
        return previewLabel;
    }
    
    _connectSignals() {
        this.connect('clicked', () => this._onCardClicked());
        this.connect('key-press-event', (actor, event) => this._onKeyPress(event));
    }
    
    _onCardClicked() {
        // Copy prompt content on click
        this._copyPrompt();
    }
    
    _onKeyPress(event) {
        const symbol = event.get_key_symbol();
        
        switch (symbol) {
            case Clutter.KEY_Return:
            case Clutter.KEY_KP_Enter:
                this._copyPrompt();
                return Clutter.EVENT_STOP;
                
            case Clutter.KEY_space:
                this._onFavoriteClicked();
                return Clutter.EVENT_STOP;
                
            case Clutter.KEY_Delete:
                if (this._prompt.isCustom) {
                    this._promptWindow._deletePrompt(this._prompt.id);
                }
                return Clutter.EVENT_STOP;
        }
        
        return Clutter.EVENT_PROPAGATE;
    }
    
    _onFavoriteClicked() {
        const promptManager = this._promptWindow._extension.getPromptManager();
        const isFavorite = promptManager.toggleFavorite(this._prompt.id);
        this._updateFavoriteIcon();
        
        // Visual feedback
        if (isFavorite) {
            this._favoriteButton.add_style_pseudo_class('checked');
        } else {
            this._favoriteButton.remove_style_pseudo_class('checked');
        }
    }
    
    _updateFavoriteIcon() {
        const promptManager = this._promptWindow._extension.getPromptManager();
        const favorites = promptManager.getFavoritePrompts();
        const isFavorite = favorites.some(fav => fav.id === this._prompt.id);
        
        const iconName = isFavorite ? 'starred-symbolic' : 'non-starred-symbolic';
        this._favoriteButton.set_child(new St.Icon({
            icon_name: iconName,
            icon_size: 16,
        }));
    }
    
    _onCopyClicked() {
        this._copyPrompt();
    }
    
    _copyPrompt() {
        const promptManager = this._promptWindow._extension.getPromptManager();
        
        // Mark as used
        promptManager.markAsUsed(this._prompt.id);
        
        // Copy to clipboard
        this._clipboardManager.copyPrompt(this._prompt);
        
        // Auto-close if enabled
        const settings = this._promptWindow._extension.getExtensionSettings();
        if (settings.get_boolean('auto-close-on-copy')) {
            this._promptWindow.hide();
        }
    }
    
    getPrompt() {
        return this._prompt;
    }
});

export const PromptWindow = GObject.registerClass(
class PromptWindow extends St.Widget {
    _init(extension) {
        console.log('PromptWindow: Starting initialization');
        
        try {
            super._init({
                style_class: 'prompt-library-popup',
                layout_manager: new Clutter.BinLayout(),
                reactive: true,
                can_focus: true,
                visible: false,
            });
            
            console.log('PromptWindow: St.Widget initialized');
            
            this._extension = extension;
            this._settings = extension.getExtensionSettings();
            this._promptManager = extension.getPromptManager();
            this._clipboardManager = new ClipboardManager(extension);
            
            console.log('PromptWindow: Dependencies initialized');
            
            this._prompts = [];
            this._filteredPrompts = [];
            this._currentFilter = null;
            this._searchQuery = '';
            this._selectedFilters = {
                aiModel: null,
                application: null,
                showFavorites: false,
                showRecent: false,
            };
            
            // Add guard to prevent infinite recursion
            this._isOpening = false;
            this._visible = false;
            
            // Animation state
            this._isAnimating = false;
            this._animationSettings = {
                enabled: this._settings.get_boolean('enable-animations'),
                type: this._settings.get_string('animation-type'),
                duration: this._settings.get_int('animation-duration'),
            };
            
            // Watch for animation settings changes
            this._settings.connect('changed::enable-animations', () => {
                this._animationSettings.enabled = this._settings.get_boolean('enable-animations');
            });
            this._settings.connect('changed::animation-type', () => {
                this._animationSettings.type = this._settings.get_string('animation-type');
                this._updateAnimationClasses();
            });
            this._settings.connect('changed::animation-duration', () => {
                this._animationSettings.duration = this._settings.get_int('animation-duration');
                this._updateAnimationClasses();
            });
            
            console.log('PromptWindow: Starting minimal UI build');
            this._buildMinimalUI();
            
            console.log('PromptWindow: Starting data load');
            this._loadPrompts();
            
            console.log('PromptWindow: Connecting signals');
            this._connectSignals();
            
            // Add to main stage
            Main.layoutManager.addChrome(this);
            
            console.log('PromptWindow: Initialization completed successfully');
            
        } catch (error) {
            console.error('PromptWindow: Error during initialization:', error);
            throw error;
        }
    }
    
    _buildMinimalUI() {
        try {
            console.log('PromptWindow: Building complete UI');
            
            // Get monitor dimensions and calculate 90% size
            const monitor = Main.layoutManager.primaryMonitor;
            const windowWidth = Math.floor(monitor.width * 0.9);
            const windowHeight = Math.floor(monitor.height * 0.9);
            
            console.log(`PromptWindow: Calculated window size: ${windowWidth}x${windowHeight} (90% of ${monitor.width}x${monitor.height})`);
            
            // Store calculated dimensions for later use
            this._windowWidth = windowWidth;
            this._windowHeight = windowHeight;
            
            // Create a background overlay
            const background = new St.Bin({
                style_class: 'prompt-library-popup',
                reactive: true,
                can_focus: true,
            });
            
            // Create the main dialog container
            const dialogBox = new St.BoxLayout({
                style_class: 'prompt-library-background',
                vertical: true,
                width: windowWidth,
                height: windowHeight,
            });
            
            // Build all the UI components
            this._buildHeader(dialogBox);
            this._buildMainContent(dialogBox);
            this._buildFooter(dialogBox);
            
            background.set_child(dialogBox);
            this.add_child(background);
            
            // Set up initial animation state
            this._setupAnimations();
            
            // Center the dialog after it's been allocated
            this.connect('notify::allocation', () => {
                if (this.get_stage() && this.is_visible()) {
                    GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                        if (this.get_stage()) {
                            const currentMonitor = Main.layoutManager.primaryMonitor;
                            this.set_position(
                                Math.floor((currentMonitor.width - windowWidth) / 2),
                                Math.floor((currentMonitor.height - windowHeight) / 2)
                            );
                        }
                        return false;
                    });
                }
            });
            
            // Also position immediately when shown
            this.connect('show', () => {
                GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                    if (this.get_stage()) {
                        const currentMonitor = Main.layoutManager.primaryMonitor;
                        this.set_position(
                            Math.floor((currentMonitor.width - windowWidth) / 2),
                            Math.floor((currentMonitor.height - windowHeight) / 2)
                        );
                    }
                    return false;
                });
            });
            
            console.log('PromptWindow: Complete UI build completed');
        } catch (error) {
            console.error('PromptWindow: Error building complete UI:', error);
            throw error;
        }
    }
    
    _buildHeader(parent) {
        const header = new St.BoxLayout({
            style_class: 'prompt-library-header',
        });
        
        // Title
        const title = new St.Label({
            text: 'AI Prompt Library',
            style_class: 'prompt-library-title',
        });
        header.add_child(title);
        
        // Spacer
        header.add_child(new St.Widget({ x_expand: true }));
        
        // Search box
        this._searchEntry = new St.Entry({
            style_class: 'prompt-library-search',
            hint_text: 'Search prompts...',
            can_focus: true,
        });
        this._searchEntry.set_width(300);
        header.add_child(this._searchEntry);
        
        // Action buttons
        const actions = new St.BoxLayout({
            style_class: 'prompt-library-actions',
        });
        
        // Add new prompt button
        const addButton = new St.Button({
            style_class: 'prompt-library-button',
            label: 'Add New',
            can_focus: true,
        });
        addButton.connect('clicked', () => this._onAddNewPrompt());
        actions.add_child(addButton);
        
        header.add_child(actions);
        parent.add_child(header);
    }
    
    _buildMainContent(parent) {
        const contentBox = new St.BoxLayout({
            style_class: 'prompt-library-content',
            vertical: false,
        });
        
        // Sidebar
        this._buildSidebar(contentBox);
        
        // Main area
        this._buildMainArea(contentBox);
        
        parent.add_child(contentBox);
    }
    
    _buildSidebar(parent) {
        const sidebar = new St.BoxLayout({
            vertical: true,
            style_class: 'prompt-library-sidebar',
        });
        sidebar.set_width(200);
        
        // Quick filters
        const quickFiltersBox = new St.BoxLayout({
            vertical: true,
            style_class: 'sidebar-section',
        });
        
        const quickTitle = new St.Label({
            text: 'Quick Access',
            style_class: 'sidebar-title',
        });
        quickFiltersBox.add_child(quickTitle);
        
        // All prompts
        this._allButton = new St.Button({
            style_class: 'sidebar-button',
            label: 'All Prompts',
            can_focus: true,
        });
        this._allButton.connect('clicked', () => this._filterPrompts('all'));
        quickFiltersBox.add_child(this._allButton);
        
        // Recent prompts
        this._recentButton = new St.Button({
            style_class: 'sidebar-button',
            label: 'Recent',
            can_focus: true,
        });
        this._recentButton.connect('clicked', () => this._filterPrompts('recent'));
        quickFiltersBox.add_child(this._recentButton);
        
        // Favorites
        this._favoritesButton = new St.Button({
            style_class: 'sidebar-button',
            label: 'Favorites',
            can_focus: true,
        });
        this._favoritesButton.connect('clicked', () => this._filterPrompts('favorites'));
        quickFiltersBox.add_child(this._favoritesButton);
        
        sidebar.add_child(quickFiltersBox);
        
        // AI Models filter
        this._buildFilterSection(sidebar, 'AI Models', 'aiModel');
        
        // Applications filter
        this._buildFilterSection(sidebar, 'Applications', 'application');
        
        parent.add_child(sidebar);
    }
    
    _buildFilterSection(parent, title, filterType) {
        const section = new St.BoxLayout({
            vertical: true,
            style_class: 'sidebar-section',
        });
        
        const sectionTitle = new St.Label({
            text: title,
            style_class: 'sidebar-title',
        });
        section.add_child(sectionTitle);
        
        // We'll populate this dynamically
        const container = new St.BoxLayout({
            vertical: true,
            style_class: 'filter-container',
        });
        section.add_child(container);
        
        // Store reference for dynamic updates
        if (filterType === 'aiModel') {
            this._aiModelContainer = container;
        } else if (filterType === 'application') {
            this._applicationContainer = container;
        }
        
        parent.add_child(section);
    }
    
    _buildMainArea(parent) {
        const mainArea = new St.BoxLayout({
            vertical: true,
            style_class: 'prompt-library-main',
            x_expand: true,
        });
        
        // Status bar
        this._statusLabel = new St.Label({
            style_class: 'prompt-library-status',
        });
        mainArea.add_child(this._statusLabel);
        
        // Scrollable content
        const scrollView = new St.ScrollView({
            style_class: 'prompt-library-scroll',
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            x_expand: true,
            y_expand: true,
        });
        
        this._promptsContainer = new St.BoxLayout({
            vertical: true,
            style_class: 'prompts-container',
        });
        
        scrollView.set_child(this._promptsContainer);
        mainArea.add_child(scrollView);
        
        parent.add_child(mainArea);
    }
    
    _buildFooter(parent) {
        const footer = new St.BoxLayout({
            style_class: 'prompt-library-footer',
        });
        
        // Statistics
        this._statsLabel = new St.Label({
            style_class: 'prompt-library-stats',
        });
        footer.add_child(this._statsLabel);
        
        // Spacer
        footer.add_child(new St.Widget({ x_expand: true }));
        
        // Import/Export buttons
        const importButton = new St.Button({
            style_class: 'prompt-library-button',
            label: 'Import',
            can_focus: true,
        });
        importButton.connect('clicked', () => this._onImport());
        footer.add_child(importButton);
        
        const exportButton = new St.Button({
            style_class: 'prompt-library-button',
            label: 'Export',
            can_focus: true,
        });
        exportButton.connect('clicked', () => this._onExport());
        footer.add_child(exportButton);
        
        parent.add_child(footer);
    }
    
    _connectSignals() {
        try {
            console.log('PromptWindow: Connecting signals');
            
            // Search functionality
            this._searchEntry.clutter_text.connect('text-changed', () => {
                this._searchQuery = this._searchEntry.get_text();
                this._applyFilters();
            });
            
            // Keyboard shortcuts
            this.connect('key-press-event', (actor, event) => this._onKeyPress(event));
            
            console.log('PromptWindow: Signals connected successfully');
        } catch (error) {
            console.error('PromptWindow: Error connecting signals:', error);
        }
    }
    
    _setupAnimations() {
        console.log('PromptWindow: Setting up animations');
        
        // Don't set initial hidden state during setup
        // We'll set it just before animating
    }
    
    _updateAnimationClasses() {
        // This method is now only for updating timing if needed
        // The actual animations are handled by Clutter
    }
    
    _setInitialHiddenState() {
        const type = this._animationSettings.type;
        
        console.log(`PromptWindow: Setting initial hidden state for ${type}`);
        
        // Reset any previous transforms first
        this.set_pivot_point(0.5, 0.5);
        this.rotation_angle_x = 0;
        this.scale_x = 1.0;
        this.scale_y = 1.0;
        this.translation_y = 0;
        
        switch (type) {
            case 'fade':
                this.opacity = 0;
                break;
            case 'slide-down':
                this.opacity = 0;
                this.translation_y = -50;
                break;
            case 'slide-up':
                this.opacity = 0;
                this.translation_y = 50;
                break;
            case 'flip-down':
                this.opacity = 0;
                this.translation_y = -30;
                break;
            case 'flip-up':
                this.opacity = 0;
                this.translation_y = 30;
                break;
            case 'zoom':
                this.opacity = 0;
                break;
        }
    }
    
    _animateShow() {
        if (!this._animationSettings.enabled || this._animationSettings.type === 'none') {
            // No animation, show immediately
            this.opacity = 255;
            this._visible = true;
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            this._isAnimating = true;
            const duration = this._animationSettings.duration;
            const type = this._animationSettings.type;
            
            console.log(`PromptWindow: Starting ${type} show animation (${duration}ms)`);
            
            // Set initial hidden state just before animation
            this._setInitialHiddenState();
            
            // Use a small delay to ensure the hidden state is applied
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
                switch (type) {
                    case 'fade':
                        this.save_easing_state();
                        this.set_easing_duration(duration);
                        this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_CUBIC);
                        this.opacity = 255;
                        this.restore_easing_state();
                        break;
                        
                    case 'slide-down':
                        this.save_easing_state();
                        this.set_easing_duration(duration);
                        this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_CUBIC);
                        this.opacity = 255;
                        this.translation_y = 0;
                        this.restore_easing_state();
                        break;
                        
                    case 'slide-up':
                        this.save_easing_state();
                        this.set_easing_duration(duration);
                        this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_CUBIC);
                        this.opacity = 255;
                        this.translation_y = 0;
                        this.restore_easing_state();
                        break;
                        
                    case 'flip-down':
                        this.save_easing_state();
                        this.set_easing_duration(duration);
                        this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_CUBIC);
                        this.opacity = 255;
                        this.translation_y = 0;
                        this.restore_easing_state();
                        break;
                        
                    case 'flip-up':
                        this.save_easing_state();
                        this.set_easing_duration(duration);
                        this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_CUBIC);
                        this.opacity = 255;
                        this.translation_y = 0;
                        this.restore_easing_state();
                        break;
                        
                    case 'zoom':
                        this.save_easing_state();
                        this.set_easing_duration(duration);
                        this.set_easing_mode(Clutter.AnimationMode.EASE_OUT_CUBIC);
                        this.opacity = 255;
                        this.restore_easing_state();
                        break;
                }
                
                // Wait for animation to complete
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, duration + 50, () => {
                    this._isAnimating = false;
                    this._visible = true;
                    console.log(`PromptWindow: ${type} show animation completed`);
                    resolve();
                    return false;
                });
                
                return false;
            });
        });
    }
    
    _animateHide() {
        if (!this._animationSettings.enabled || this._animationSettings.type === 'none') {
            // No animation, hide immediately
            this._visible = false;
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            this._isAnimating = true;
            const duration = this._animationSettings.duration;
            const type = this._animationSettings.type;
            
            console.log(`PromptWindow: Starting ${type} hide animation (${duration}ms)`);
            
            switch (type) {
                case 'fade':
                    this.save_easing_state();
                    this.set_easing_duration(duration);
                    this.set_easing_mode(Clutter.AnimationMode.EASE_IN_CUBIC);
                    this.opacity = 0;
                    this.restore_easing_state();
                    break;
                    
                case 'slide-down':
                    this.save_easing_state();
                    this.set_easing_duration(duration);
                    this.set_easing_mode(Clutter.AnimationMode.EASE_IN_CUBIC);
                    this.opacity = 0;
                    this.translation_y = -50;
                    this.restore_easing_state();
                    break;
                    
                case 'slide-up':
                    this.save_easing_state();
                    this.set_easing_duration(duration);
                    this.set_easing_mode(Clutter.AnimationMode.EASE_IN_CUBIC);
                    this.opacity = 0;
                    this.translation_y = 50;
                    this.restore_easing_state();
                    break;
                    
                case 'flip-down':
                    this.save_easing_state();
                    this.set_easing_duration(duration);
                    this.set_easing_mode(Clutter.AnimationMode.EASE_IN_CUBIC);
                    this.opacity = 0;
                    this.translation_y = -30;
                    this.restore_easing_state();
                    break;
                    
                case 'flip-up':
                    this.save_easing_state();
                    this.set_easing_duration(duration);
                    this.set_easing_mode(Clutter.AnimationMode.EASE_IN_CUBIC);
                    this.opacity = 0;
                    this.translation_y = 30;
                    this.restore_easing_state();
                    break;
                    
                case 'zoom':
                    this.save_easing_state();
                    this.set_easing_duration(duration);
                    this.set_easing_mode(Clutter.AnimationMode.EASE_IN_CUBIC);
                    this.opacity = 0;
                    this.restore_easing_state();
                    break;
            }
            
            // Wait for animation to complete
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, duration + 50, () => {
                this._isAnimating = false;
                this._visible = false;
                console.log(`PromptWindow: ${type} hide animation completed`);
                resolve();
                return false;
            });
        });
    }
    
    _onKeyPress(event) {
        const symbol = event.get_key_symbol();
        
        switch (symbol) {
            case Clutter.KEY_Escape:
                this.hide();
                return Clutter.EVENT_STOP;
        }
        
        return Clutter.EVENT_PROPAGATE;
    }
    
    _loadPrompts() {
        try {
            console.log('PromptWindow: Loading prompts');
            this._prompts = this._promptManager.getAllPrompts();
            console.log(`PromptWindow: Loaded ${this._prompts.length} prompts`);
            this._filteredPrompts = this._prompts;
            
            // Update filters and display
            this._updateFilters();
            this._applyFilters();
            this._updateStats();
            
            console.log('PromptWindow: Prompts loaded successfully');
        } catch (error) {
            console.error('PromptWindow: Error loading prompts:', error);
            this._prompts = [];
            this._filteredPrompts = [];
        }
    }
    
    _updateFilters() {
        const categories = this._promptManager.getCategories();
        
        // Update AI Model filters
        this._updateFilterButtons(this._aiModelContainer, categories.aiModels, 'aiModel');
        
        // Update Application filters
        this._updateFilterButtons(this._applicationContainer, categories.applications, 'application');
    }
    
    _updateFilterButtons(container, items, filterType) {
        container.destroy_all_children();
        
        items.forEach(item => {
            const button = new St.Button({
                style_class: 'sidebar-filter-button',
                label: item,
                can_focus: true,
            });
            
            button.connect('clicked', () => {
                // Toggle filter
                if (this._selectedFilters[filterType] === item) {
                    this._selectedFilters[filterType] = null;
                    button.remove_style_pseudo_class('checked');
                } else {
                    // Remove previous selection
                    const prevSelected = container.get_children().find(
                        child => child.has_style_pseudo_class('checked')
                    );
                    if (prevSelected) {
                        prevSelected.remove_style_pseudo_class('checked');
                    }
                    
                    this._selectedFilters[filterType] = item;
                    button.add_style_pseudo_class('checked');
                }
                
                this._applyFilters();
            });
            
            container.add_child(button);
        });
    }
    
    _filterPrompts(type) {
        // Reset all filters first
        this._selectedFilters = {
            aiModel: null,
            application: null,
            showFavorites: false,
            showRecent: false,
        };
        
        // Clear search
        this._searchEntry.set_text('');
        this._searchQuery = '';
        
        // Remove visual selection from sidebar buttons
        this._clearSidebarSelection();
        
        switch (type) {
            case 'all':
                this._allButton.add_style_pseudo_class('checked');
                break;
            case 'recent':
                this._selectedFilters.showRecent = true;
                this._recentButton.add_style_pseudo_class('checked');
                break;
            case 'favorites':
                this._selectedFilters.showFavorites = true;
                this._favoritesButton.add_style_pseudo_class('checked');
                break;
        }
        
        this._applyFilters();
    }
    
    _clearSidebarSelection() {
        [this._allButton, this._recentButton, this._favoritesButton].forEach(button => {
            button.remove_style_pseudo_class('checked');
        });
        
        // Clear filter buttons
        [this._aiModelContainer, this._applicationContainer].forEach(container => {
            container.get_children().forEach(button => {
                button.remove_style_pseudo_class('checked');
            });
        });
    }
    
    _applyFilters() {
        let filtered = this._prompts;
        
        // Apply special filters first
        if (this._selectedFilters.showRecent) {
            filtered = this._promptManager.getRecentPrompts();
        } else if (this._selectedFilters.showFavorites) {
            filtered = this._promptManager.getFavoritePrompts();
        }
        
        // Apply search and category filters
        if (this._searchQuery || this._selectedFilters.aiModel || this._selectedFilters.application) {
            filtered = this._promptManager.searchPrompts(this._searchQuery, {
                aiModel: this._selectedFilters.aiModel,
                application: this._selectedFilters.application,
            });
        }
        
        this._filteredPrompts = filtered;
        this._displayPrompts();
        this._updateStatus();
    }
    
    _displayPrompts() {
        this._promptsContainer.destroy_all_children();
        
        if (this._filteredPrompts.length === 0) {
            const emptyLabel = new St.Label({
                text: 'No prompts found',
                style_class: 'prompt-library-empty',
            });
            this._promptsContainer.add_child(emptyLabel);
            return;
        }
        
        // Create grid or list layout based on settings
        const layout = this._settings.get_string('prompt-card-layout');
        const cardsPerRow = this._settings.get_int('cards-per-row');
        
        if (layout === 'grid') {
            this._displayPromptsGrid(cardsPerRow);
        } else {
            this._displayPromptsList();
        }
    }
    
    _displayPromptsList() {
        this._filteredPrompts.forEach(prompt => {
            const card = new PromptCard(prompt, this);
            this._promptsContainer.add_child(card);
        });
    }
    
    _displayPromptsGrid(cardsPerRow) {
        let currentRow = null;
        const availableWidth = this._windowWidth - 220 - 48 - 24; // sidebar width - padding - margins
        const cardWidth = Math.floor(availableWidth / cardsPerRow) - 16; // spacing between cards
        
        this._filteredPrompts.forEach((prompt, index) => {
            if (index % cardsPerRow === 0) {
                currentRow = new St.BoxLayout({
                    style_class: 'prompts-row',
                });
                this._promptsContainer.add_child(currentRow);
            }
            
            const card = new PromptCard(prompt, this);
            card.set_width(cardWidth);
            currentRow.add_child(card);
        });
    }
    
    _updateStatus() {
        const total = this._prompts.length;
        const filtered = this._filteredPrompts.length;
        
        let statusText = `Showing ${filtered} of ${total} prompts`;
        
        if (this._searchQuery) {
            statusText += ` (search: "${this._searchQuery}")`;
        }
        
        this._statusLabel.set_text(statusText);
    }
    
    _updateStats() {
        const stats = this._promptManager.getStatistics();
        const statsText = `Total: ${stats.total} | Custom: ${stats.custom} | Favorites: ${stats.favorites}`;
        this._statsLabel.set_text(statsText);
    }
    
    _onAddNewPrompt() {
        // TODO: Implement prompt editor dialog
        console.log('Add new prompt clicked');
    }
    
    _onImport() {
        // TODO: Implement import dialog
        console.log('Import clicked');
    }
    
    _onExport() {
        // TODO: Implement export dialog
        console.log('Export clicked');
    }
    
    _deletePrompt(promptId) {
        this._promptManager.deletePrompt(promptId);
        this._loadPrompts(); // Refresh display
    }
    
    // Public methods
    show(filter = null) {
        // Guard against recursive calls
        if (this._isOpening || this._isAnimating) {
            console.log('PromptWindow: Already opening/animating, ignoring show() call');
            return;
        }
        
        console.log('PromptWindow: Starting show() method');
        this._isOpening = true;
        
        try {
            console.log('PromptWindow: Making visible');
            super.show(); // Make widget visible first
            
            // Start animation
            this._animateShow().then(() => {
                console.log('PromptWindow: Show animation completed');
                
                if (filter) {
                    console.log(`PromptWindow: Applying filter: ${filter}`);
                    this._filterPrompts(filter);
                }
                
                // Focus search entry after animation completes
                GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                    try {
                        console.log('PromptWindow: Focusing search entry');
                        if (this._searchEntry && this.get_stage()) {
                            this._searchEntry.grab_key_focus();
                        }
                    } catch (error) {
                        console.error('PromptWindow: Error focusing search entry:', error);
                    }
                    return false; // Don't repeat
                });
            });
            
            console.log('PromptWindow: Show completed successfully');
        } catch (error) {
            console.error('PromptWindow: Error in show():', error);
            this._isOpening = false;
            throw error;
        } finally {
            // Reset the flag after a short delay
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                this._isOpening = false;
                console.log('PromptWindow: Reset _isOpening flag');
                return false; // Don't repeat the timeout
            });
        }
    }
    
    hide() {
        if (this._isAnimating) {
            console.log('PromptWindow: Animation in progress, ignoring hide() call');
            return;
        }
        
        console.log('PromptWindow: Starting hide animation');
        this._isOpening = false;
        
        this._animateHide().then(() => {
            console.log('PromptWindow: Hide animation completed, hiding widget');
            super.hide(); // Hide the widget after animation completes
            this._extension._indicator?.setActive(false);
            
            // Mark as disposed in the extension so it gets recreated next time
            this._extension._windowDisposed = true;
        });
    }
    
    get visible() {
        return this._visible; // Use internal tracking instead
    }
    
    destroy() {
        console.log('PromptWindow: Destroying popup');
        Main.layoutManager.removeChrome(this);
        this._clipboardManager.destroy();
        super.destroy();
    }
}); 