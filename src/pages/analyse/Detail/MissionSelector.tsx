import * as React from 'react';
import { GlobalStore } from 'src/stores/GlobalStore';
import { IMission } from 'src/interfaces/IMission';
import { observer } from 'mobx-react';
import { Suggest, ItemRenderer, IItemRendererProps, IItemModifiers, ItemPredicate } from '@blueprintjs/select';
import { MenuItem, Button, Classes, Intent } from '@blueprintjs/core';
// import { style } from 'typestyle';
// import * as csstips from 'csstips';

interface IProps {
    globalStore: GlobalStore;
    mission: IMission;
    handleSelectMission: (mission: IMission) => void;
}

const MISSION_SELECT = Suggest.ofType<IMission>();

@observer export class MissionSelector extends React.Component<IProps, {}> {

    public constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <MISSION_SELECT
                disabled={false}
                activeItem={this.props.mission}
                items={this.props.globalStore.missionsForHabitat}
                itemRenderer={this.lineItemRenderer}
                itemPredicate={this.filterLine}
                onItemSelect={this.props.handleSelectMission}
                noResults={() => <MenuItem disabled={true} text="Aucun résultat trouvé"/>}
                resetOnQuery={true}
                resetOnSelect={false}
                inputValueRenderer={(mission: IMission) => formatTextMission(mission)}
                popoverProps={{
                    minimal: true
                }}
                inputProps={{
                    size: 100,
                    leftIcon: 'clipboard',
                    placeholder: 'Mission',
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

    private lineItemRenderer: ItemRenderer<IMission> = (mission: IMission, itemProps: IItemRendererProps): JSX.Element | null => {
        let modifiers: IItemModifiers = itemProps.modifiers;
        let handleClick: React.MouseEventHandler<HTMLElement> = itemProps.handleClick;
        let query: string = itemProps.query;
        if (!modifiers.matchesPredicate) {
            return null;
        }

        const label = 'label...';
        document.querySelector('#root');
        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={label}
                key={'mission' + mission.id}
                popoverProps={{ minimal: true }}
                onClick={handleClick}
                icon={mission === this.props.mission ? 'tick' : 'blank'}
                text={highlightText(formatTextMission(mission), query)}
            />
            
        );
    };

    private filterLine: ItemPredicate<IMission> = (query, mission) => {
        if ( mission.date_debut.toString().indexOf(query.toLowerCase()) >= 0 ) {
            return true;
        } else if ( mission.date_fin.toString().indexOf(query.toLowerCase()) >= 0 ) {
            return true;
        } else {
            return false;
        }
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

function formatTextMission(mission: IMission) {
    if (mission) {
        return '(' + mission.id + ') ' + mission.date_debut + ' -> ' + mission.date_fin;
    }
    return '';
}
