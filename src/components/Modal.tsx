import * as React from 'react';
import { observer } from 'mobx-react';
import * as ReactModal from 'react-modal';
import { Button } from '@blueprintjs/core';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';

export interface IProps {
    isOpen: boolean;
    // afterOpenModal: () => void;
    onClose: () => void;
    label: string;
}

const customStyle = {
    overlay : {
      position          : 'fixed',
      top               : 0,
      left              : 0,
      right             : 0,
      bottom            : 0,
      backgroundColor   : 'rgba(255, 255, 255, 0.75)'
    },
    content : {
      position                   : 'absolute',
      top                        : '70px',
      left                       : '20px',
      right                      : '20px',
      bottom                     : '20px',
      border                     : '1px solid #ccc',
      background                 : '#fff',
      overflow                   : 'auto',
      WebkitOverflowScrolling    : 'touch',
      borderRadius               : '4px',
      outline                    : 'none',
      padding                    : '20px'
    }
};

@observer export class Modal<T extends IProps> extends React.Component<T, {}> {

    public render() {
        return (
            <ReactModal
                isOpen={this.props.isOpen}
                // onAfterOpen={this.props.afterOpenModal}
                onRequestClose={this.props.onClose}
                contentLabel={this.props.label}
                style={customStyle}
                appElement={document.getElementById('root')}
            >
                <div className={style(csstips.horizontal, {width: '100%'})} >
                    <div className={style(csstips.fillParent)}>{this.props.label}</div>
                    <Button icon={'cross'} onClick={this.props.onClose} minimal={true}/>
                </div>
                {this.renderInternalComponent()}
            </ReactModal >
        );
    }

    protected renderInternalComponent = (): JSX.Element => {
        return <React.Fragment/>;
    }
}
