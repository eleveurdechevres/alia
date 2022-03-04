import * as React from 'react';
// import { style } from 'typestyle';
// import * as csstips from 'csstips';
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GlobalStore } from 'src/stores/GlobalStore';
// import { ActionElementBar, IPropsActionElement } from 'src/components/ActionBar';
// import { Button, Dialog, InputGroup, Tab, Tabs } from '@blueprintjs/core';
import { Tab, Tabs } from '@blueprintjs/core';
import { AdminCapteurs } from './AdminCapteurs';

interface IProps {
    globalStore: GlobalStore
}

type TAdminTab = 'capteurs' | 'mesureTypes';
interface ITabDef {
    title: string
}

const adminTabsDef: Map<TAdminTab, ITabDef> = new Map<TAdminTab, ITabDef>([
    ['capteurs', { title: 'Capteurs'}],
    ['mesureTypes', { title: 'Types de mesures'}]
  ]);


// const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
// const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
// const dialogFieldValueStyle = style(csstips.flex);

@observer export class Admin extends React.Component<IProps, {}> {

    @observable selectedTab: string = 'capteurs';
    constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <Tabs
                id="TabsExample"
                animate={true}
                onChange={(tab: string) => { this.selectedTab = tab }}
                selectedTabId={this.selectedTab}
            >
                {this.createAdminTab('capteurs')}
                {this.createAdminTab('mesureTypes')}
                <Tabs.Expander />
            </Tabs>
        );
    }

    private createAdminTab = (id: TAdminTab): JSX.Element => {
        return (
            <Tab
                id={id}
                title={adminTabsDef.get(id).title}
                panel={this.createPanel(id)}
            />
        );
    }

    private createPanel = (id: TAdminTab): JSX.Element => {
        switch (id) {
            case 'capteurs':
                return <AdminCapteurs globalStore={this.props.globalStore}/>;
            case 'mesureTypes':
                return <div>mesureTypes</div>;
            default:
                return <div/>;
        }
    }
}