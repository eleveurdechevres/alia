import * as React from 'react';
import { Popover, Button, Position, Menu, MenuItem } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { GlobalStore } from 'src/stores/GlobalStore';

interface IProps {
    globalStore: GlobalStore;
    databaseIdSelected: string | undefined;
    handleSelect: (databaseId: string) => void;
}

@observer export class DataClusterSelector extends React.Component<IProps, {}> {

    @observable cluserList: string[] = [];

    public constructor(props: IProps) {
        super(props);

        autorun(() => {
            this.props.globalStore.getDataClusterList().then(
                (cluserList: {databaseId: string}[]) => {
                    const cluserIdList = cluserList.map((cluster: {databaseId: string}) => cluster.databaseId)
                    this.cluserList = cluserIdList;
                }
            )
        });
    }

    public render() {
        return (
            <Popover
                className={style(csstips.fillParent)}
                canEscapeKeyClose={true}
                content={this.buildClusterList()}
                minimal={true}
                position={Position.BOTTOM_LEFT}
            >
                <Button
                    className={style(csstips.width(300))}
                    rightIcon="caret-down"
                    text={this.buildLegend(this.props.databaseIdSelected)}
                />
            </Popover>
        );
    }

    private buildClusterList = () => {
        return (
            <Menu>
                {this.cluserList.map((databaseId: string) =>
                    <MenuItem
                        key={this.buildKey(databaseId)}
                        text={this.buildLegend(databaseId)}
                        onClick={() => {
                            this.props.handleSelect(databaseId);
                        }}
                    />
                )}
            </Menu>
        );
    }

    private buildKey = (databaseId: string): string => {
        return 'DataClusterSelector.databaseId.' + databaseId;
    }

    private buildLegend = (databaseId: string): string => {
        return databaseId ?
            databaseId
            : 'select cluster...';
    }
}