import * as React from 'react';
import { observer } from 'mobx-react';
import * as Modal from '../../components/Modal';
import { ICapteur } from 'src/interfaces/ICapteurForPlan';
import 'react-table/react-table.css';
import * as DateUtils from '../../utils/DateUtils'
import { GlobalStore } from 'src/stores/GlobalStore';
import { IMission } from 'src/interfaces/IMission';
import { GraphBoard } from '../Graph/GraphBoard';
import { IHabitat } from 'src/interfaces/IHabitat';

interface IProps extends Modal.IProps {
    capteur: ICapteur;
    mission: IMission;
    habitat: IHabitat;
    globalStore: GlobalStore;
}

@observer export class ModalCapteur extends Modal.Modal<IProps> {


    public constructor(props: IProps) {
        super(props);
    }

    protected getTitle = () => {
        if (this.props.mission && this.props.capteur) {
            const stringDateDebut = DateUtils.dateTimeString(new Date(this.props.mission.date_debut));
            const stringDateFin = DateUtils.dateTimeString(new Date(this.props.mission.date_fin));
            return `${this.props.capteur.capteur_reference_id} [${this.props.capteur.id}], mission de ${stringDateDebut} à ${stringDateFin}`;
        }
        return 'Capteur';
    }

    protected renderInternalComponent = (): JSX.Element => {

        if (this.props.capteur === undefined) {
            return <React.Fragment/>
        }

        return (
            <React.Fragment>
                <GraphBoard
                    capteur={this.props.capteur}
                    globalStore={this.props.globalStore}
                    habitat={this.props.habitat}
                    mission={this.props.mission}
                />
            </React.Fragment>
        );
    }

    protected onAfterOpen = () => {
        // nada
    }

    protected onAfterClose = () => {
        // nada
    }
}
