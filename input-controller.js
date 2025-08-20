const InputController = (function() {
    class InputController {
        static ACTION_ACTIVATED = "input-controller:action-activated";
        static ACTION_DEACTIVATED = "input-controller:action-deactivated";

        constructor(actionsToBind = {}, target = document) {
            this._enabled = true;
            this.focused = true;
            this.target = target;

            this.actions = {};
            this.keyPressed = {};

            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);

            this.bindActions(actionsToBind);
            this.attach(target);
        }

        set enabled(value) {
            if (this._enabled !== value) {
                this._enabled = value;
                if (!value) {
                    this.resetAllActions();
                }
            }
        }

        get enabled() {
            return this._enabled;
        }

        bindActions(actionsToBind) {
            for (const [actionName, parameters] of Object.entries(actionsToBind)) {
                this.actions[actionName] = {
                    keys: Array.isArray(parameters.keys) ? parameters.keys : [parameters.keys],
                    active: false,
                    enabled: parameters.enabled !== undefined ? parameters.enabled : true
                }
                for (const key of this.actions[actionName].keys) {
                    if (!this.keyPressed[key]) {
                        this.keyPressed[key] = new Set();
                    }
                    this.keyPressed[key].add(actionName);
                }
            }
        }

        enableAction(actionName) {
            if (this.actions[actionName]) {
                this.actions[actionName].enabled = true;               
            }
        }

        disableAction(actionName) {
            if (this.actions[actionName]) {
                this.actions[actionName].enabled = false;  
            }
        }

        attach(target, dontEnable = false) {
            this.target = target;
            target.addEventListener('keydown', this.handleKeyDown);
            target.addEventListener('keyup', this.handleKeyUp);
            if (!dontEnable) {
                this.enabled = true;   
            }
        }

        detach() {
            if (this.target) {
                this.target.removeEventListener('keydown', this.handleKeyDown);
                this.target.removeEventListener('keyup', this.handleKeyUp);
            }
            this.enabled = false;
            this.resetAllActions();
        }

        resetAllActions() {
            for (const actionName in this.actions) {
                if (this.actions[actionName].active) {
                    this.actions[actionName].active = false;
                    const event = new CustomEvent(InputController.ACTION_DEACTIVATED, {
                        detail: { action: actionName }
                    });
                    window.dispatchEvent(event);
                }
            }
        }

        isActionActive(action) {
            if (this.actions[action]) {
                return this.actions[action].active && this.actions[action].enabled;
            }
            return false;
        }

        isKeyPressed(keyCode) {
            const actions = this.keyPressed[keyCode];
            if (actions) {
                for (const actionName of actions) {
                    if (this.actions[actionName].enabled && this.actions[actionName].active) {
                        return true;
                    }
                }
            }
            return false;
        }

        handleKeyDown(e) {
            if (!this.enabled || !this.focused) return;
            const keyCode = e.keyCode;
            const actions = this.keyPressed[keyCode];
            if (actions) {
                for (const actionName of actions) {
                    const action = this.actions[actionName];
                    if (action.enabled && !action.active) {
                        action.active = true;
                        const event = new CustomEvent(InputController.ACTION_ACTIVATED, {
                            detail: { action: actionName }
                        });
                        window.dispatchEvent(event);
                    }
                }
            }
        }
        
        handleKeyUp(e) {
            if (!this.enabled || !this.focused) return;
            const keyCode = e.keyCode;
            const actions = this.keyPressed[keyCode];
            if (actions) {
                for (const actionName of actions) {
                    const action = this.actions[actionName];
                    if (action.enabled && action.active) {
                        action.active = false;
                        const event = new CustomEvent(InputController.ACTION_DEACTIVATED, {
                            detail: { action: actionName }
                        });
                        window.dispatchEvent(event);
                    }
                }
            }
        }
    }
    return InputController;
})();
