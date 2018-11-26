import * as React from 'react';
import { observer } from 'mobx-react';

interface IPropsDebugPage {
}

@observer export class DebugPage extends React.Component<IPropsDebugPage> {

    public render() {
        return (
            <div>
                debug page
            </div>
        );
    }
}
