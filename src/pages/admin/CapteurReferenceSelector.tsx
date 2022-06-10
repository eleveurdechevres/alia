import * as React from 'react';
import { Popover, Button, Position, Menu, MenuItem } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ICapteurReference } from 'src/interfaces/ICapteurReference';

interface IProps {
    globalStore: GlobalStore;
    capteurReferenceSelected: string | undefined;
    handleSelect: (capteurReference: string) => void;
}

@observer export class CapteurReferenceSelector extends React.Component<IProps, {}> {

    @observable capteurReferenceList: ICapteurReference[] = [];

    public constructor(props: IProps) {
        super(props);

        autorun(() => {
            this.props.globalStore.getAllCapteurReferences().then(
                (capteurReferences: ICapteurReference[]) => {
                    this.capteurReferenceList = capteurReferences;
                }
            )
        });
    }

    public render() {
        return (
            <Popover
                className={style(csstips.fillParent)}
                canEscapeKeyClose={true}
                content={this.buildCapteurReferenceList()}
                minimal={true}
                position={Position.BOTTOM_LEFT}
            >
                <Button
                    className={style(csstips.width(300))}
                    rightIcon="caret-down"
                    text={this.buildLegend(this.props.capteurReferenceSelected)}
                />
            </Popover>
        );
    }

    private buildCapteurReferenceList = () => {
        return (
            <Menu>
                {this.capteurReferenceList.map((capteurReference: ICapteurReference) =>
                    <MenuItem
                        key={this.buildKey(capteurReference.id)}
                        text={this.buildLegend(capteurReference.id)}
                        onClick={() => {
                            this.props.handleSelect(capteurReference.id);
                        }}
                    />
                )}
            </Menu>
        );
    }

    private buildKey = (id: string): string => {
        return 'CapteurReference.id.' + id;
    }

    private buildLegend = (id: string): string => {
        let capteurRefFound: ICapteurReference = (this.capteurReferenceList.find((capteurReference: ICapteurReference) => capteurReference.id === id));
        return capteurRefFound ?
            `${capteurRefFound.id} (${capteurRefFound.marque} - ${capteurRefFound.ref_fabricant})`
            : 'Sélectionner une reference...';
    }
}