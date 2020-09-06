import * as React from 'react';
// import * as d3 from 'd3';
import { observer } from 'mobx-react';
// import { observable } from 'mobx';
// import { autorun } from 'mobx';
import * as Modal from '../../components/Modal';
// import { style } from 'typestyle/lib';
// import * as csstips from 'csstips';
// import * as FormatUtils from '../../utils/FormatUtils';
import { ICapteurVirtuel } from 'src/interfaces/ICapteurVirtuel';

interface IProps extends Modal.IProps {
    capteurVirtuel: ICapteurVirtuel;
}

@observer export class ModalCapteurVirtuel extends Modal.Modal<IProps> {

    public constructor(props: IProps) {
        super(props);
        // autorun(() => {
        //     if (this.props.capteurVirtuel) {
        //         var request = `http://test.ideesalter.com/alia_afficheImageObservation.php?observation_id=${this.props.observation.id}`;
        //         fetch(request)
        //         .then((response) => response.text())
        //         .then((responseData) => {
        //             this.imageData = responseData;

        //             var image = d3.select(this.imageRef);
        
        //             image
        //                 .attr('opacity', 0)
        //                 .attr('xlink:href', this.imageData)
        //                 .attr('x', 0)
        //                 .attr('y', 0)
        //                 .transition()
        //                 .attr('opacity', 1);
        //             this.getImageSize(this.imageData);
        //         });
        //     }
        // });
    }

    protected renderInternalComponent = (): JSX.Element => {
        return (
            <React.Fragment>
                <div>
                    Toto
                </div>
            </React.Fragment>
        );
    }
}
