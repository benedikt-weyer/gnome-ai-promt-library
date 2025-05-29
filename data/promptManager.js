import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {DefaultPrompts} from './defaultPrompts.js';

export class PromptManager {
    constructor(extension) {
        this._extension = extension;
        this._prompts = new Map();
        this._recentPrompts = [];
        this._favorites = new Set();
        this._dataDir = null;
        this._dataFile = null;
        this._backupDir = null;
        
        this._initializeDataStorage();
        this._loadPrompts();
    }
    
    _initializeDataStorage() {
        // Get user config directory
        this._dataDir = GLib.build_filenamev([
            GLib.get_user_config_dir(),
            'gnome-shell',
            'extensions',
            'ai-prompt-library'
        ]);
        
        // Ensure directory exists
        let dataDir = Gio.File.new_for_path(this._dataDir);
        if (!dataDir.query_exists(null)) {
            try {
                dataDir.make_directory_with_parents(null);
            } catch (error) {
                console.error('Failed to create data directory:', error);
            }
        }
        
        // Set up file paths
        this._dataFile = GLib.build_filenamev([this._dataDir, 'prompts.json']);
        this._backupDir = GLib.build_filenamev([this._dataDir, 'backups']);
        
        // Ensure backup directory exists
        let backupDir = Gio.File.new_for_path(this._backupDir);
        if (!backupDir.query_exists(null)) {
            try {
                backupDir.make_directory_with_parents(null);
            } catch (error) {
                console.error('Failed to create backup directory:', error);
            }
        }
    }
    
