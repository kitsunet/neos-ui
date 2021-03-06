import React, {PureComponent, PropTypes} from 'react';
import {$get} from 'plow-js';
import style from './style.css';
import EditorEnvelope from '@neos-project/neos-ui-editors/src/EditorEnvelope/index';

/**
 * (Stateful) Editor envelope
 *
 * For reference on how to use editors, check the docs inside the Registry.
 */
export default class InspectorEditorEnvelope extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        editor: PropTypes.string.isRequired,
        options: PropTypes.object,
        renderSecondaryInspector: PropTypes.func.isRequired,
        validationErrors: PropTypes.array,

        node: PropTypes.object.isRequired,
        commit: PropTypes.func.isRequired,
        transient: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.onHandleCommit = this.onHandleCommit.bind(this);
    }

    onHandleCommit(value, hooks = null) {
        const {transient, id, commit} = this.props;

        if ($get([id], transient) === value && hooks === null) {
            // Nothing has changed...
            return commit(id, null, null);
        }

        return commit(id, value, hooks);
    }

    render() {
        const {node, id, transient, ...otherProps} = this.props;
        // If property id starts with "_" then look in object properties directly
        const sourceValueRaw = id.slice(0, 1) === '_' ? node[id.slice(1)] : $get(['properties', id], node);
        const sourceValue = sourceValueRaw && sourceValueRaw.toJS ?
            sourceValueRaw.toJS() : sourceValueRaw;
        const transientValueRaw = $get([id], transient);
        const transientValue = transientValueRaw && transientValueRaw.toJS ?
            transientValueRaw.toJS() : transientValueRaw;

        return (
            <div className={style.wrap}>
                <EditorEnvelope
                    {...otherProps}
                    highlight={transientValue && transientValue.value !== sourceValue}
                    identifier={id}
                    value={transientValue ? transientValue.value : sourceValue}
                    hooks={transientValue ? transientValue.hooks : null}
                    commit={this.onHandleCommit}
                    />
            </div>
        );
    }
}
