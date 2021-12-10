import * as React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@blueprintjs/core';

interface IPropsDebugPage {
}

// const serie1 = [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// const serie2 = [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];

type TSerie = {date: number, channel1: number, channel2: number};
// const crossData: TSerie[] = [
//     {date: 600, channel1: 3, channel2: 1},
//     {date: 601, channel1: 2, channel2: 2},
//     {date: 602, channel1: 4, channel2: 1},
//     {date: 603, channel1: 5, channel2: 1},
//     {date: 604, channel1: 2, channel2: 1},
//     {date: 605, channel1: 1, channel2: 3},
//     {date: 606, channel1: 7, channel2: 2},
//     {date: 607, channel1: 2, channel2: 3},
//     {date: 608, channel1: 1, channel2: 2},
//     {date: 609, channel1: 3, channel2: 1},
//     {date: 610, channel1: 2, channel2: 1},
//     {date: 611, channel1: 2, channel2: 1},
//     {date: 612, channel1: 2, channel2: 2},
//     {date: 613, channel1: 3, channel2: 1},
//     {date: 614, channel1: 4, channel2: 4}
// ];

const crossData: TSerie[] = [
    {date: 600, channel1: 2, channel2: 2},
    {date: 601, channel1: 2, channel2: 2},
    {date: 602, channel1: 3, channel2: 2},
    {date: 603, channel1: 4, channel2: 2},
    {date: 604, channel1: 5, channel2: 2},
    {date: 605, channel1: 4, channel2: 2},
    {date: 606, channel1: 3, channel2: 4},
    {date: 607, channel1: 2, channel2: 5},
    {date: 608, channel1: 2, channel2: 6},
    {date: 609, channel1: 2, channel2: 5},
    {date: 610, channel1: 2, channel2: 4},
    {date: 611, channel1: 2, channel2: 3},
    {date: 612, channel1: 2, channel2: 2},
    {date: 613, channel1: 2, channel2: 2},
    {date: 614, channel1: 2, channel2: 2}
];

@observer export class DebugPage extends React.Component<IPropsDebugPage> {


    public render() {
        return (
            <div>
                <div>debug page</div>
                <div>
                    <Button
                        text="go"
                        onClick={() => { this.convolution(crossData)}}
                    />
                </div>
            </div>
        );
    }


    private convolution = (rows: TSerie[]) => {
        let nbElements = rows.length;
        // let bigSum = 0;
        for (let x = 0 ; x < nbElements ; x ++) {
            let sum = 0;
            for (let t = 0 ; t < nbElements ; t ++) {
                // console.log(JSON.stringify(rows[t]) + ' ' + JSON.stringify(rows[x - t]))
                if (rows[t] !== undefined && rows[x - t] !== undefined) {
                    sum += rows[t].channel1 * rows[x - t].channel2;
                    // bigSum += sum;
                    // sum = sum / bigSum;
                }
            }
            const dateDebut = rows[0].date;
            const dateFin = rows[nbElements - 1].date;
            const pointMilieu = (dateFin - dateDebut) / 2 + dateDebut;
            const date = rows[x].date - pointMilieu;
            console.log(`${rows[x].date}, date=${date / 2}, x=${x} f1={} f*g=${sum}`);
        }
    }
}
