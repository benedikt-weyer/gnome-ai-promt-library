import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

export class ClipboardManager {
    constructor(extension) {
        this._extension = extension;
        this._settings = extension.getExtensionSettings();
    }
    
    copyText(text, showNotification = true, notificationTitle = null) {
        return new Promise((resolve, reject) => {
            try {
                // Get the clipboard
                const clipboard = St.Clipboard.get_default();
                
                // Copy to both clipboard types
                clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
                clipboard.set_text(St.ClipboardType.PRIMARY, text);
                
                if (showNotification) {
                    const title = notificationTitle || 'Copied to Clipboard';
                    this._showCopyNotification(title, text);
                }
                
                resolve(true);
                
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                if (showNotification) {
                    this._showErrorNotification('Failed to copy to clipboard');
                }
                reject(error);
            }
        });
    }
    
    copyPrompt(prompt) {
        const title = `Copied: ${prompt.title}`;
        return this.copyText(prompt.content, true, title);
    }
    
    getText() {
        return new Promise((resolve, reject) => {
            try {
                const clipboard = St.Clipboard.get_default();
                
                clipboard.get_text(St.ClipboardType.CLIPBOARD, (clipboard, text) => {
                    resolve(text || '');
                });
                
            } catch (error) {
                console.error('Error getting clipboard text:', error);
                reject(error);
            }
        });
    }
    
    _showCopyNotification(title, content) {
        try {
            if (!this._settings.get_boolean('show-notifications')) {
                return;
            }
            
            // Create a short preview of the content
            const preview = this._createContentPreview(content);
            
            const source = new MessageTray.Source(
                'AI Prompt Library',
                'edit-copy-symbolic'
            );
            
            Main.messageTray.add(source);
            
            const notification = new MessageTray.Notification(
                source,
                title,
                preview
            );
            
            // Make notification transient (auto-hide)
            notification.setTransient(true);
            
            // Show for a shorter time for copy operations
            notification.urgency = MessageTray.Urgency.LOW;
            
            source.showNotification(notification);
            
        } catch (error) {
            console.error('Error showing copy notification:', error);
        }
    }
    
    _showErrorNotification(message) {
        try {
            const source = new MessageTray.Source(
                'AI Prompt Library',
                'dialog-error-symbolic'
            );
            
            Main.messageTray.add(source);
            
            const notification = new MessageTray.Notification(
                source,
                'AI Prompt Library',
                message
            );
            
            notification.setTransient(true);
            notification.urgency = MessageTray.Urgency.HIGH;
            
            source.showNotification(notification);
            
        } catch (error) {
            console.error('Error showing error notification:', error);
        }
    }
    
    _createContentPreview(content) {
        if (!content) return '';
        
        // Remove extra whitespace and newlines
        const cleaned = content.replace(/\s+/g, ' ').trim();
        
        // Truncate if too long
        const maxLength = 80;
        if (cleaned.length <= maxLength) {
            return cleaned;
        }
        
        return cleaned.substring(0, maxLength - 3) + '...';
    }
    
    // Template variable substitution
    processTemplateVariables(content, variables = {}) {
        let processed = content;
        
        // Replace standard template variables
        const templateVars = {
            '[INSERT CODE HERE]': variables.code || '[INSERT CODE HERE]',
            '[INSERT TOPIC]': variables.topic || '[INSERT TOPIC]',
            '[INSERT TEXT HERE]': variables.text || '[INSERT TEXT HERE]',
            '[DESCRIBE AUDIENCE]': variables.audience || '[DESCRIBE AUDIENCE]',
            '[SPECIFY LANGUAGE]': variables.language || '[SPECIFY LANGUAGE]',
            ...variables
        };
        
        // Perform replacements
        for (const [placeholder, value] of Object.entries(templateVars)) {
            processed = processed.replace(new RegExp(this._escapeRegExp(placeholder), 'g'), value);
        }
        
        return processed;
    }
    
    _escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Format content for specific AI models
    formatForAIModel(content, aiModel) {
        switch (aiModel.toLowerCase()) {
            case 'chatgpt':
                return this._formatForChatGPT(content);
            case 'claude':
                return this._formatForClaude(content);
            case 'gemini':
                return this._formatForGemini(content);
            default:
                return content;
        }
    }
    
    _formatForChatGPT(content) {
        // ChatGPT formatting (standard format)
        return content;
    }
    
    _formatForClaude(content) {
        // Claude prefers clear structure and explicit instructions
        if (!content.includes('Please') && !content.includes('Help')) {
            return `Please help me with the following:\n\n${content}`;
        }
        return content;
    }
    
    _formatForGemini(content) {
        // Gemini formatting (similar to ChatGPT but can handle more context)
        return content;
    }
    
    // Utility functions for common copy operations
    copyWithVariables(content, variables = {}, showNotification = true) {
        const processed = this.processTemplateVariables(content, variables);
        return this.copyText(processed, showNotification);
    }
    
    copyFormatted(content, aiModel, variables = {}, showNotification = true) {
        const processed = this.processTemplateVariables(content, variables);
        const formatted = this.formatForAIModel(processed, aiModel);
        return this.copyText(formatted, showNotification);
    }
    
    destroy() {
        this._extension = null;
        this._settings = null;
    }
}

// Static utility functions
export function copyToClipboard(text) {
    try {
        const clipboard = St.Clipboard.get_default();
        clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
        clipboard.set_text(St.ClipboardType.PRIMARY, text);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
}

export function getClipboardText() {
    return new Promise((resolve, reject) => {
        try {
            const clipboard = St.Clipboard.get_default();
            clipboard.get_text(St.ClipboardType.CLIPBOARD, (clipboard, text) => {
                resolve(text || '');
            });
        } catch (error) {
            console.error('Error getting clipboard text:', error);
            reject(error);
        }
    });
} 