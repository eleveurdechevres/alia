import { Intent, ITagProps, MenuItem } from '@blueprintjs/core';
import { MultiSelect, ItemPredicate, ItemRenderer, IItemRendererProps, IItemModifiers } from '@blueprintjs/select';
import * as csstips from 'csstips';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { style } from 'typestyle';
import { GlobalStore } from 'src/stores/GlobalStore';
import { highlightText } from 'src/utils/FormatUtils';
import * as TextRenderers from 'src/utils/TextRenderers';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';

interface IProps {
    globalStore: GlobalStore;
    selectedTypeMesureList: ITypeMesure[];
    handleAddTypeMesure: (typeMesure: ITypeMesure) => void;
    handleRemoveTypeMesure: (typeMesure: ITypeMesure) => void;
    legendColorgenerator: (typeMesure: string) => string;
}

const SENSOR_MULTI_SELECT = MultiSelect.ofType<ITypeMesure>();

@observer export class MultiTypeMesureListSelector extends React.Component<IProps, {}> {

    @observable typeMesureList: ITypeMesure[] = [];

    public constructor(props: IProps) {
        super(props);
        this.props.globalStore.getTypeMesures().then(
                (result: ITypeMesure[]) => {
                this.typeMesureList = result;
            }
        );
    }

    private tagInputProps = {
        onRemove: (value: string, index: number) => {
            this.props.handleRemoveTypeMesure(this.props.selectedTypeMesureList[index])
            this.forceUpdate();
        },
        tagProps: (value: string, index: number): ITagProps => {
            return {
                intent: Intent.NONE,
                minimal: true,
                className: style(csstips.border('2px solid ' + this.props.legendColorgenerator(value)))
            };
        },
        placeholder: 'Filtrer par type de mesure'
    };

    public render() {
        return (
            <SENSOR_MULTI_SELECT
                className={style(csstips.fillParent)}
                itemPredicate={this.filterTypeMesure}
                itemRenderer={this.typeMesureItemRenderer}
                tagRenderer={TextRenderers.typeMesureTagRenderer}
                tagInputProps={this.tagInputProps}
                items={this.typeMesureList}
                selectedItems={this.props.selectedTypeMesureList}
                popoverProps={{ minimal: true }}
                noResults={this.noResultRenderer}
                openOnKeyDown={false}
                onItemSelect={this.selectTypeMesure}
                fill={true}
            />
        );
    }

    private isTypeMesureSelected = (typeMesure: ITypeMesure): boolean => {
        return this.props.selectedTypeMesureList.includes(typeMesure);
    }

    private selectTypeMesure = (typeMesure: ITypeMesure): void => {
        // if exists, remove line
        if (this.isTypeMesureSelected(typeMesure)) {
            this.props.handleRemoveTypeMesure(typeMesure);
        }
        else { // add line
            this.props.handleAddTypeMesure(typeMesure);
        }
    }

    private filterTypeMesure: ItemPredicate<ITypeMesure> = (query, typeMesure) => {
        if ( typeMesure.measure_type.toLowerCase().indexOf(query.toLowerCase()) >= 0 ) {
            return true;
        }
        return false;
    };

    private typeMesureItemRenderer: ItemRenderer<ITypeMesure> = (typeMesure: ITypeMesure, itemProps: IItemRendererProps): JSX.Element | null => {
        let modifiers: IItemModifiers = itemProps.modifiers;
        let handleClick: React.MouseEventHandler<HTMLElement> = itemProps.handleClick;
        let query: string = itemProps.query;
        if (!modifiers.matchesPredicate) {
            return null;
        }
        const label = typeMesure.unit;
    
        return (
            <MenuItem
                icon={this.props.selectedTypeMesureList.includes(typeMesure) ? 'tick' : 'blank'}
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={label}
                key={typeMesure.id + '_' + typeMesure.measure_type}
                onClick={handleClick}
                text={highlightText(typeMesure.measure_type, query)}
            />
        );
    };

    private noResultRenderer: ItemRenderer<ITypeMesure> = (): JSX.Element => {
        return (
            <MenuItem disabled={true} text="No results."/>
        );
    };
}
