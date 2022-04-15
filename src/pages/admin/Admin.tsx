import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GlobalStore } from 'src/stores/GlobalStore';
// import { ActionElementBar, IPropsActionElement } from 'src/components/ActionBar';
// import { Button, Dialog, InputGroup, Tab, Tabs } from '@blueprintjs/core';
import { Tab, Tabs } from '@blueprintjs/core';
import { AdminCapteurRefs } from './AdminCapteurRefs';
import { AdminTypeMesures } from './AdminTypeMesures';

interface IProps {
    globalStore: GlobalStore
}

type TAdminTab = 'capteur_refs' | 'mesureTypes';
interface ITabDef {
    title: string
}

const adminTabsDef: Map<TAdminTab, ITabDef> = new Map<TAdminTab, ITabDef>([
    ['capteur_refs', { title: 'Types capteurs'}],
    ['mesureTypes', { title: 'Types de mesures'}]
  ]);


// const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
// const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
// const dialogFieldValueStyle = style(csstips.flex);

@observer export class Admin extends React.Component<IProps, {}> {

    @observable selectedTab: TAdminTab = 'capteur_refs';
    constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <div className={style(csstips.margin(10), { boxShadow: '1px 1px 10px #888' }, csstips.padding(10))}>
                <Tabs
                    id="TabsExample"
                    animate={true}
                    onChange={(tab: TAdminTab) => { this.selectedTab = tab }}
                    selectedTabId={this.selectedTab}
                >
                    {this.createAdminTab('capteur_refs')}
                    {this.createAdminTab('mesureTypes')}
                    <Tabs.Expander />
                </Tabs>
            </div>
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
            case 'capteur_refs':
                return <AdminCapteurRefs globalStore={this.props.globalStore}/>;
            case 'mesureTypes':
                return <AdminTypeMesures globalStore={this.props.globalStore}/>;
            default:
                return <div/>;
        }
    }
}