import * as React from 'react';
import * as d3 from 'd3';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
// import { autorun } from 'mobx';
import * as Modal from '../../components/Modal';
import { IObservation } from 'src/interfaces/IObservation';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import * as FormatUtils from '../../utils/FormatUtils';

interface IProps extends Modal.IProps {
    observation: IObservation;
}

@observer export class ModalObservation extends Modal.Modal<IProps> {

    private imageRef: SVGGElement;
    private imageData: string;
    @observable private width: number;
    @observable private height: number;

    public constructor(props: IProps) {
        super(props);
    }

    protected getTitle = () => {
        return this.props.observation ?
            `${this.props.observation.label} [${this.props.observation.id}] (${FormatUtils.dateForGui(new Date(this.props.observation.dateObservation))})`
            :
            'Observation';
    }

    protected onAfterOpen = () => {
        if (this.props.observation) {
            var request = `http://test.ideesalter.com/alia_afficheImageObservation.php?observation_id=${this.props.observation.id}`;
            fetch(request)
            .then((response) => response.text())
            .then((responseData) => {
                this.imageData = responseData;

                var image = d3.select(this.imageRef);
    
                image
                    .attr('opacity', 0)
                    .attr('xlink:href', this.imageData)
                    .attr('x', 0)
                    .attr('y', 0)
                    .transition()
                    .attr('opacity', 1);
                this.getImageSize(this.imageData);
            });
        }
    }
    
    protected onAfterClose = () => {
        // Nada
    }

    protected renderInternalComponent = (): JSX.Element => {
        return (
            <React.Fragment>
                <div className={style(csstips.vertical)}>
                    {this.props.observation ? <p>{FormatUtils.formatTextWithBr(this.props.observation.description)}</p> : <React.Fragment/>}
                    <svg width={this.width} height={this.height}>
                        <image ref={(ref) => {this.imageRef = ref}} />
                    </svg>
                </div>
            </React.Fragment>
        );
    }

    private getImageSize = (data: string) => {
        let i = new Image(); 
        i.onload = () => {
            if ( this.width === undefined && this.height === undefined ) {
                this.width = i.width;
                this.height = i.height;
            }
        };
        i.src = data;
    }

}
