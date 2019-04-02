import * as React from 'react';
import { observer } from 'mobx-react';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ISheet } from 'src/interfaces/ISheet';
import { style } from 'typestyle';
import * as csstips from 'csstips';

interface IProps {
    globalStore: GlobalStore;
    sheet: ISheet;
}

@observer export class SheetComponent extends React.Component<IProps, {}> {

    public constructor(props: IProps) {
        super(props);
    }

    public render () {
        return (
            <div
                className={style(csstips.margin(10), csstips.padding(10), { boxShadow: '1px 1px 10px #888' })}
            >
                {this.props.sheet.sheetName}
            </div>
        );
    }
}