    _loadPrompts() {
        try {
            let file = Gio.File.new_for_path(this._dataFile);
            
            if (file.query_exists(null)) {
                let [success, contents] = file.load_contents(null);
                if (success) {
                    let data = JSON.parse(new TextDecoder().decode(contents));
                    this._parseLoadedData(data);
                    console.log(`Loaded ${this._prompts.size} prompts from storage`);
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading prompts:', error);
        }
        
        // If loading fails or no file exists, load default prompts
        this._loadDefaultPrompts();
    }
    
    _parseLoadedData(data) {
        if (data.prompts) {
            data.prompts.forEach(prompt => {
                this._prompts.set(prompt.id, prompt);
            });
        }
        
        if (data.recentPrompts) {
            this._recentPrompts = data.recentPrompts;
        }
        
        if (data.favorites) {
            this._favorites = new Set(data.favorites);
        }
    }
    
    _loadDefaultPrompts() {
        console.log('Loading default prompts...');
        const defaultPrompts = DefaultPrompts.getAll();
        
        defaultPrompts.forEach(prompt => {
            this._prompts.set(prompt.id, prompt);
        });
        
        this._savePrompts();
        console.log(`Loaded ${defaultPrompts.length} default prompts`);
    }
    
    _savePrompts() {
        try {
            this._createBackup();
            
            const data = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                prompts: Array.from(this._prompts.values()),
                recentPrompts: this._recentPrompts,
                favorites: Array.from(this._favorites)
            };
            
            let file = Gio.File.new_for_path(this._dataFile);
            let contents = JSON.stringify(data, null, 2);
            file.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
            
        } catch (error) {
            console.error('Error saving prompts:', error);
        }
    }
    
    _createBackup() {
        try {
            let sourceFile = Gio.File.new_for_path(this._dataFile);
            if (!sourceFile.query_exists(null)) return;
            
            let timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            let backupPath = GLib.build_filenamev([
                this._backupDir,
                `prompts-${timestamp}.json`
            ]);
            let backupFile = Gio.File.new_for_path(backupPath);
            
            sourceFile.copy(backupFile, Gio.FileCopyFlags.OVERWRITE, null, null);
            
            // Clean up old backups (keep last 10)
            this._cleanupOldBackups();
            
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }
    
    _cleanupOldBackups() {
        try {
            let backupDir = Gio.File.new_for_path(this._backupDir);
            let enumerator = backupDir.enumerate_children(
                'standard::name,time::modified',
                Gio.FileQueryInfoFlags.NONE,
                null
            );
            
            let backups = [];
            let fileInfo;
            while ((fileInfo = enumerator.next_file(null)) !== null) {
                let name = fileInfo.get_name();
                if (name.startsWith('prompts-') && name.endsWith('.json')) {
                    backups.push({
                        name: name,
                        modified: fileInfo.get_modification_date_time()
                    });
                }
            }
            
            // Sort by modification time (newest first)
            backups.sort((a, b) => b.modified.compare(a.modified));
            
            // Remove old backups (keep last 10)
            for (let i = 10; i < backups.length; i++) {
                try {
                    let oldBackup = Gio.File.new_for_path(
                        GLib.build_filenamev([this._backupDir, backups[i].name])
                    );
                    oldBackup.delete(null);
                } catch (error) {
                    console.error('Error deleting old backup:', error);
                }
            }
            
        } catch (error) {
            console.error('Error cleaning up backups:', error);
        }
    }
    
    // Public API
    getAllPrompts() {
        return Array.from(this._prompts.values());
    }
    
    getPrompt(id) {
        return this._prompts.get(id);
    }
    
    addPrompt(promptData) {
        const prompt = {
            id: this._generateId(),
            title: promptData.title || 'Untitled Prompt',
            description: promptData.description || '',
            content: promptData.content || '',
            category: {
                aiModel: promptData.category?.aiModel || 'Other',
                application: promptData.category?.application || 'Other'
            },
            tags: promptData.tags || [],
            isCustom: true,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            usageCount: 0
        };
        
        this._prompts.set(prompt.id, prompt);
        this._savePrompts();
        return prompt;
    }
    
    updatePrompt(id, updates) {
        let prompt = this._prompts.get(id);
        if (!prompt) return null;
        
        // Update fields
        Object.assign(prompt, updates);
        prompt.dateModified = new Date().toISOString();
        
        this._savePrompts();
        return prompt;
    }
    
    deletePrompt(id) {
        if (this._prompts.has(id)) {
            this._prompts.delete(id);
            this._favorites.delete(id);
            this._recentPrompts = this._recentPrompts.filter(recentId => recentId !== id);
            this._savePrompts();
            return true;
        }
        return false;
    }
    
    markAsUsed(id) {
        let prompt = this._prompts.get(id);
        if (!prompt) return;
        
        prompt.usageCount++;
        prompt.lastUsed = new Date().toISOString();
        
        // Update recent prompts
        this._recentPrompts = this._recentPrompts.filter(recentId => recentId !== id);
        this._recentPrompts.unshift(id);
        
        // Keep only the most recent prompts
        const maxRecent = this._extension.getExtensionSettings()?.get_int('max-recent-prompts') || 10;
        if (this._recentPrompts.length > maxRecent) {
            this._recentPrompts = this._recentPrompts.slice(0, maxRecent);
        }
        
        this._savePrompts();
    }
    
    toggleFavorite(id) {
        if (this._favorites.has(id)) {
            this._favorites.delete(id);
        } else {
            this._favorites.add(id);
        }
        this._savePrompts();
        return this._favorites.has(id);
    }
    
    getRecentPrompts() {
        return this._recentPrompts
            .map(id => this._prompts.get(id))
            .filter(prompt => prompt !== undefined);
    }
    
    getFavoritePrompts() {
        return Array.from(this._favorites)
            .map(id => this._prompts.get(id))
            .filter(prompt => prompt !== undefined);
    }
    
    searchPrompts(query, filters = {}) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const prompt of this._prompts.values()) {
            // Apply filters first
            if (filters.aiModel && prompt.category.aiModel !== filters.aiModel) continue;
            if (filters.application && prompt.category.application !== filters.application) continue;
            if (filters.isCustom !== undefined && prompt.isCustom !== filters.isCustom) continue;
            if (filters.tags && !filters.tags.some(tag => prompt.tags.includes(tag))) continue;
            
            // Apply text search
            if (query) {
                const searchText = [
                    prompt.title,
                    prompt.description,
                    prompt.content,
                    ...prompt.tags
                ].join(' ').toLowerCase();
                
                if (!searchText.includes(queryLower)) continue;
            }
            
            results.push(prompt);
        }
        
        // Sort results by relevance (usage count, then by last used)
        results.sort((a, b) => {
            if (a.usageCount !== b.usageCount) {
                return b.usageCount - a.usageCount;
            }
            if (a.lastUsed && b.lastUsed) {
                return new Date(b.lastUsed) - new Date(a.lastUsed);
            }
            return new Date(b.dateCreated) - new Date(a.dateCreated);
        });
        
        return results;
    }
    
