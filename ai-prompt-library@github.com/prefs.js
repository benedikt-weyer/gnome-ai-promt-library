import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class AIPromptLibraryPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        
        // General page
        const generalPage = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'preferences-system-symbolic',
        });
        window.add(generalPage);
        
        // Appearance group
        const appearanceGroup = new Adw.PreferencesGroup({
            title: _('Appearance'),
            description: _('Customize the appearance of the prompt library'),
        });
        generalPage.add(appearanceGroup);
        
        // Window size settings
        const windowWidthRow = new Adw.SpinRow({
            title: _('Window Width'),
            subtitle: _('Width of the prompt library window'),
            adjustment: new Gtk.Adjustment({
                lower: 400,
                upper: 1600,
                step_increment: 50,
                page_increment: 100,
            }),
        });
        settings.bind('window-width', windowWidthRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        appearanceGroup.add(windowWidthRow);
        
        const windowHeightRow = new Adw.SpinRow({
            title: _('Window Height'),
            subtitle: _('Height of the prompt library window'),
            adjustment: new Gtk.Adjustment({
                lower: 300,
                upper: 1200,
                step_increment: 50,
                page_increment: 100,
            }),
        });
        settings.bind('window-height', windowHeightRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        appearanceGroup.add(windowHeightRow);
        
        // Layout settings
        const layoutRow = new Adw.ComboRow({
            title: _('Card Layout'),
            subtitle: _('How prompt cards are displayed'),
        });
        const layoutModel = new Gtk.StringList();
        layoutModel.append(_('Grid'));
        layoutModel.append(_('List'));
        layoutRow.model = layoutModel;
        layoutRow.selected = settings.get_string('prompt-card-layout') === 'grid' ? 0 : 1;
        layoutRow.connect('notify::selected', () => {
            const value = layoutRow.selected === 0 ? 'grid' : 'list';
            settings.set_string('prompt-card-layout', value);
        });
        appearanceGroup.add(layoutRow);
        
        const cardsPerRowRow = new Adw.SpinRow({
            title: _('Cards per Row'),
            subtitle: _('Number of cards per row in grid layout'),
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 6,
                step_increment: 1,
                page_increment: 1,
            }),
        });
        settings.bind('cards-per-row', cardsPerRowRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        appearanceGroup.add(cardsPerRowRow);
        
        // Behavior group
        const behaviorGroup = new Adw.PreferencesGroup({
            title: _('Behavior'),
            description: _('Configure how the extension behaves'),
        });
        generalPage.add(behaviorGroup);
        
        const autoCloseRow = new Adw.SwitchRow({
            title: _('Auto-close on Copy'),
            subtitle: _('Automatically close the library window after copying a prompt'),
        });
        settings.bind('auto-close-on-copy', autoCloseRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        behaviorGroup.add(autoCloseRow);
        
        const notificationsRow = new Adw.SwitchRow({
            title: _('Show Notifications'),
            subtitle: _('Show notifications when prompts are copied'),
        });
        settings.bind('show-notifications', notificationsRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        behaviorGroup.add(notificationsRow);
        
        // Default values group
        const defaultsGroup = new Adw.PreferencesGroup({
            title: _('Defaults'),
            description: _('Default values for new prompts'),
        });
        generalPage.add(defaultsGroup);
        
        const defaultAIModelRow = new Adw.ComboRow({
            title: _('Default AI Model'),
            subtitle: _('Default AI model when creating new prompts'),
        });
        const aiModelList = new Gtk.StringList();
        ['ChatGPT', 'Claude', 'Gemini', 'Other'].forEach(model => {
            aiModelList.append(model);
        });
        defaultAIModelRow.model = aiModelList;
        const currentAIModel = settings.get_string('default-ai-model');
        defaultAIModelRow.selected = Math.max(0, ['ChatGPT', 'Claude', 'Gemini', 'Other'].indexOf(currentAIModel));
        defaultAIModelRow.connect('notify::selected', () => {
            const models = ['ChatGPT', 'Claude', 'Gemini', 'Other'];
            settings.set_string('default-ai-model', models[defaultAIModelRow.selected]);
        });
        defaultsGroup.add(defaultAIModelRow);
        
        const defaultApplicationRow = new Adw.ComboRow({
            title: _('Default Application'),
            subtitle: _('Default application category when creating new prompts'),
        });
        const appList = new Gtk.StringList();
        ['Coding', 'Writing', 'Analysis', 'Creative', 'Business', 'Other'].forEach(app => {
            appList.append(app);
        });
        defaultApplicationRow.model = appList;
        const currentApp = settings.get_string('default-application');
        defaultApplicationRow.selected = Math.max(0, ['Coding', 'Writing', 'Analysis', 'Creative', 'Business', 'Other'].indexOf(currentApp));
        defaultApplicationRow.connect('notify::selected', () => {
            const apps = ['Coding', 'Writing', 'Analysis', 'Creative', 'Business', 'Other'];
            settings.set_string('default-application', apps[defaultApplicationRow.selected]);
        });
        defaultsGroup.add(defaultApplicationRow);
        
        // Keybindings page
        const keybindingsPage = new Adw.PreferencesPage({
            title: _('Keybindings'),
            icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic',
        });
        window.add(keybindingsPage);
        
        const keybindingsGroup = new Adw.PreferencesGroup({
            title: _('Keyboard Shortcuts'),
            description: _('Configure keyboard shortcuts for quick access'),
        });
        keybindingsPage.add(keybindingsGroup);
        
        // Toggle library shortcut
        const toggleShortcutRow = new Adw.ActionRow({
            title: _('Toggle Library'),
            subtitle: _('Show/hide the prompt library window'),
        });
        const toggleShortcutButton = new Gtk.Button({
            label: this._getShortcutLabel(settings, 'toggle-library-shortcut'),
            valign: Gtk.Align.CENTER,
        });
        toggleShortcutButton.get_style_context().add_class('flat');
        toggleShortcutButton.connect('clicked', () => {
            this._showShortcutDialog(window, settings, 'toggle-library-shortcut', toggleShortcutButton);
        });
        toggleShortcutRow.add_suffix(toggleShortcutButton);
        keybindingsGroup.add(toggleShortcutRow);
        
        // Quick copy last shortcut
        const quickCopyShortcutRow = new Adw.ActionRow({
            title: _('Quick Copy Last'),
            subtitle: _('Copy the most recently used prompt'),
        });
        const quickCopyShortcutButton = new Gtk.Button({
            label: this._getShortcutLabel(settings, 'quick-copy-last-shortcut'),
            valign: Gtk.Align.CENTER,
        });
        quickCopyShortcutButton.get_style_context().add_class('flat');
        quickCopyShortcutButton.connect('clicked', () => {
            this._showShortcutDialog(window, settings, 'quick-copy-last-shortcut', quickCopyShortcutButton);
        });
        quickCopyShortcutRow.add_suffix(quickCopyShortcutButton);
        keybindingsGroup.add(quickCopyShortcutRow);
        
        // Data page
        const dataPage = new Adw.PreferencesPage({
            title: _('Data'),
            icon_name: 'folder-download-symbolic',
        });
        window.add(dataPage);
        
        const dataGroup = new Adw.PreferencesGroup({
            title: _('Data Management'),
            description: _('Manage your prompt library data'),
        });
        dataPage.add(dataGroup);
        
        const maxRecentRow = new Adw.SpinRow({
            title: _('Maximum Recent Prompts'),
            subtitle: _('Number of recent prompts to keep track of'),
            adjustment: new Gtk.Adjustment({
                lower: 5,
                upper: 50,
                step_increment: 1,
                page_increment: 5,
            }),
        });
        settings.bind('max-recent-prompts', maxRecentRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        dataGroup.add(maxRecentRow);
        
        const exportFormatRow = new Adw.ComboRow({
            title: _('Default Export Format'),
            subtitle: _('Default format for exporting prompt library data'),
        });
        const exportFormatList = new Gtk.StringList();
        ['JSON', 'CSV', 'Markdown'].forEach(format => {
            exportFormatList.append(format);
        });
        exportFormatRow.model = exportFormatList;
        const currentFormat = settings.get_string('export-format');
        exportFormatRow.selected = Math.max(0, ['json', 'csv', 'markdown'].indexOf(currentFormat));
        exportFormatRow.connect('notify::selected', () => {
            const formats = ['json', 'csv', 'markdown'];
            settings.set_string('export-format', formats[exportFormatRow.selected]);
        });
        dataGroup.add(exportFormatRow);
        
        const backupFrequencyRow = new Adw.SpinRow({
            title: _('Backup Frequency'),
            subtitle: _('How often to create automatic backups (days)'),
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 30,
                step_increment: 1,
                page_increment: 7,
            }),
        });
        settings.bind('backup-frequency', backupFrequencyRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        dataGroup.add(backupFrequencyRow);
        
        // Advanced page
        const advancedPage = new Adw.PreferencesPage({
            title: _('Advanced'),
            icon_name: 'applications-engineering-symbolic',
        });
        window.add(advancedPage);
        
        const advancedGroup = new Adw.PreferencesGroup({
            title: _('Advanced Settings'),
            description: _('Advanced configuration options'),
        });
        advancedPage.add(advancedGroup);
        
        const debugModeRow = new Adw.SwitchRow({
            title: _('Debug Mode'),
            subtitle: _('Enable debug logging and additional development features'),
        });
        settings.bind('debug-mode', debugModeRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        advancedGroup.add(debugModeRow);
        
        const analyticsRow = new Adw.SwitchRow({
            title: _('Enable Analytics'),
            subtitle: _('Track prompt usage for analytics and recommendations'),
        });
        settings.bind('enable-analytics', analyticsRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        advancedGroup.add(analyticsRow);
    }
    
    _getShortcutLabel(settings, key) {
        const shortcuts = settings.get_strv(key);
        if (shortcuts.length === 0) {
            return _('Not set');
        }
        return shortcuts[0];
    }
    
    _showShortcutDialog(parent, settings, key, button) {
        const dialog = new Adw.MessageDialog({
            transient_for: parent,
            heading: _('Set Keyboard Shortcut'),
            body: _('Press the key combination you want to use for this shortcut.'),
        });
        
        dialog.add_response('cancel', _('Cancel'));
        dialog.add_response('clear', _('Clear'));
        dialog.add_response('set', _('Set'));
        dialog.set_default_response('set');
        dialog.set_close_response('cancel');
        
        const controller = new Gtk.EventControllerKey();
        dialog.add_controller(controller);
        
        let keyPressed = false;
        let shortcut = '';
        
        controller.connect('key-pressed', (controller, keyval, keycode, state) => {
            if (keyPressed) return;
            
            const mask = state & Gtk.accelerator_get_default_mod_mask();
            if (mask === 0 && keyval === Gtk.KEY_Escape) {
                dialog.response('cancel');
                return;
            }
            
            if (keyval === Gtk.KEY_Return || keyval === Gtk.KEY_KP_Enter) {
                if (shortcut) {
                    dialog.response('set');
                } else {
                    dialog.response('cancel');
                }
                return;
            }
            
            if (Gtk.accelerator_valid(keyval, mask)) {
                shortcut = Gtk.accelerator_name(keyval, mask);
                dialog.set_body(`Shortcut: ${shortcut}\n\nPress Enter to confirm or Escape to cancel.`);
                keyPressed = true;
            }
        });
        
        dialog.connect('response', (dialog, response) => {
            if (response === 'set' && shortcut) {
                settings.set_strv(key, [shortcut]);
                button.set_label(shortcut);
            } else if (response === 'clear') {
                settings.set_strv(key, []);
                button.set_label(_('Not set'));
            }
            dialog.destroy();
        });
        
        dialog.show();
    }
} 