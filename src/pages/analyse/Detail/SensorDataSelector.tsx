import { Intent, ITagProps, MenuItem } from '@blueprintjs/core';
import { MultiSelect, ItemPredicate, ItemRenderer, IItemRendererProps, IItemModifiers } from '@blueprintjs/select';
import * as csstips from 'csstips';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import * as React from 'react';
import { style } from 'typestyle';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ISerieDef } from 'src/interfaces/ISeriesDef';
import { ISheet } from 'src/interfaces/ISheet';

interface IProps {
    globalStore: GlobalStore;
    sheet: ISheet;
}

const SENSOR_DATA_MULTI_SELECT = MultiSelect.ofType<ISerieDef>();

@observer export class SensorDataSelector extends React.Component<IProps, {}> {

    @observable selectedSeriesDefs: ISerieDef[] = [];

    private tagInputProps = {
        onRemove: (value: string, index: number) => { this.props.globalStore.removeSeriesFromSheet(this.props.sheet, this.props.sheet.series[index]); },
        tagProps: (value: string, index: number): ITagProps => {
            return {
                intent: Intent.SUCCESS,
                minimal: true
            };
        },
        placeholder: 'Add line(s)...'
    };

    public render() {
        return (
            <SENSOR_DATA_MULTI_SELECT
                className={style(csstips.fillParent, csstips.flex, csstips.border('1px solid red'))}
                itemPredicate={this.filterLine}
                itemRenderer={this.lineItemRenderer}
                tagRenderer={(seriesDef: ISerieDef) => 'Etage ' + seriesDef.plan.etage + ', ' + seriesDef.capteur.capteur_reference_id + '[id' + seriesDef.capteur.id + ']'}
                tagInputProps={this.tagInputProps}
                items={this.props.sheet.series}
                selectedItems={this.selectedSeriesDefs}
                popoverProps={{ minimal: true }}
                noResults={this.noResultRenderer}
                openOnKeyDown={false}
                onItemSelect={this.selectLine}
                // inputProps={{
                //     size: 100,
                //     leftIcon: 'clipboard',
                //     rightIcon: 'caret-down',
                //     placeholder: 'Mission'
                //     // ,
                //     // rightElement:
                //     //     <Button
                //     //         icon="caret-down"
                //     //         className={Classes.BUTTON}
                //     //         minimal={true} 
                //     //         intent={Intent.NONE}
                //     //         disabled={true}
                //     //     />
                // }}
            />
        );
    }

    private isLineSelected = (seriesDef: ISerieDef): boolean => {
        return this.selectedSeriesDefs.includes(seriesDef);
    }

    private selectLine = (seriesDef: ISerieDef): void => {
        // if exists, remove line
        if (this.isLineSelected(seriesDef)) {
            this.props.globalStore.removeSeriesFromSheet(this.props.sheet, seriesDef);
        } else { // add line
            this.props.globalStore.addSeriesToSheet(this.props.sheet, seriesDef);
        }
    }

    private filterLine: ItemPredicate<ISerieDef> = (query, seriesDef) => {
        return true;
    };
 
    private lineItemRenderer: ItemRenderer<ISerieDef> = (seriesDef: ISerieDef, itemProps: IItemRendererProps): JSX.Element | null => {
        let modifiers: IItemModifiers = itemProps.modifiers;
        let handleClick: React.MouseEventHandler<HTMLElement> = itemProps.handleClick;
        let query: string = itemProps.query;
        if (!modifiers.matchesPredicate) {
            return null;
        }
        const label = 'label... TODO';
    
        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={label}
                key={seriesDef.plan.id + '|' + seriesDef.capteur.id + '|' + seriesDef.channel.id}
                onClick={handleClick}
                text={highlightText(this.computeSeriesDefName(seriesDef), query)}
            />
        );
    };

    computeSeriesDefName = (seriesDef: ISerieDef): string => {
        return  (
            seriesDef.plan.description + '(' + seriesDef.plan.etage + ')' +
            seriesDef.capteur.capteur_reference_id + '(' + seriesDef.capteur.id + ')' +
            seriesDef.typeMesure.measure_type + '(' + seriesDef.typeMesure.unit + ')'
        );
    }

    private noResultRenderer: ItemRenderer<ISerieDef> = (): JSX.Element => {
        return (
            <MenuItem disabled={true} text="Aucun résultat trouvé"/>
        );
    };
    
}

function highlightText (text: string, query: string) {
    let lastIndex = 0;
    const words = query
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(escapeRegExpChars);
    if (words.length === 0) {
        return [text];
    }
    const regexp = new RegExp(words.join('|'), 'gi');
    const tokens: React.ReactNode[] = [];
    while (true) {
        const match = regexp.exec(text);
        if (!match) {
            break;
        }
        const length = match[0].length;
        const before = text.slice(lastIndex, regexp.lastIndex - length);
        if (before.length > 0) {
            tokens.push(before);
        }
        lastIndex = regexp.lastIndex;
        tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
    }
    const rest = text.slice(lastIndex);
    if (rest.length > 0) {
        tokens.push(rest);
    }
    return tokens;
}

function escapeRegExpChars(text: string) {
    return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}
