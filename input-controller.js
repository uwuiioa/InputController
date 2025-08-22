class InputController {
    constructor() {
        this.plugins = new Map();
        this.actions = new Map();
        this.enabled = true;
        this.focused = true;
        this.target = null;
        
        this.ACTION_ACTIVATED = 'input-controller:action-activated';
        this.ACTION_DEACTIVATED = 'input-controller:action-deactivated';
        
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    registerAction(actionName) {
        if (!this.actions.has(actionName)) {
            this.actions.set(actionName, {
                active: false,
                plugins: new Set()
            });
        }
    }

    setActionState(actionName, isActive) {
        if (!this.actions.has(actionName)) {
            this.registerAction(actionName);
        }
        
        const action = this.actions.get(actionName);
        
        if (action.active !== isActive) {
            action.active = isActive;
            
            const eventName = isActive ? this.ACTION_ACTIVATED : this.ACTION_DEACTIVATED;
            const event = new CustomEvent(eventName, {
                detail: { action: actionName }
            });
            
            if (this.target) {
                this.target.dispatchEvent(event);
            }
            
            console.log(`Action '${actionName}' ${isActive ? 'activated' : 'deactivated'}`);
        }
    }

    isActionActive(actionName) {
        const action = this.actions.get(actionName);
        return action ? action.active : false;
    }

    isActionActiveAuto(actionName) {
        for (const plugin of this.plugins.values()) {
            if (typeof plugin.isActionActive === 'function') {
                const isActive = plugin.isActionActive(actionName);
                if (isActive) {
                    return true;
                }
            }
        }
        return false;
    }

    updateAllActionsState() {
        const allActions = new Set();
        
        this.plugins.forEach(plugin => {
            if (plugin.actionsConfig) {
                Object.keys(plugin.actionsConfig).forEach(action => {
                    allActions.add(action);
                });
            }
        });

        allActions.forEach(actionName => {
            const isActive = this.isActionActiveAuto(actionName);
            this.setActionState(actionName, isActive);
        });
    }

    addPlugin(name, plugin) {
        if (this.plugins.has(name)) {
            console.warn(`Plugin '${name}' already exists`);
            return;
        }
        
        this.plugins.set(name, plugin);
        plugin.init(this);
        console.log(`Plugin '${name}' added`);
        
        if (plugin.actionsConfig) {
            Object.keys(plugin.actionsConfig).forEach(actionName => {
                this.registerAction(actionName);
            });
        }
        
        if (this.target) {
            plugin.attach(this.target);
        }
        
        this.updateAllActionsState();
    }

    removePlugin(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.detach();
            plugin.destroy();
            this.plugins.delete(name);
            console.log(`Plugin '${name}' removed`);
            
            this.updateAllActionsState();
        }
    }

    attach(target) {
        this.target = target;
        
        target.addEventListener('click', this.handleFocus);
        target.addEventListener('focus', this.handleFocus);
        target.addEventListener('blur', this.handleBlur);
        
        this.plugins.forEach(plugin => {
            plugin.attach(target);
        });
        
        console.log('Controller attached to target');
        
        this.updateAllActionsState();
    }

    detach() {
        if (this.target) {
            this.target.removeEventListener('click', this.handleFocus);
            this.target.removeEventListener('focus', this.handleFocus);
            this.target.removeEventListener('blur', this.handleBlur);
            
            this.plugins.forEach(plugin => {
                plugin.detach();
            });
            
            this.target = null;
            console.log('Controller detached from target');
        }
    }

    handleFocus() {
        this.focused = true;
        console.log('Controller focused');
        
        this.updateAllActionsState();
    }

    handleBlur() {
        this.focused = false;
        console.log('Controller blurred');
        
        this.actions.forEach((action, actionName) => {
            if (action.active) {
                this.setActionState(actionName, false);
            }
        });
    }

    destroy() {
        this.detach();
        this.plugins.forEach(plugin => plugin.destroy());
        this.plugins.clear();
        this.actions.clear();
        console.log('Controller destroyed');
    }
}
