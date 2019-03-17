import * as React from 'react';
import { observer } from 'mobx-react';
import { ClientSearchComponent } from 'src/pages/ClientSearchComponent';
import { HabitatSearchComponent } from 'src/pages/HabitatSearchComponent';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { GlobalStore } from 'src/stores/GlobalStore';

interface IProps {
    globalStore: GlobalStore
}

@observer export class RadarChartWizzard extends React.Component<IProps, {}> {

    // @observable private habitat: IHabitat = undefined;
    
    public render() {
        return (
            <div className={style(csstips.vertical, csstips.fillParent, csstips.content)}>
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
            </div>
        );
    }
}
