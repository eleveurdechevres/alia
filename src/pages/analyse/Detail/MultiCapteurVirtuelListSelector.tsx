import { ITagProps, MenuItem, Intent } from '@blueprintjs/core';
import { MultiSelect, ItemPredicate, ItemRenderer, IItemRendererProps, IItemModifiers } from '@blueprintjs/select';
import * as csstips from 'csstips';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { style } from 'typestyle';
import { IMission } from 'src/interfaces/IMission';
import { GlobalStore } from 'src/stores/GlobalStore';
import { highlightText } from 'src/utils/FormatUtils';
import { ICapteurVirtuelForMission } from 'src/interfaces/ICapteurVirtuelForMission';
import * as TextRenderers from 'src/utils/TextRenderers';

interface IProps {
    mission: IMission;
    globalStore: GlobalStore;
    selectedCapteurVirtuelList: ICapteurVirtuelForMission[];
    handleAddCapteurVirtuel: (capteurVirtuel: ICapteurVirtuelForMission) => void;
    handleRemoveCapteurVirtuel: (capteurVirtuel: ICapteurVirtuelForMission) => void;
    legendColorgenerator: (legend: string) => string;
}

const SENSOR_MULTI_SELECT = MultiSelect.ofType<ICapteurVirtuelForMission>();

@observer export class MultiCapteurVirtuelListSelector extends React.Component<IProps, {}> {

    @observable private capteurVirtuelListForMission: ICapteurVirtuelForMission[] = [];

    public constructor(props: IProps) {
        super(props);
        this.props.globalStore.getAllCapteursVirtuelsFromMission(this.props.mission.id).then(
            (result: ICapteurVirtuelForMission[]) => {
                this.capteurVirtuelListForMission = result;
            }
        );
    }

    private tagInputProps = {
        onRemove: (value: string, index: number) => {
            this.props.handleRemoveCapteurVirtuel(this.props.selectedCapteurVirtuelList[index])
            this.forceUpdate();
        },
        tagProps: (value: string, index: number): ITagProps => {
            return {
                intent: Intent.NONE,
                minimal: true,
                className: style(csstips.border('2px solid ' + this.props.legendColorgenerator(value)))
            };
        },
        placeholder: 'Add virtual sensors(s)...'
    };

    public render() {
        return (
            <SENSOR_MULTI_SELECT
                className={style(csstips.fillParent)}
                itemPredicate={this.filterLine}
                itemRenderer={this.itemRenderer}
                tagRenderer={TextRenderers.capteurVirtuelNameRenderer}
                tagInputProps={this.tagInputProps}
                items={this.capteurVirtuelListForMission}
                selectedItems={this.props.selectedCapteurVirtuelList}
                popoverProps={{ minimal: true }}
                noResults={this.noResultRenderer}
                openOnKeyDown={false}
                onItemSelect={this.selectLine}
            />
        );
    }

    private isLineSelected = (capteurVirtuel: ICapteurVirtuelForMission): boolean => {
        return this.props.selectedCapteurVirtuelList.includes(capteurVirtuel);
    }

    private selectLine = (capteurVirtuel: ICapteurVirtuelForMission): void => {
        // if exists, remove line
        if (this.isLineSelected(capteurVirtuel)) {
            this.props.handleRemoveCapteurVirtuel(capteurVirtuel);
        }
        else { // add line
            this.props.handleAddCapteurVirtuel(capteurVirtuel);
        }
    }

    private filterLine: ItemPredicate<ICapteurVirtuelForMission> = (query, capteurVirtuel) => {
        if ( TextRenderers.capteurVirtuelNameRenderer(capteurVirtuel).toLowerCase().indexOf(query.toLowerCase()) >= 0 ) {
            return true;
        }
        // else if ( line.line_name.indexOf(query.toLowerCase()) >= 0 ) return true;
        // else if ( formatUtils.date(new Date(line.start_time)).indexOf(query.toLowerCase()) >= 0 ) return true;
        // else if ( formatUtils.date(new Date(line.end_time)).indexOf(query.toLowerCase()) >= 0 ) return true;
        return false;
    };

    private itemRenderer: ItemRenderer<ICapteurVirtuelForMission> = (capteurVirtuel: ICapteurVirtuelForMission, itemProps: IItemRendererProps): JSX.Element | null => {
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
                icon={this.props.selectedCapteurVirtuelList.includes(capteurVirtuel) ? 'tick' : 'blank'}
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={label}
                key={'CapteurVirtuel' + capteurVirtuel.id + '_'  + capteurVirtuel.label}
                onClick={handleClick}
                text={highlightText(TextRenderers.capteurVirtuelNameRenderer(capteurVirtuel), query)}
            />
        );
    };

    private noResultRenderer: ItemRenderer<ICapteurVirtuelForMission> = (): JSX.Element => {
        return (
            <MenuItem disabled={true} text="No results."/>
        );
    };
}
