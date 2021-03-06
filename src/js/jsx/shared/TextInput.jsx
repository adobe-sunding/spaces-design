/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

define(function (require, exports, module) {
    "use strict";

    var React = require("react"),
        ReactDOM = require("react-dom"),
        Fluxxor = require("fluxxor"),
        FluxMixin = Fluxxor.FluxMixin(React),
        Immutable = require("immutable"),
        classnames = require("classnames"),
        _ = require("lodash");

    var Focusable = require("../mixin/Focusable");

    var TextInput = React.createClass({
        mixins: [Focusable, FluxMixin],

        /**
         * Once after focus, whether to suppress mouseup
         * to maintain the initial selection.
         *
         * @private
         * @type {boolean}
         */
        _suppressMouseUp: false,

        propTypes: {
            // Value for the input
            value: React.PropTypes.string.isRequired,
            // Event handler for committed value of the input. This is called when user hit Return/Enter or when 
            // the input loses focus. (also look at the allowEmpty option for different behavior)
            onChange: React.PropTypes.func,
            // Event handler for input event, which is triggered when the contents of the input change
            onInput: React.PropTypes.func,
            // Event handler for when input receives focus
            onFocus: React.PropTypes.func,
            // Event handler for when input loses focus
            onBlur: React.PropTypes.func,
            // Disable editing and selection of the input
            disabled: React.PropTypes.bool,
            // Placeholder text for the input
            placeholder: React.PropTypes.string,
            // Disallow the element from being immediately (single click) focusable 
            doubleClickToEdit: React.PropTypes.bool,
            // prevent the text input from scrolling horizontally when it is not editable.
            preventHorizontalScrolling: React.PropTypes.bool,
            // never highlight text, regardless of this.state.selectDisabled
            neverSelectAll: React.PropTypes.bool,
            // If true, input will allow committing empty value and onChange handler will be called. Otherwise 
            // empty value is ignored and onChange handler is skipped.
            allowEmpty: React.PropTypes.bool
        },

        getDefaultProps: function () {
            return {
                value: "",
                onChange: _.identity,
                onInput: _.identity,
                onFocus: _.identity,
                disabled: false,
                doubleClickToEdit: false,
                placeholder: "",
                neverSelectAll: false,
                allowEmpty: true,
                preventHorizontalScrolling: true
            };
        },

        getInitialState: function () {
            return {
                editing: false,
                value: this.props.value,
                selectDisabled: true
            };
        },

        shouldComponentUpdate: function (nextProps, nextState) {
            return !Immutable.is(this.props.value, nextProps.value) ||
                !Immutable.is(this.state.value, nextState.value) ||
                !Immutable.is(this.props.placeholder, nextProps.placeholder) ||
                this.props.title !== nextProps.title ||
                this.state.editing !== nextState.editing;
        },

        componentWillReceiveProps: function (nextProps) {
            if (nextProps.hasOwnProperty("value")) {
                this.setState({
                    value: nextProps.value
                });
            }

            var node = ReactDOM.findDOMNode(this.refs.input);
            if (window.document.activeElement === node &&
                    node.selectionStart === 0 &&
                    node.selectionEnd === node.value.length) {
                this.setState({
                    selectDisabled: false
                });
            }
        },

        componentDidUpdate: function () {
            var node = ReactDOM.findDOMNode(this.refs.input);

            if (this.state.editing) {
                node.removeAttribute("disabled");
                node.focus();
            }

            if (!this.state.selectDisabled && !this.props.neverSelectAll) {
                if (window.document.activeElement === node) {
                    // If the component updated and there is selection state, restore it
                    node.setSelectionRange(0, node.value.length);
                }
                this.setState({
                    selectDisabled: true
                });
            }
        },

        componentWilUnmount: function () {
            if (this._acquireFocusPromise && this._acquireFocusPromise.isPending()) {
                this._acquireFocusPromise.cancel();
            }
        },
        
        /**
         * Return the text input's current value
         * 
         * @return {string}
         */
        getValue: function () {
            return this.state.value;
        },
        
        /**
         * Update the text input's current value
         * @param {string} value updated
         */
        setValue: function (value) {
            this.setState({
                value: value
            });
        },

        /**
         * Update the value of the text input.
         *
         * @private
         * @param {SyntheticEvent} event
         */
        _handleChange: function (event) {
            var nextValue = event.target.value;

            this.setState({
                value: nextValue,
                editing: true,
                selectDisabled: true
            });

            this.props.onInput(event, nextValue);
        },

        /**
         * Release focus to Photoshop.
         *
         * @private
         */
        _releaseFocus: function () {
            this.releaseFocus()
                .bind(this)
                .finally(function () {
                    // HACK: this needs to wait for the next tick of the event loop,
                    // otherwise the blur handler will be executed before the edit
                    // state has been updated.
                    if (this.refs.input) {
                        ReactDOM.findDOMNode(this.refs.input).blur();
                    }
                });
        },

        /**
         * Finish editing the text in put and release focus.
         * Finish is only ever called from _reset or from datalist
         */
        finish: function () {
            this.setState({
                value: this.props.value,
                editing: false,
                selectDisabled: false
            });

            this._releaseFocus();
        },

        /**
         * Resets the text field to its last committed value.
         *
         * @private
         * @param {SyntheticEvent} event
         */
        _reset: function (event) {
            event.stopPropagation();
            this.finish();
        },

        /**
         * Commits the current value by calling the external onChange handler.
         *
         * @private
         * @param {SyntheticEvent} event
         */
        _commit: function (event) {
            event.stopPropagation();

            var nextValue = event.target.value;

            if (nextValue !== this.props.value) {
                if (!this.props.allowEmpty && nextValue.length === 0) {
                    nextValue = this.props.value;
                } else {
                    this.props.onChange(event, nextValue);
                }
            }
            
            this.setState({
                value: nextValue,
                editing: false
            });

            if (!this.state.editing) {
                this._releaseFocus();
            } else {
                this.setState({
                    selectDisabled: false
                });
            }
        },

        /**
         * Selects the content of the input on focus.
         *
         * @private
         * @param {SyntheticEvent} event
         */
        _handleFocus: function (event) {
            var node = ReactDOM.findDOMNode(this.refs.input);
            if (!this.props.neverSelectAll) {
                node.selectionStart = 0;
                node.selectionEnd = event.target.value.length;
            }

            this.props.onFocus(event);
        },

        /**
         * Calls onAccept handler when focus is taken from the TextInput
         * @private
         */
        _handleBlur: function (event) {
            if (this.state.editing) {
                this._commit(event);
            }

            if (this.props.onBlur) {
                this.props.onBlur(event);
            }
        },

        /**
         * Handler for various special keys
         * On Enter/Return, calls onAccept handler, if provided
         * On Escape, resets to last given value from props
         *
         * @private
         * @param {SyntheticEvent} event
         */
        _handleKeyDown: function (event) {
            var key = event.key;

            switch (key) {
            case "Escape":
                this._reset(event);
                break;
            case "Return":
            case "Enter":
                this._commit(event);
                break;
            }

            if (this.props.onKeyDown) {
                this.props.onKeyDown(event);
            }
        },

        /**
         * Focus the input element and begin editing if necessary.
         */
        focus: function () {
            var node = ReactDOM.findDOMNode(this.refs.input);
            if (!node) {
                return;
            }

            node.focus();
            if (!this.editing && !this.selectDisabled) {
                this._beginEdit();
            }
        },

        /**
         * If the value is editable, goes into edit mode
         *
         * @private
         */
        _beginEdit: function () {
            if (this.props.disabled) {
                return;
            }

            this._acquireFocusPromise = this.acquireFocus()
                .bind(this)
                .then(function () {
                    this.setState({
                        editing: true,
                        selectDisabled: false
                    });
                })
                .finally(function () {
                    this._acquireFocusPromise = null;
                });
        },

        /**
         * Begin editing if not in single-click-edit mode.
         *
         * @param {SyntheticEvent} event
         */
        _handleDoubleClick: function (event) {
            if (this.props.doubleClickToEdit) {
                this._beginEdit();
            }

            if (this.props.onDoubleClick) {
                this.props.onDoubleClick(event);
            }
        },

        /**
         * Begin editing if in single-click-edit mode.
         *
         * @param {SyntheticEvent} event
         */
        _handleClick: function (event) {
            if (!this.props.doubleClickToEdit) {
                this._beginEdit();
            }

            if (this.props.onClick) {
                this.props.onClick(event);
            }
        },

        /**
         * Stop event propagation during editing to prevent drag start. Also
         * record whether or not the successive mouseup event should be suppressed.
         *
         * @private
         * @param {SyntheticEvent} event
         */
        _handleMouseDown: function (event) {
            if (window.document.activeElement !== ReactDOM.findDOMNode(this)) {
                this._suppressMouseUp = true;
            }

            event.stopPropagation();
        },

        /**
         * Prevent default browser action to avoid clearing the selection.
         *
         * @private
         * @param {SyntheticEvent} event
         */
        _handleMouseUp: function (event) {
            if (this._suppressMouseUp) {
                event.preventDefault();
                this._suppressMouseUp = false;
            }
        },

        render: function () {
            var className = classnames(this.props.className, this.props.size);

            if (this.state.editing || !this.props.doubleClickToEdit) {
                return (
                    <input
                        title={this.props.title}
                        className={className}
                        type="text"
                        ref="input"
                        spellCheck="false"
                        value={this.state.value}
                        disabled={this.props.disabled}
                        placeholder={this.props.placeholder}
                        onClick={this.props.onClick}
                        onChange={this._handleChange}
                        onKeyDown={this._handleKeyDown}
                        onFocus={this._handleFocus}
                        onBlur={this._handleBlur}
                        onCut={this._handleChange}
                        onPaste={this._handleChange}
                        onMouseUp={this._handleMouseUp}
                        onMouseDown={this._handleMouseDown}>
                    </input>
                );
            } else { // Used for cases like Libary assets and Layerfaces
                return (
                    <div
                        title={this.props.title}
                        className={className}
                        onDoubleClick={this._handleDoubleClick}
                        onClick={this._handleClick}>
                        {this.state.value}
                    </div>
                );
            }
        },

        /**
         * Is the TextInput currently being edited?
         *
         * @return {boolean}
         */
        isEditing: function () {
            return this.state.editing || !this.props.doubleClickToEdit;
        },

        /**
         * Index of cursor within the input
         *
         * @return {number}
         */
        cursorLocation: function () {
            if (this.refs.input) {
                var node = ReactDOM.findDOMNode(this.refs.input);
                return node.selectionEnd;
            }
            return -1;
        }
    });

    module.exports = TextInput;
});
