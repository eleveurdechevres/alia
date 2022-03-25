import * as React from 'react';
// import { Select } from '@blueprintjs/select';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import { Button, Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ICapteurReference } from 'src/interfaces/ICapteurReference';

interface IProps {
    globalStore: GlobalStore,
    capteurReference: ICapteurReference,
    handleSelectCapteurReference: (capteurReference: ICapteurReference) => void;
}

// const TypeMesureSelect = Select.ofType<ITypeMesure>();

@observer export class CapteurReferenceSelector extends React.Component<IProps, {}> {

    @observable capteurList: ICapteurReference[] = [];

    constructor(props: IProps) {
        super(props);
    }

    public componentDidMount() {
        this.props.globalStore.getAllCapteurReferences().then((capteurReferences: ICapteurReference[]) => {
            this.capteurList = capteurReferences;
        });
    }

    public render() {

        return (
            <Popover
                // className={style(csstips.fillParent, csstips.width('100%'))}
                canEscapeKeyClose={true}
                minimal={true}
                position={Position.BOTTOM_LEFT}
                content={this.buildCapteurReferenceList()}
            >
                <Button
                    className={style(csstips.width('100%'))}
                    rightIcon="caret-down"
                    text={this.props.capteurReference ? this.renderCapteurReference(this.props.capteurReference) : 'Type de mesure...'}
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

    private buildCapteurReferenceList = (): JSX.Element => {
        const keyBase = Math.random();
        return (
            <Menu>
                { this.capteurList.map((capteurReference: ICapteurReference, index: number) => 
                    <MenuItem
                        key={keyBase + index}
                        text={this.renderCapteurReference(capteurReference)}
                        onClick={() => { this.props.handleSelectCapteurReference(capteurReference); }}
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

    private renderCapteurReference(capteurReference: ICapteurReference) {
        return capteurReference ? capteurReference.ref_fabricant + ' - ' + capteurReference.marque + ' (' + capteurReference.description + ')' : undefined;
    }
}
