import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ISheet } from 'src/interfaces/ISheet';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { IconButton } from 'src/components/IconButton';
import { Intent, Popover, Position } from '@blueprintjs/core';
import { EditableRecordName } from 'src/components/EditableRecordName';

export interface IGenericSheetComponentProps {
    globalStore: GlobalStore;
    sheet: ISheet;
}

@observer export class GenericSheetComponent extends React.Component<IGenericSheetComponentProps, {}> {

    @observable windowWidth: number;
    @observable windowHeight: number;
    
    public constructor(props: IGenericSheetComponentProps) {
        super(props);
        this.windowWidth = window.innerWidth;
    }

    public componentDidMount() {
        // Additionally I could have just used an arrow function for the binding `this` to the component...
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }
    
    private updateDimensions = () => {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
    }

    public render () {
        
        return (
            <div
                className={style(csstips.margin(10), csstips.padding(10), { boxShadow: '1px 1px 10px #888' })}
            >
                <div className={style(csstips.fillParent, csstips.horizontal, csstips.center, csstips.padding(10), csstips.horizontallySpaced(30))}>
                    <div className={style(csstips.width(300))}>
                        <EditableRecordName
                            className={style(csstips.content)}
                            fontSize={18}
                            icon="add"
                            iconLegend="icon legend"
                            placeholder="Enter sheet name"
                            record={this.props.sheet}
                            recordList={this.props.globalStore.sheets}
                            getNameFromRecord={(rec: ISheet) => rec.sheetName}
                            renameRecord={(rec: ISheet, newName: string) => { this.props.globalStore.renameSheet(this.props.sheet, newName) }}
                        />
                    </div>
                    <div className={style(csstips.flex)}>
                        {this.buildConfigBar()}
                    </div>
                    <div className={style(csstips.content, csstips.horizontal)}>
                        <Popover
                            content={this.buildSettingsMenu()}
                            position={Position.BOTTOM_RIGHT}
                            minimal={true}
                            disabled={false}
                        >
                            <IconButton
                                intent={Intent.PRIMARY}
                                iconName="cog"
                                tooltip="Settings"
                                iconSize={20}
                                margin={10}
                                onClick={() => { /* TODO */ }}
                                disabled={false}
                            />
                        </Popover>
                        <IconButton
                            intent={Intent.DANGER}
                            iconName="trash"
                            tooltip="Delete sheet"
                            iconSize={20}
                            margin={10}
                            onClick={this.deleteSheet}
                            disabled={this.props.sheet.isReadOnly}
                        />
                        <IconButton
                            intent={Intent.PRIMARY}
                            iconName="cross"
                            tooltip="Close sheet"
                            iconSize={20}
                            margin={10}
                            onClick={this.closeSheet}
                        />
                    </div>
                </div>
                <div className={style(csstips.fillParent, csstips.flex)}>
                    {this.buildChart()}
                </div>
            </div>
        );
    }

    protected buildConfigBar = () => <div/>
    protected buildChart = () => <React.Fragment/>
    protected buildSettingsMenu = () => <div/>

    private deleteSheet = () => {
        this.props.globalStore.deleteSheet(this.props.sheet);
    }
    private closeSheet = () => {
        this.props.globalStore.closeSheet(this.props.sheet);
    }

}