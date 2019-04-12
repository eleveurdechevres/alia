import * as React from 'react';
import { observer } from 'mobx-react';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ISheet, ESheetType } from 'src/interfaces/ISheet';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { IconButton } from 'src/components/IconButton';
import { Menu, Intent, Popover, Position, IconName, MenuItem } from '@blueprintjs/core';
import { EditableRecordName } from 'src/components/EditableRecordName';
// import { Mollier } from '../Graph/CrossGraph/Mollier';
// import { IDateInterval } from '../Graph/GraphBoard';
import { MultiSensorSelector } from '../Detail/MultiSensorSelector';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
// import { TMesure } from 'src/interfaces/Types';

export interface IGenericSheetComponentProps {
    globalStore: GlobalStore;
    sheet: ISheet;
}

@observer export class GenericSheetComponent extends React.Component<IGenericSheetComponentProps, {}> {

    public constructor(props: IGenericSheetComponentProps) {
        super(props);
    }

    public render () {
        
        let props = {
            className: style(csstips.content),
            fontSize: 18,
            icon: 'add' as IconName,
            iconLegend: 'icon legend',
            placeholder: 'Enter sheet name',
            record: this.props.sheet,
            recordList: this.props.globalStore.sheets,
            getNameFromRecord: (rec: ISheet) => rec.sheetName,
            renameRecord: (rec: ISheet, newName: string) => { this.props.globalStore.renameSheet(this.props.sheet, newName) }
        };
        let _EditableRecordName: EditableRecordName<ISheet> = new EditableRecordName(props);

        return (
            <div
                className={style(csstips.margin(10), csstips.padding(10), { boxShadow: '1px 1px 10px #888' })}
            >
                <div className={style(csstips.fillParent, csstips.horizontal, csstips.center, csstips.padding(10), csstips.horizontallySpaced(30))}>
                    <div className={style(csstips.width(300))}>
                        {
                            _EditableRecordName.render()
                        }
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
        console.log('TODO : Delete sheet ' + this.props.sheet.sheetName);
    }
    private closeSheet = () => {
        console.log('TODO : Close sheet ' + this.props.sheet.sheetName);
    }

}