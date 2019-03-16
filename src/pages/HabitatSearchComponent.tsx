import * as React from 'react';
// import PropTypes from 'prop-types';
import * as fetch from 'isomorphic-fetch';
// import { IClient } from '../interfaces/IClient';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IHabitat } from 'src/interfaces/IHabitat';
import { IClient } from 'src/interfaces/IClient';
import { Select, ItemRenderer, IItemRendererProps, IItemModifiers, ItemPredicate, ItemListRenderer } from '@blueprintjs/select';
import { Menu, MenuItem, Button, Alignment } from '@blueprintjs/core';

interface IProps {
    client: IClient;
    handler: (habitat: IHabitat) => void;
}

const HabitatSelect = Select.ofType<IHabitat>();

@observer export class HabitatSearchComponent extends React.Component<IProps, {}> {

    @observable private habitats: IHabitat[] = [];
    @observable private habitatSelected: IHabitat = undefined;
    // https://jedwatson.github.io/react-select/
    // https://github.com/JedWatson/react-select/blob/master/examples/src/components/GithubUsers.js

    public constructor(props: IProps) {
        super(props);
//        let toto: ISelectProps;
    }

    public componentWillUpdate(nextProps: IProps) {
        if (nextProps.client !== this.props.client) {
            this.getHabitatsFromClient(nextProps.client).then(
                (habitats: IHabitat[]) => {
                    this.habitats = habitats;
                }
            );
        }
    }
    // private onChange = (habitat: IHabitat) => {
    //     this.habitat = habitat;
    //     this.props.handler(habitat);
    // }

    // private gotoHabitat = (element: any) => {
    //     // TODO : lien vers le fichier habitat
    //     console.log(element);
    // }

    // componentWillUpdate(nextProps: IProps) {
    //     // 
    // }
    private getHabitatsFromClient = (client: IClient): Promise<IHabitat[]> => {
        if (!client) {
            return Promise.resolve([]);
        }
        return fetch(`http://test.ideesalter.com/alia_searchHabitat.php?client_id=${client.id}`)
        .then((response) => response.json())
        .then((habitats) => {
            return habitats;
        });
    }
    
    private renderMenu: ItemListRenderer<IHabitat> = ({ items, itemsParentRef, query, renderItem }) => {
        const renderedItems = items.map(renderItem).filter(item => item != null);
        return (
            <Menu
                className={style(csstips.border('1px solid red'))}
                ulRef={itemsParentRef}
            >
                <MenuItem
                    disabled={true}
                    text={`${renderedItems.length} habitat ${renderedItems.length > 1 ? 's' : ''} trouvé`}
                />
                {renderedItems}
            </Menu>
        );
    };
    public render () {
        const initialContent = this.habitats ? (
            <MenuItem disabled={true} text={`${this.habitats.length} habitat` + (this.habitats.length > 1 ? `s` : '') + ` trouvé` + (this.habitats.length > 1 ? `s` : '')} />
        ) : (
            undefined
        );
        return (
            <HabitatSelect
                className={style(csstips.fillParent, csstips.border('1px solid red'))}
                items={this.habitats}
                itemPredicate={this.filterHabitat}
                itemRenderer={this.habitatRenderer}
                noResults={this.noResultRenderer}
                onItemSelect={(habitat: IHabitat) => { this.habitatSelected = habitat }}
//                    tagRenderer={(habitat: IHabitat) => habitat.adresse}
//                    tagInputProps={ this.tagInputProps }
//                    selectedItems={this.props.sheet.lines}
                popoverProps={{ minimal: true }}
//                    openOnKeyDown={false}
                disabled={false}
                // resetOnClose={false}
                // resetOnQuery={true}
                // resetOnSelect={false}
                initialContent={initialContent}
                scrollToActiveItem={true}
                filterable={true}
                itemListRenderer={this.renderMenu}
            >
                <Button
                    className={style(csstips.fillParent)}
                    alignText={Alignment.LEFT}
                    // text={this.habitatSelected}
                    text={this.habitatSelected ? this.habitatSelected : ' '}
                    rightIcon="caret-down"
                />
            </HabitatSelect>
        );
    }

    private filterHabitat: ItemPredicate<IHabitat> = (query, habitat) => {
        console.log('filterHabitat -' + query + '-')
        if (query.length === 0) {
            return true;
        }
        return habitat.adresse.toString().indexOf(query.toLowerCase()) >= 0;
    };
    
    private habitatRenderer: ItemRenderer<IHabitat> = (habitat: IHabitat, itemProps: IItemRendererProps): JSX.Element => {
        let modifiers: IItemModifiers = itemProps.modifiers;
        let handleClick: React.MouseEventHandler<HTMLElement> = itemProps.handleClick;
        let query: string = itemProps.query;
        if (!modifiers.matchesPredicate) {
            return null;
        }
    
        const label = ' (id=' + habitat.id + ')';
    
        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={label}
                key={habitat.id}
                onClick={handleClick}
                text={this.highlightText(habitat.adresse, query)}
            />
        );
    };

    private noResultRenderer: ItemRenderer<IHabitat> = (): JSX.Element => {
        return (
            <MenuItem disabled={true} text="No results."/>
        );
    };
 
    private highlightText = (text: string, query: string) => {
        let lastIndex = 0;
        const words = query
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map(this.escapeRegExpChars);
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
    
    private escapeRegExpChars = (text: string) => {
        return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    }
}
