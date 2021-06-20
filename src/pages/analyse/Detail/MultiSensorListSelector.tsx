import { Intent, ITagProps, MenuItem } from '@blueprintjs/core';
import { MultiSelect, ItemPredicate, ItemRenderer, IItemRendererProps, IItemModifiers } from '@blueprintjs/select';
import * as csstips from 'csstips';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { style } from 'typestyle';
import { IMission } from 'src/interfaces/IMission';
import { GlobalStore } from 'src/stores/GlobalStore';
import { IChannelFromMission } from 'src/interfaces/IChannelFromMission';
import { highlightText } from 'src/utils/FormatUtils';
import * as TextRenderers from 'src/utils/TextRenderers';

interface IProps {
    mission: IMission;
    globalStore: GlobalStore;
    selectedChannelList: IChannelFromMission[];
    handleAddChannel: (channel: IChannelFromMission) => void;
    handleRemoveChannel: (channel: IChannelFromMission) => void;
    legendColorgenerator: (legend: string) => string;
}

const SENSOR_MULTI_SELECT = MultiSelect.ofType<IChannelFromMission>();

@observer export class MultiSensorListSelector extends React.Component<IProps, {}> {

    @observable channelListForMission: IChannelFromMission[] = [];

    public constructor(props: IProps) {
        super(props);
        this.props.globalStore.getAllChannelsFromMission(this.props.mission.id).then(
            (result: IChannelFromMission[]) => {
                this.channelListForMission = result;
            }
        );
    }

    private tagInputProps = {
        onRemove: (value: string, index: number) => {
            this.props.handleRemoveChannel(this.props.selectedChannelList[index])
            this.forceUpdate();
        },
        tagProps: (value: string, index: number): ITagProps => {
            return {
                intent: Intent.NONE,
                minimal: true,
                className: style(csstips.border('2px solid ' + this.props.legendColorgenerator(value)))
            };
        },
        placeholder: 'Add sensor(s)...'
    };

    public render() {
        return (
            <SENSOR_MULTI_SELECT
                className={style(csstips.fillParent)}
                itemPredicate={this.filterLine}
                itemRenderer={this.channelItemRenderer}
                tagRenderer={TextRenderers.channelNameRenderer}
                tagInputProps={this.tagInputProps}
                items={this.channelListForMission}
                selectedItems={this.props.selectedChannelList}
                popoverProps={{ minimal: true }}
                noResults={this.noResultRenderer}
                openOnKeyDown={false}
                onItemSelect={this.selectLine}
            />
        );
    }

    private isLineSelected = (channel: IChannelFromMission): boolean => {
        return this.props.selectedChannelList.includes(channel);
    }

    private selectLine = (channel: IChannelFromMission): void => {
        // if exists, remove line
        if (this.isLineSelected(channel)) {
            this.props.handleRemoveChannel(channel);
        }
        else { // add line
            this.props.handleAddChannel(channel);
        }
    }

    private filterLine: ItemPredicate<IChannelFromMission> = (query, channel) => {
        if ( TextRenderers.channelNameRenderer(channel).indexOf(query.toLowerCase()) >= 0 ) {
            return true;
        }
        // else if ( line.line_name.indexOf(query.toLowerCase()) >= 0 ) return true;
        // else if ( formatUtils.date(new Date(line.start_time)).indexOf(query.toLowerCase()) >= 0 ) return true;
        // else if ( formatUtils.date(new Date(line.end_time)).indexOf(query.toLowerCase()) >= 0 ) return true;
        return false;
    };

    private channelItemRenderer: ItemRenderer<IChannelFromMission> = (channel: IChannelFromMission, itemProps: IItemRendererProps): JSX.Element | null => {
        let modifiers: IItemModifiers = itemProps.modifiers;
        let handleClick: React.MouseEventHandler<HTMLElement> = itemProps.handleClick;
        let query: string = itemProps.query;
        if (!modifiers.matchesPredicate) {
            return null;
        }
        // let startDate = formatUtils.date(new Date(line.start_time));
        // let endDate = formatUtils.date(new Date(line.end_time));
    
        // const label = startDate + ' to ' + endDate;
        const label = '-'
    
        return (
            <MenuItem
                icon={this.props.selectedChannelList.includes(channel) ? 'tick' : 'blank'}
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={label}
                key={channel.capteur_id + '_'  + channel.channel_id}
                onClick={handleClick}
                text={highlightText(TextRenderers.channelNameRenderer(channel), query)}
            />
        );
    };

    private noResultRenderer: ItemRenderer<IChannelFromMission> = (): JSX.Element => {
        return (
            <MenuItem disabled={true} text="No results."/>
        );
    };
}
