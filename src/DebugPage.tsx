import * as React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@blueprintjs/core';

interface IPropsDebugPage {
}

const serie1 = [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const serie2 = [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];

@observer export class DebugPage extends React.Component<IPropsDebugPage> {


    public render() {
        return (
            <div>
                <div>debug page</div>
                <div>
                    <Button
                        text="go"
                        onClick={() => { this.convolution(serie1, serie2)}}
                    />
                </div>
            </div>
        );
    }


    private convolution = (s1: number[], s2: number[]) => {
        let nbElements = serie1.length;
        for (let x = 0 ; x < nbElements ; x ++) {
            let sum = 0;
            for (let t = 0 ; t < nbElements ; t ++) {
                // console.log(s1[t] + ' ' + s2[x - t])
                if (s1[t] !== undefined && s2[x - t] !== undefined) {
                    sum += s1[t] * s2[x - t];
                }
            }
            console.log(`x=${x} f1={} f*g=${sum}`);
        }
    }
}
