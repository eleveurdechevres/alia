import * as React from 'react';
import { observer } from 'mobx-react';
import { ICapteur } from 'src/interfaces/ICapteur';
import { GraphBoard } from '../Graph/GraphBoard';
import { GlobalStore } from 'src/stores/GlobalStore';
import { IMission } from 'src/interfaces/IMission';
import { IHabitat } from 'src/interfaces/IHabitat';
import * as Modal from '../../components/Modal';

interface IProps extends Modal.IProps {
    capteur: ICapteur;
    globalStore: GlobalStore;
    habitat: IHabitat;
    planId: number;
    mission: IMission;
}

@observer export class ModalCapteur extends Modal.Modal<IProps> {

    protected renderInternalComponent = (): JSX.Element => {
        return (
            <GraphBoard
                globalStore={this.props.globalStore}
                habitat={this.props.habitat}
                capteur={this.props.capteur}
                mission={this.props.mission}
            />
        );
    }
}
