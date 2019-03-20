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
    handleCancel: () => void;
}

@observer export class LineChartWizzard extends React.Component<IProps, {}> {

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
                title="Time Chart"
                icon="timeline-line-chart"
                onClose={this.props.handleCancel}
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
