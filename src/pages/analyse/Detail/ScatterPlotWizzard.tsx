import * as React from 'react';
import { observer } from 'mobx-react';
import { ClientSearchComponent } from 'src/pages/ClientSearchComponent';
import { HabitatSearchComponent } from 'src/pages/HabitatSearchComponent';
// import { style } from 'typestyle';
// import * as csstips from 'csstips';
import { GlobalStore } from 'src/stores/GlobalStore';
import { Dialog } from '@blueprintjs/core';

interface IProps {
    globalStore: GlobalStore;
    isVisible: boolean;
    handleClose: () => void;
}

@observer export class ScatterPlotWizzard extends React.Component<IProps, {}> {

    // @observable private habitat: IHabitat = undefined;
    
    public render() {
        return (
            <Dialog
                autoFocus={true}
                enforceFocus={true}
                usePortal={true}
                canOutsideClickClose={false}
                canEscapeKeyClose={true}
                isOpen={this.props.isVisible}
                title="Scatter Plot"
                icon="scatter-plot"
                onClose={this.props.handleClose}
            >
                <div>
                    <ClientSearchComponent
                        globalStore={this.props.globalStore}
                    />
                </div>
                <div>
                    <HabitatSearchComponent
                        globalStore={this.props.globalStore}
                    />
                </div>
            </Dialog>
        );
    }
}
