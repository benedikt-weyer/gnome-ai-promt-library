import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

export class KeybindingManager {
    constructor(extension) {
        this._extension = extension;
        this._settings = extension.getExtensionSettings();
        this._keyBindings = new Map();
        
        this._registerKeyBindings();
    }
    
    _registerKeyBindings() {
        // Register toggle library shortcut
        this._registerKeyBinding(
            'toggle-library-shortcut',
            this._onToggleLibrary.bind(this)
        );
        
        // Register quick copy last shortcut
        this._registerKeyBinding(
            'quick-copy-last-shortcut',
            this._onQuickCopyLast.bind(this)
        );
    }
    
    _registerKeyBinding(settingName, callback) {
        try {
            const accelerators = this._settings.get_strv(settingName);
            
            if (accelerators.length === 0) {
                console.log(`No accelerator defined for ${settingName}`);
                return;
            }
            
            // Create a unique action name
            const actionName = `ai-prompt-library-${settingName}`;
            
            // Add the keybinding
            Main.wm.addKeybinding(
                actionName,
                this._settings,
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
                callback
            );
            
            // Store the binding for cleanup
            this._keyBindings.set(settingName, actionName);
            
            console.log(`Registered keybinding: ${accelerators[0]} for ${settingName}`);
            
        } catch (error) {
            console.error(`Failed to register keybinding for ${settingName}:`, error);
        }
    }
    
    _onToggleLibrary() {
        console.log('Toggle library keybinding activated');
        try {
            this._extension.togglePromptWindow();
        } catch (error) {
            console.error('Error toggling prompt window:', error);
        }
    }
    
    _onQuickCopyLast() {
        console.log('Quick copy last keybinding activated');
        try {
            const promptManager = this._extension.getPromptManager();
            if (!promptManager) {
                console.warn('Prompt manager not available');
                return;
            }
            
            const recentPrompts = promptManager.getRecentPrompts();
            if (recentPrompts.length === 0) {
                this._showNotification('No recent prompts available', 'dialog-information-symbolic');
                return;
            }
            
            const lastPrompt = recentPrompts[0];
            this._copyToClipboard(lastPrompt.content);
            promptManager.markAsUsed(lastPrompt.id);
            
            this._showNotification(
                `Copied: ${lastPrompt.title}`, 
                'edit-copy-symbolic'
            );
            
        } catch (error) {
            console.error('Error in quick copy last:', error);
            this._showNotification('Failed to copy prompt', 'dialog-error-symbolic');
        }
    }
    
    _copyToClipboard(text) {
        try {
            // Get the clipboard from St
            const clipboard = St.Clipboard.get_default();
            clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
            
            // Also set to primary selection for middle-click paste
            clipboard.set_text(St.ClipboardType.PRIMARY, text);
            
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            throw error;
        }
    }
    
    _showNotification(message, iconName = 'dialog-information-symbolic') {
        try {
            const settings = this._extension.getExtensionSettings();
            if (!settings.get_boolean('show-notifications')) {
                return;
            }
            
            // Create notification
            const source = new MessageTray.Source('AI Prompt Library', iconName);
            Main.messageTray.add(source);
            
            const notification = new MessageTray.Notification(
                source,
                'AI Prompt Library',
                message
            );
            
            notification.setTransient(true);
            source.showNotification(notification);
            
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
    
    updateKeyBinding(settingName) {
        try {
            // Remove old binding if it exists
            const oldActionName = this._keyBindings.get(settingName);
            if (oldActionName) {
                Main.wm.removeKeybinding(oldActionName);
                this._keyBindings.delete(settingName);
            }
            
            // Register new binding
            const callback = this._getCallbackForSetting(settingName);
            if (callback) {
                this._registerKeyBinding(settingName, callback);
            }
            
        } catch (error) {
            console.error(`Error updating keybinding for ${settingName}:`, error);
        }
    }
    
    _getCallbackForSetting(settingName) {
        switch (settingName) {
            case 'toggle-library-shortcut':
                return this._onToggleLibrary.bind(this);
            case 'quick-copy-last-shortcut':
                return this._onQuickCopyLast.bind(this);
            default:
                console.warn(`Unknown keybinding setting: ${settingName}`);
                return null;
        }
    }
    
    destroy() {
        try {
            // Remove all registered keybindings
            for (const [settingName, actionName] of this._keyBindings) {
                try {
                    Main.wm.removeKeybinding(actionName);
                    console.log(`Removed keybinding: ${actionName}`);
                } catch (error) {
                    console.error(`Error removing keybinding ${actionName}:`, error);
                }
            }
            
            this._keyBindings.clear();
            this._settings = null;
            this._extension = null;
            
        } catch (error) {
            console.error('Error destroying KeybindingManager:', error);
        }
    }
} 