    exportData(format = 'json') {
        const data = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            prompts: Array.from(this._prompts.values()),
            recentPrompts: this._recentPrompts,
            favorites: Array.from(this._favorites)
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this._exportAsCSV(data.prompts);
            case 'markdown':
                return this._exportAsMarkdown(data.prompts);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    _exportAsCSV(prompts) {
        const headers = ['Title', 'Description', 'AI Model', 'Application', 'Tags', 'Content'];
        const rows = [headers.join(',')];
        
        prompts.forEach(prompt => {
            const row = [
                `"${prompt.title.replace(/"/g, '""')}"`,
                `"${prompt.description.replace(/"/g, '""')}"`,
                `"${prompt.category.aiModel}"`,
                `"${prompt.category.application}"`,
                `"${prompt.tags.join('; ')}"`,
                `"${prompt.content.replace(/"/g, '""')}"`
            ];
            rows.push(row.join(','));
        });
        
        return rows.join('\n');
    }
    
    _exportAsMarkdown(prompts) {
        let md = '# AI Prompt Library\n\n';
        md += `Exported on ${new Date().toLocaleDateString()}\n\n`;
        
        // Group by AI model
        const groupedPrompts = {};
        prompts.forEach(prompt => {
            const model = prompt.category.aiModel;
            if (!groupedPrompts[model]) {
                groupedPrompts[model] = [];
            }
            groupedPrompts[model].push(prompt);
        });
        
        Object.keys(groupedPrompts).forEach(model => {
            md += `## ${model}\n\n`;
            
            groupedPrompts[model].forEach(prompt => {
                md += `### ${prompt.title}\n\n`;
                if (prompt.description) {
                    md += `${prompt.description}\n\n`;
                }
                md += `**Application:** ${prompt.category.application}\n\n`;
                if (prompt.tags.length > 0) {
                    md += `**Tags:** ${prompt.tags.join(', ')}\n\n`;
                }
                md += '```\n';
                md += prompt.content;
                md += '\n```\n\n';
                md += '---\n\n';
            });
        });
        
        return md;
    }
    
    importData(data, mergeStrategy = 'skip') {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            let imported = 0;
            let skipped = 0;
            let updated = 0;
            
            if (parsed.prompts) {
                parsed.prompts.forEach(prompt => {
                    const existing = this._prompts.get(prompt.id);
                    
                    if (existing) {
                        if (mergeStrategy === 'overwrite') {
                            this._prompts.set(prompt.id, prompt);
                            updated++;
                        } else {
                            skipped++;
                        }
                    } else {
                        this._prompts.set(prompt.id, prompt);
                        imported++;
                    }
                });
            }
            
            this._savePrompts();
            
            return {
                imported,
                skipped,
                updated,
                total: imported + skipped + updated
            };
        } catch (error) {
            throw new Error(`Failed to import data: ${error.message}`);
        }
    }
    
    _generateId() {
        return 'prompt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    getCategories() {
        const aiModels = new Set();
        const applications = new Set();
        
        this._prompts.forEach(prompt => {
            aiModels.add(prompt.category.aiModel);
            applications.add(prompt.category.application);
        });
        
        return {
            aiModels: Array.from(aiModels).sort(),
            applications: Array.from(applications).sort()
        };
    }
    
    getStatistics() {
        const total = this._prompts.size;
        const custom = Array.from(this._prompts.values()).filter(p => p.isCustom).length;
        const favorites = this._favorites.size;
        const mostUsed = Array.from(this._prompts.values())
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 5);
        
        return {
            total,
            custom,
            default: total - custom,
            favorites,
            recent: this._recentPrompts.length,
            mostUsed
        };
    }
    
    destroy() {
        // Save any pending changes
        this._savePrompts();
        
        // Clear references
        this._prompts.clear();
        this._recentPrompts = [];
        this._favorites.clear();
        this._extension = null;
    }
} 