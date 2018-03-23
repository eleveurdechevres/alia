import * as React from 'react';
import { observer } from 'mobx-react';
// import { observable } from 'mobx';

interface IProps {
    startDate: string,
    stopDate: string
}

@observer export class SunBehaviour extends React.Component<IProps, {}> {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return (
            <div/>
            // <circle cx="100" cy="100" r="50" stroke="black"/>
        )
    }
}