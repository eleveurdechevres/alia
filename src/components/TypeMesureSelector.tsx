import * as React from 'react';
// import { Select } from '@blueprintjs/select';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import { Button, Menu, MenuItem, Popover, Position } from '@blueprintjs/core';

interface IProps {
    typeMesure: ITypeMesure,
    handleSelectTypeMesure: (typeMesure: ITypeMesure) => void;
}

// const TypeMesureSelect = Select.ofType<ITypeMesure>();

@observer export class TypeMesureSelector extends React.Component<IProps, {}> {

    @observable typeMesureList: ITypeMesure[] = [];

    constructor(props: IProps) {
        super(props);
    }

    public componentDidMount() {
        this.getTypeMesures();
    }

    public render() {

        return (
            <Popover
                // className={style(csstips.fillParent, csstips.width('100%'))}
                canEscapeKeyClose={true}
                minimal={true}
                position={Position.BOTTOM_LEFT}
                content={this.buildTypeMesureList()}
            >
                <Button
                    className={style(csstips.width('100%'))}
                    rightIcon="caret-down"
                    text={this.props.typeMesure ? this.renderTypeMesure(this.props.typeMesure) : 'Type de mesure...'}
                />
            </Popover>

            // <TypeMesureSelect
            //     className={style({width: '200px', height: '50px'})}
            //     items={this.typeMesureList}
            //     itemRenderer={this.itemRenderer}
            //     onItemSelect={() => { console.log('item select') }}
            //     // activeItem={this.props.typeMesure}
            //     popoverProps={{ minimal: true }}
            //     filterable={false}
            // >
            // </TypeMesureSelect>
        );
    }

    private buildTypeMesureList = (): JSX.Element => {
        const keyBase = Math.random();
        return (
            <Menu>
                { this.typeMesureList.map((typeMesure: ITypeMesure, index: number) => 
                    <MenuItem
                        key={keyBase + index}
                        text={this.renderTypeMesure(typeMesure)}
                        onClick={() => { this.props.handleSelectTypeMesure(typeMesure); }}
                    />
                ) }
            </Menu>
        );
    }

    // private itemRenderer = (typeMesure: ITypeMesure, itemRendererProps: IItemRendererProps): JSX.Element => {
    //     const keyBase = Math.random();
    //     return (
    //         <MenuItem key={keyBase + itemRendererProps.index} text={this.renderTypeMesure(typeMesure)}/>
    //     )
    // }

    private renderTypeMesure(typeMesure: ITypeMesure) {
        return typeMesure ? typeMesure.measure_type + ' (' + typeMesure.unit + ')' : undefined;
    }

    private getTypeMesures = () => {
        var request = `http://test.ideesalter.com/alia_getTypeMesures.php`;
        return fetch(request)
            .then((response) => {
                return( response.json() );
            })
            .then((typeMesureList: ITypeMesure[]) => {
                this.typeMesureList = typeMesureList;
            }
        );
    }
}
