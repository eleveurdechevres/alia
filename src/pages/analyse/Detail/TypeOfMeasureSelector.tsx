import * as React from 'react';
import { GlobalStore } from 'src/stores/GlobalStore';
import { observer } from 'mobx-react';
import { Suggest, ItemRenderer, IItemRendererProps, IItemModifiers, ItemPredicate } from '@blueprintjs/select';
import { MenuItem, Button, Classes, Intent } from '@blueprintjs/core';
import { TMesure } from 'src/interfaces/Types';
import { style } from 'typestyle';
import * as csstips from 'csstips';

interface IProps {
    globalStore: GlobalStore;
    typeOfMeasure: TMesure;
    handleSelectTypeOfMeasure: (typeOfMeasure: TMesure) => void;
}

const TYPE_OF_MEASURE_SELECT = Suggest.ofType<TMesure>();

@observer export class TypeOfMeasureSelector extends React.Component<IProps, {}> {

    public constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <TYPE_OF_MEASURE_SELECT
                className={style(csstips.content, csstips.width(300))}    
                disabled={false}
                activeItem={this.props.typeOfMeasure}
                // items={['Mouvement', 'Température', 'Humidité', 'Luminosité', 'Batterie', 'Vitesse vent', 'Direction vent', 'Pression atmosphérique', 'Sabotage']}
                items={['Température', 'Humidité']}
                itemRenderer={this.lineItemRenderer}
                itemPredicate={this.filterLine}
                onItemSelect={this.props.handleSelectTypeOfMeasure}
                noResults={() => <MenuItem disabled={true} text="Aucun résultat trouvé"/>}
                resetOnQuery={true}
                resetOnSelect={false}
                inputValueRenderer={(typeOfMeasure: TMesure) => typeOfMeasure}
                popoverProps={{
                    minimal: true
                }}
                inputProps={{
                    size: 100,
                    leftIcon: 'delta',
                    placeholder: 'Type de mesure',
                    rightElement:
                        <Button
                            icon="caret-down"
                            className={Classes.BUTTON}
                            minimal={true} 
                            intent={Intent.NONE}
                            disabled={true}
                        />
                }}
            />
        );
    }

    private lineItemRenderer: ItemRenderer<TMesure> = (typeOfMeasure: TMesure, itemProps: IItemRendererProps): JSX.Element | null => {
        let modifiers: IItemModifiers = itemProps.modifiers;
        let handleClick: React.MouseEventHandler<HTMLElement> = itemProps.handleClick;
        let query: string = itemProps.query;
        if (!modifiers.matchesPredicate) {
            return null;
        }

        // const label = 'label...';
        document.querySelector('#root');
        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                // label={label}
                key={'mission' + typeOfMeasure}
                popoverProps={{ minimal: true }}
                onClick={handleClick}
                icon={typeOfMeasure === this.props.typeOfMeasure ? 'tick' : 'blank'}
                text={highlightText(typeOfMeasure, query)}
            />
            
        );
    };

    private filterLine: ItemPredicate<TMesure> = (query, typeOfMeasure) => {
        if ( typeOfMeasure.toLowerCase().indexOf(query.toLowerCase()) >= 0 ) {
            return true;
        }
        return false;
    };
    
}

function highlightText(text: string, query: string) {
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

