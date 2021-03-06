import {PropTypes} from 'react';

import alohaConfiguration from './alohaConfiguration';

export default PropTypes.shape({
    type: PropTypes.string.isRequired,
    ui: PropTypes.shape({
        label: PropTypes.string,
        help: PropTypes.shape({
            message: PropTypes.string.isRequired
        }),
        reloadIfChanged: PropTypes.bool,
        reloadPageIfChanged: PropTypes.bool,
        inlineEditable: PropTypes.bool,
        aloha: alohaConfiguration,
        inspector: PropTypes.shape({
            group: PropTypes.string,
            position: PropTypes.number,
            editor: PropTypes.string,
            editorOptions: PropTypes.object,
            editorListeners: PropTypes.shape({
                property: PropTypes.string.isRequired,
                handler: PropTypes.string.isRequired,
                handlerOptions: PropTypes.object
            })
        })
    })
});
