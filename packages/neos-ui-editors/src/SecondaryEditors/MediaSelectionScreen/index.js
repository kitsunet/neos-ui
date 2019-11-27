import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {neos} from '@neos-project/neos-ui-decorators';
import {$get} from 'plow-js';

import style from './style.css';

@neos()
class MediaSelectionScreen extends PureComponent {
    static propTypes = {
        onComplete: PropTypes.func.isRequired,
        neos: PropTypes.object.isRequired,
        type: PropTypes.oneOf(['assets', 'images']).isRequired,
        constraints: PropTypes.object
    };

    static defaultProps = {
        type: 'assets'
    };

    render() {
        const {onComplete, neos, type, constraints} = this.props;
        window.NeosMediaBrowserCallbacks = {
            assetChosen: assetIdentifier => {
                onComplete(assetIdentifier);
            }
        };

        // Add typeFilter if legacy "type" was defined
        const constraintsFinal = (type === 'images') ? Object.assign({}, constraints, {typeFilter: 'Image'}) : constraints;

        const constraintUriString = encodeURIComponent(JSON.stringify(constraintsFinal));
        const mediaBrowserUri = $get('routes.core.modules.mediaBrowser', neos);

        return (
            <iframe name="neos-media-selection-screen"
                    src={`${mediaBrowserUri}/assets/index.html?browserConstraints=${constraintUriString}`}
                    className={style.iframe}/>
        );
    }
}

export default MediaSelectionScreen;
