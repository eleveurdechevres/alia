import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { IAnalyse } from 'src/interfaces/IAnalyse';
import { ClientSearchComponent } from 'src/pages/ClientSearchComponent';
import { HabitatSearchComponent } from 'src/pages/HabitatSearchComponent';
import { IClient } from 'src/interfaces/IClient';
import { IHabitat } from 'src/interfaces/IHabitat';
import { style } from 'typestyle';
import * as csstips from 'csstips';

interface IProps extends IAnalyse {
}

@observer export class RadarChartWizzard extends React.Component<IProps, {}> {

    @observable private client: IClient = undefined;
    // @observable private habitat: IHabitat = undefined;
    
    public render() {
        return (
            <div className={style(csstips.vertical, csstips.width(500), csstips.content)}>
                <ClientSearchComponent
                    handler={(client: IClient) => { this.client = client }}
                />
                <HabitatSearchComponent
                    client={this.client}
                    handler={(habitat: IHabitat) => {
                        // this.habitat = habitat
                    }}
                />
            </div>
        );
    }
}
