import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';

import {PromptWindow} from './ui/promptWindow.js';
import {PromptManager} from './data/promptManager.js';
import {KeybindingManager} from './utils/keybindings.js';

const AIPromptIndicator = GObject.registerClass(
class AIPromptIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'AI Prompt Library', false);
        
        this._extension = extension;
        
        // Create icon
        this._icon = new St.Icon({
            icon_name: 'document-text-symbolic',
            style_class: 'system-status-icon',
        });
        
        this.add_child(this._icon);
        
        // Create popup menu
        this._createMenu();
        
        // Connect click handler
        this.connect('button-press-event', this._onButtonPressed.bind(this));
    }
    
    _createMenu() {
        // Quick access menu items
        let recentItem = new PopupMenu.PopupMenuItem('Recent Prompts');
        recentItem.connect('activate', () => {
            // Close menu first to prevent multiple activations
            this.menu.close();
            this._extension.showPromptWindow('recent');
        });
        this.menu.addMenuItem(recentItem);
        
        let favoritesItem = new PopupMenu.PopupMenuItem('Favorites');
        favoritesItem.connect('activate', () => {
            // Close menu first to prevent multiple activations
            this.menu.close();
            this._extension.showPromptWindow('favorites');
        });
        this.menu.addMenuItem(favoritesItem);
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        let libraryItem = new PopupMenu.PopupMenuItem('Open Library');
        libraryItem.connect('activate', () => {
            // Close menu first to prevent multiple activations
            this.menu.close();
            this._extension.showPromptWindow();
        });
        this.menu.addMenuItem(libraryItem);
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        let prefsItem = new PopupMenu.PopupMenuItem('Preferences');
        prefsItem.connect('activate', () => {
            // Close menu first to prevent multiple activations
            this.menu.close();
            try {
                // Use command line to open preferences - most reliable method
                const uuid = this._extension.metadata.uuid;
                Gio.Subprocess.new(['gnome-extensions', 'prefs', uuid], Gio.SubprocessFlags.NONE);
            } catch (error) {
                console.error('Error opening preferences:', error);
                // Try alternative method with gnome-shell-extension-prefs
                try {
                    const uuid = this._extension.metadata.uuid;
                    Gio.Subprocess.new(['gnome-shell-extension-prefs', uuid], Gio.SubprocessFlags.NONE);
                } catch (fallbackError) {
                    console.error('All methods to open preferences failed:', fallbackError);
                }
            }
        });
        this.menu.addMenuItem(prefsItem);
    }
    
    _onButtonPressed(actor, event) {
        if (event.get_button() === 1) { // Left click
            // Let the menu system handle this normally
            // Don't call togglePromptWindow here
            return Clutter.EVENT_PROPAGATE;
        }
        return Clutter.EVENT_PROPAGATE;
    }
    
    setActive(active) {
        if (active) {
            this.add_style_pseudo_class('active');
        } else {
            this.remove_style_pseudo_class('active');
        }
    }
});

export default class AIPromptLibraryExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._indicator = null;
        this._promptWindow = null;
        this._promptManager = null;
        this._keybindingManager = null;
        this._settings = null;
        this._windowDisposed = false; // Track disposal state internally
    }
    
    enable() {
        console.log('Enabling AI Prompt Library extension...');
        
        try {
            // Initialize settings
            this._settings = this.getSettings();
            
            // Initialize data manager
            this._promptManager = new PromptManager(this);
            
            // Initialize keybinding manager
            this._keybindingManager = new KeybindingManager(this);
            
            // Create and add indicator to panel
            this._indicator = new AIPromptIndicator(this);
            Main.panel.addToStatusArea(this.uuid, this._indicator);
            
            // Initialize prompt window (but don't show it)
            this._promptWindow = new PromptWindow(this);
            
            console.log('AI Prompt Library extension enabled successfully');
        } catch (error) {
            console.error('Error enabling AI Prompt Library extension:', error);
        }
    }
    
    disable() {
        console.log('Disabling AI Prompt Library extension...');
        
        try {
            // Clean up keybindings
            if (this._keybindingManager) {
                this._keybindingManager.destroy();
                this._keybindingManager = null;
            }
            
            // Hide and destroy prompt window
            if (this._promptWindow && !this._windowDisposed) {
                try {
                    this._promptWindow.close();
                    this._promptWindow.destroy();
                } catch (error) {
                    console.error('Error destroying prompt window:', error);
                }
            }
            this._promptWindow = null;
            this._windowDisposed = false;
            
            // Remove indicator from panel
            if (this._indicator) {
                this._indicator.destroy();
                this._indicator = null;
            }
            
            // Clean up data manager
            if (this._promptManager) {
                this._promptManager.destroy();
                this._promptManager = null;
            }
            
            // Clean up settings
            this._settings = null;
            
            console.log('AI Prompt Library extension disabled successfully');
        } catch (error) {
            console.error('Error disabling AI Prompt Library extension:', error);
        }
    }
    
    showPromptWindow(filter = null) {
        // Check if the window needs to be recreated
        if (!this._promptWindow || this._windowDisposed) {
            console.log('Creating new PromptWindow instance');
            this._promptWindow = new PromptWindow(this);
            this._windowDisposed = false;
        }
        
        // Use try/catch to handle any remaining disposal issues
        try {
            if (!this._promptWindow.visible && !this._promptWindow._isOpening) {
                this._promptWindow.show(filter);
                this._indicator?.setActive(true);
            }
        } catch (error) {
            console.error('Error showing prompt window:', error);
            // Force recreation on next call
            this._windowDisposed = true;
            this._promptWindow = null;
        }
    }
    
    hidePromptWindow() {
        if (!this._promptWindow || this._windowDisposed) {
            return;
        }
        
        try {
            if (this._promptWindow.visible) {
                this._promptWindow.hide();
                this._indicator?.setActive(false);
            }
        } catch (error) {
            console.error('Error hiding prompt window:', error);
            // Mark as disposed since we can't interact with it
            this._windowDisposed = true;
            this._indicator?.setActive(false);
        }
    }
    
    togglePromptWindow() {
        // Recreate window if it doesn't exist or has been disposed
        if (!this._promptWindow || this._windowDisposed) {
            this.showPromptWindow();
            return;
        }
        
        // Use try/catch to safely check window state
        try {
            // Check if the window is currently visible or in the process of opening
            if (this._promptWindow.visible || this._promptWindow._isOpening) {
                this.hidePromptWindow();
            } else {
                this.showPromptWindow();
            }
        } catch (error) {
            console.error('Error in togglePromptWindow:', error);
            // Force recreation on next call
            this._windowDisposed = true;
            this._promptWindow = null;
            this.showPromptWindow();
        }
    }
    
    getPromptManager() {
        return this._promptManager;
    }
    
    getExtensionSettings() {
        return this._settings;
    }
} 