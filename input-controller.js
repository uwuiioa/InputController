const InputController = (function() {
    const EVENT_ACTIVATED = 'input-controller:action-activated';
    const EVENT_DEACTIVATED = 'input-controller:action-deactivated';

    class InputController {
        constructor(actionsToBind = {}, target = null) {
            this.ACTION_ACTIVATED = EVENT_ACTIVATED;
            this.ACTION_DEACTIVATED = EVENT_DEACTIVATED;

            this._enabled = true;
            this._focused = true;
            this._target = null;
            this._actions = {};
            this._pressedKeys = new Set();
            
            // Инициализация
            this.bindActions(actionsToBind);
            
            if (target) {
                this.attach(target);
            }

            // Обработчики событий фокуса
            window.addEventListener('focus', () => {
                this._focused = true;
                this._pressedKeys.clear();
            });

            window.addEventListener('blur', () => {
                this._focused = false;
                this._pressedKeys.clear();
            });
        }

        // Публичные переменные
        get enabled() {
            return this._enabled;
        }

        set enabled(value) {
            this._enabled = value;
            if (!value) {
                this._pressedKeys.clear();
            }
        }

        get focused() {
            return this._focused;
        }

        // Публичные методы
        bindActions(actionsToBind) {
            for (const [actionName, actionData] of Object.entries(actionsToBind)) {
                if (!this._actions[actionName]) {
                    this._actions[actionName] = {
                        keys: new Set(),
                        enabled: true
                    };
                }

                if (actionData.keys) {
                    actionData.keys.forEach(key => {
                        this._actions[actionName].keys.add(key);
                    });
                }

                if (actionData.enabled !== undefined) {
                    this._actions[actionName].enabled = actionData.enabled;
                }
            }
        }

        enableAction(actionName) {
            if (this._actions[actionName]) {
                this._actions[actionName].enabled = true;
            }
        }

        disableAction(actionName) {
            if (this._actions[actionName]) {
                this._actions[actionName].enabled = false;
            }
        }

        attach(target, dontEnable = false) {
            if (this._target) {
                this.detach();
            }

            this._target = target;
            
            if (!dontEnable) {
                this.enabled = true;
            }

            target.addEventListener('keydown', this._handleKeyDown.bind(this));
            target.addEventListener('keyup', this._handleKeyUp.bind(this));
        }

        detach() {
            if (this._target) {
                this._target.removeEventListener('keydown', this._handleKeyDown);
                this._target.removeEventListener('keyup', this._handleKeyUp);
                this._target = null;
            }
            
            this.enabled = false;
            this._pressedKeys.clear();
        }

        isActionActive(actionName) {
            const action = this._actions[actionName];
            
            if (!action || !action.enabled || !this._enabled || !this._focused) {
                return false;
            }

            for (const key of action.keys) {
                if (this._pressedKeys.has(key)) {
                    return true;
                }
            }
            
            return false;
        }

        isKeyPressed(keyCode) {
            return this._pressedKeys.has(keyCode) && this._enabled && this._focused;
        }

        // Приватные методы
        _handleKeyDown(event) {
            if (!this._enabled || !this._focused) return;

            const keyCode = event.keyCode;
            
            if (this._pressedKeys.has(keyCode)) return;
            
            this._pressedKeys.add(keyCode);
            
            // Проверяем, какие активности изменили состояние
            for (const [actionName, action] of Object.entries(this._actions)) {
                if (action.enabled && action.keys.has(keyCode)) {
                    const wasActive = [...action.keys].some(k => k !== keyCode && this._pressedKeys.has(k));
                    
                    if (!wasActive) {
                        this._dispatchEvent(EVENT_ACTIVATED, actionName);
                    }
                }
            }
        }

        _handleKeyUp(event) {
            if (!this._enabled || !this._focused) return;

            const keyCode = event.keyCode;
            
            if (!this._pressedKeys.has(keyCode)) return;
            
            this._pressedKeys.delete(keyCode);
            
            // Проверяем, какие активности изменили состояние
            for (const [actionName, action] of Object.entries(this._actions)) {
                if (action.enabled && action.keys.has(keyCode)) {
                    const isStillActive = [...action.keys].some(k => k !== keyCode && this._pressedKeys.has(k));
                    
                    if (!isStillActive) {
                        this._dispatchEvent(EVENT_DEACTIVATED, actionName);
                    }
                }
            }
        }

        _dispatchEvent(eventName, actionName) {
            if (!this._target || !this._enabled || !this._focused) return;
            
            const event = new CustomEvent(eventName, {
                detail: { action: actionName }
            });
            
            this._target.dispatchEvent(event);
        }
    }

    return InputController;
})();