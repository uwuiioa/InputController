class MousePlugin {
    constructor(actionsConfig = {}) {
        this.actionsConfig = actionsConfig;
        this.controller = null;
        this.target = null;
        this.mouseStates = {};
        this._enabled = true;
        this._preventContextMenu = true;
        
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
    }

    set enabled(value) {
        if (this._enabled !== value) {
            this._enabled = value;
            console.log(`MousePlugin ${value ? 'enabled' : 'disabled'}`);
            
            if (value) {
                this.updateAllActionsState();
            } else {
                this.resetAllActions();
            }
            
            this.updateEventListeners();
            this.notifyController(); 
        }
    }

    get enabled() {
        return this._enabled;
    }

    init(controller) {
        this.controller = controller;
        console.log('MousePlugin initialized');
        
        for (const actionName in this.actionsConfig) {
            controller.registerAction(actionName);
        }
    }

    attach(target) {
        this.target = target;
        this.updateEventListeners();
        console.log('MousePlugin attached to target');
        
        if (this.target && this.target.style) {
            this.target.style.outline = 'none';
        }
    }

    detach() {
        if (this.target) {
            this.target.removeEventListener('mousedown', this.handleMouseDown);
            this.target.removeEventListener('mouseup', this.handleMouseUp);
            this.target.removeEventListener('contextmenu', this.handleContextMenu);
            console.log('MousePlugin detached from target');
        }
    }

    updateEventListeners() {
        if (this.target) {
            this.detach();
            
            if (this._enabled) {
                this.target.addEventListener('mousedown', this.handleMouseDown);
                this.target.addEventListener('mouseup', this.handleMouseUp);
                this.target.addEventListener('contextmenu', this.handleContextMenu);
                console.log('MousePlugin event listeners updated');
            }
        }
    }

    destroy() {
        this.detach();
        this.controller = null;
        this.target = null;
        this.mouseStates = {};
        console.log('MousePlugin destroyed');
    }

    isActionActive(actionName) {
        if (!this._enabled || !this.actionsConfig[actionName]) return false;
        
        const actionConfig = this.actionsConfig[actionName];
        const buttons = Array.isArray(actionConfig.buttons) ? actionConfig.buttons : [actionConfig.buttons];
        
        for (const button of buttons) {
            if (this.mouseStates[button]) {
                return actionConfig.enabled !== false;
            }
        }
        
        return false;
    }

    handleMouseDown(e) {
        if (!this._enabled || !this.controller || !this.controller.enabled) return;
        
        if (this.target && typeof this.target.focus === 'function') {
            this.target.focus();
        }
        
        const button = e.button;
        
        if (!this.mouseStates[button]) {
            this.mouseStates[button] = true;
            console.log(`Mouse button down: ${button} (${this.getButtonName(button)})`);
            
            for (const actionName in this.actionsConfig) {
                const actionConfig = this.actionsConfig[actionName];
                const buttons = Array.isArray(actionConfig.buttons) ? actionConfig.buttons : [actionConfig.buttons];
                
                if (buttons.includes(button)) {
                    const isActive = this.isActionActive(actionName);
                    this.controller.setActionState(actionName, isActive);
                    console.log(`Action '${actionName}' state updated to: ${isActive}`);
                }
            }
            
            this.notifyController(); 
        }
    }
    
    handleMouseUp(e) {
        if (!this._enabled || !this.controller || !this.controller.enabled) return;
        
        const button = e.button;
        
        if (this.mouseStates[button]) {
            this.mouseStates[button] = false;
            console.log(`Mouse button up: ${button} (${this.getButtonName(button)})`);
            
            for (const actionName in this.actionsConfig) {
                const actionConfig = this.actionsConfig[actionName];
                const buttons = Array.isArray(actionConfig.buttons) ? actionConfig.buttons : [actionConfig.buttons];
                
                if (buttons.includes(button)) {
                    const isActive = this.isActionActive(actionName);
                    this.controller.setActionState(actionName, isActive);
                    console.log(`Action '${actionName}' state updated to: ${isActive}`);
                }
            }
            
            this.notifyController(); 
        }
    }

    handleContextMenu(e) {
        if (this._preventContextMenu && this._enabled) {
            e.preventDefault();
            console.log('Context menu prevented');
        }
    }

    notifyController() {
        if (this.controller && typeof this.controller.updateAllActionsState === 'function') {
            this.controller.updateAllActionsState();
        }
    }

    set preventContextMenu(value) {
        this._preventContextMenu = value;
        console.log(`Context menu prevention ${value ? 'enabled' : 'disabled'}`);
    }
    
    get preventContextMenu() {
        return this._preventContextMenu;
    } 

    getButtonName(buttonCode) {
        const buttonNames = {
            0: 'Left',
            1: 'Middle',
            2: 'Right'
        };
        return buttonNames[buttonCode] || `Button ${buttonCode}`;
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
        
        this.mouseStates = {};
        console.log('All mouse button states reset');
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
        
        this.notifyController(); 
    }
}
