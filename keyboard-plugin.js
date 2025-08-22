class KeyboardPlugin {
    constructor(actionsConfig = {}) {
        this.actionsConfig = actionsConfig;
        this.controller = null;
        this.target = null;
        this.keyStates = {};
        this._enabled = true;
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    set enabled(value) {
        if (this._enabled !== value) {
            this._enabled = value;
            console.log(`KeyboardPlugin ${value ? 'enabled' : 'disabled'}`);
            
            if (value) {
                this.updateAllActionsState();
            } else {
                this.resetAllActions();
            }
            
            this.updateEventListeners();
        }
    }

    get enabled() {
        return this._enabled;
    }

    init(controller) {
        this.controller = controller;
        console.log('KeyboardPlugin initialized');
        
        for (const actionName in this.actionsConfig) {
            controller.registerAction(actionName);
        }
    }

    attach(target) {
        this.target = target;
        this.updateEventListeners();
        console.log('KeyboardPlugin attached to target');
    }

    detach() {
        if (this.target) {
            this.target.removeEventListener('keydown', this.handleKeyDown);
            this.target.removeEventListener('keyup', this.handleKeyUp);
            console.log('KeyboardPlugin detached from target');
        }
    }

    updateEventListeners() {
        if (this.target) {
            this.detach();
            
            if (this._enabled) {
                this.target.addEventListener('keydown', this.handleKeyDown);
                this.target.addEventListener('keyup', this.handleKeyUp);
                console.log('KeyboardPlugin event listeners updated');
            }
        }
    }

    destroy() {
        this.detach();
        this.controller = null;
        this.target = null;
        this.keyStates = {};
        console.log('KeyboardPlugin destroyed');
    }

    isActionActive(actionName) {
        if (!this._enabled || !this.actionsConfig[actionName]) return false;
        
        const actionConfig = this.actionsConfig[actionName];
        const keys = Array.isArray(actionConfig.keys) ? actionConfig.keys : [actionConfig.keys];
        
        for (const keyCode of keys) {
            if (this.keyStates[keyCode]) {
                return actionConfig.enabled !== false;
            }
        }
        
        return false;
    }

    handleKeyDown(e) {
        if (!this._enabled || !this.controller || !this.controller.enabled || !this.controller.focused) return;
        
        const keyCode = e.keyCode;
        
        if (!this.keyStates[keyCode]) {
            this.keyStates[keyCode] = true;
            console.log(`Key down: ${keyCode}`);
            
            for (const actionName in this.actionsConfig) {
                const actionConfig = this.actionsConfig[actionName];
                const keys = Array.isArray(actionConfig.keys) ? actionConfig.keys : [actionConfig.keys];
                
                if (keys.includes(keyCode)) {
                    const isActive = this.isActionActive(actionName);
                    this.controller.setActionState(actionName, isActive);
                    console.log(`Action '${actionName}' state updated to: ${isActive}`);
                }
            }
        }
    }
    
    handleKeyUp(e) {
        if (!this._enabled || !this.controller || !this.controller.enabled || !this.controller.focused) return;
        
        const keyCode = e.keyCode;
        
        if (this.keyStates[keyCode]) {
            this.keyStates[keyCode] = false;
            console.log(`Key up: ${keyCode}`);
            
            for (const actionName in this.actionsConfig) {
                const actionConfig = this.actionsConfig[actionName];
                const keys = Array.isArray(actionConfig.keys) ? actionConfig.keys : [actionConfig.keys];
                
                if (keys.includes(keyCode)) {
                    const isActive = this.isActionActive(actionName);
                    this.controller.setActionState(actionName, isActive);
                    console.log(`Action '${actionName}' state updated to: ${isActive}`);
                }
            }
        }
    }

    updateAllActionsState() {
        if (!this.controller) return;
        
        for (const actionName in this.actionsConfig) {
            const isActive = this.isActionActive(actionName);
            this.controller.setActionState(actionName, isActive);
            console.log(`Action '${actionName}' initial state: ${isActive}`);
        }
    }

    resetAllActions() {
        if (!this.controller) return;
        
        for (const actionName in this.actionsConfig) {
            this.controller.setActionState(actionName, false);
            console.log(`Action '${actionName}' reset`);
        }
        
        this.keyStates = {};
        console.log('All key states reset');
    }

    bindActions(actionsConfig) {
        for (const actionName in actionsConfig) {
            this.actionsConfig[actionName] = actionsConfig[actionName];
            
            if (this.controller) {
                this.controller.registerAction(actionName);
                
                if (this._enabled) {
                    const isActive = this.isActionActive(actionName);
                    this.controller.setActionState(actionName, isActive);
                    console.log(`Action '${actionName}' bound with state: ${isActive}`);
                }
            }
        }
    }
}