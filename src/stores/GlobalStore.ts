import { observable } from 'mobx';
import { IClient } from 'src/interfaces/IClient';
import { IHabitat } from 'src/interfaces/IHabitat';
import { IMission } from 'src/interfaces/IMission';
import { autorun } from 'mobx';
import { IPlan } from 'src/interfaces/IPlan';
import { NavBarTabEnum } from 'src/App';
import { ISheet, ESheetType } from 'src/interfaces/ISheet';
import { ISerieDef } from 'src/interfaces/ISeriesDef';
import { TMesure } from 'src/interfaces/Types';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { IChannelFromMission } from 'src/interfaces/IChannelFromMission';
import { IMesure, IAvgMesure } from 'src/managers/GraphDataManager';
import { dateToSql } from 'src/utils/DateUtils';
import { ICapteur } from 'src/interfaces/ICapteurForPlan';
import { IChannel } from 'src/interfaces/IChannel';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';
import { ICapteurVirtuel } from 'src/interfaces/ICapteurVirtuel';
import { IObservation } from 'src/interfaces/IObservation';
import { ICapteurVirtuelForMission } from 'src/interfaces/ICapteurVirtuelForMission';
import { Auth0ContextInterface, User } from '@auth0/auth0-react';
import { ICrossValue } from 'src/interfaces/ICrossValue';
import { ICapteurForMission } from 'src/interfaces/ICapteurForMission';

export type TPeriod = 'YEAR' | 'MONTH' | 'DAY';

export class GlobalStore {

    @observable public selectedTab: NavBarTabEnum = NavBarTabEnum.CLIENT;

    @observable public client: IClient = undefined;
    @observable public habitat: IHabitat = undefined;
    @observable public mission: IMission = undefined;
    @observable private _clients: IClient[] = [];
    @observable private _habitatsForClient: IHabitat[] = [];
    @observable private _missionsForHabitat: IMission[] = [];
    @observable private _planForHabitat: Map<number, IPlan[]> = new Map();

    @observable sheets: ISheet[] = [];
    @observable private closedSheets: Array<ISheet> = [];

    public constructor() {
        this.reloadClients();

        autorun(() => {
            if (this.client) {
                this.reloadHabitatsFromClient(this.client);
            }
        });

        autorun(() => {
            if (this.habitat) {
                this.reloadMissionsFromHabitat(this.habitat);
            }
        });
    }

    public isAuthenticated(context: Auth0ContextInterface<User>): boolean {
        const { isAuthenticated } = context;
        return isAuthenticated;
    }

    public getUser(context: Auth0ContextInterface<User>): User {
        const { user } = context;
        return user;
    }

    public isRoleAdmin(context: Auth0ContextInterface<User>): boolean {
        return this.isRole(context, 'admin');
    }

    public isRoleClient(context: Auth0ContextInterface<User>): boolean {
        return this.isRole(context, 'client');
    }

    private readUserRoles(context: Auth0ContextInterface<User>): string[] {
        const { user } = context;
        let roles: string[] = user ? user['http://demozero.net/roles'] : [];
        return roles;
    }

    public isRole(context: Auth0ContextInterface<User>, role: string): boolean {
        let roles: string[] = this.readUserRoles(context)
        return roles.find((currentRole) => currentRole === role) !== undefined;
    }
    
    public get clients(): IClient[] {
        return this._clients;
    }

    public get habitatsForClient(): IHabitat[] {
        return this._habitatsForClient;
    }

    public get missionsForHabitat(): IMission[] {
        return this._missionsForHabitat;
    }

    public get plansForHabitat(): Map<number, IPlan[]> {
        return this._planForHabitat;
    }

    private reloadClients() {
        this.getClients().then(
            (clients: IClient[]) => {
                this._clients = clients;
            }
        );
    }

    private reloadHabitatsFromClient(client: IClient) {
        this.getHabitatsFromClient(client).then(
            (habitats: IHabitat[]) => {
                this._habitatsForClient = habitats;
            }
        );
    }

    public reloadPlansForHabitat(habitatId: number) {
        this.getPlansForHabitat(habitatId).then(
            (plans: IPlan[]) => {
                this._planForHabitat.set(habitatId, plans);
            }
        );
    }

    private reloadMissionsFromHabitat(habitat: IHabitat) {
        this.getMissionsForHabitat(habitat).then(
            (missions: IMission[]) => {
                this._missionsForHabitat = missions;
            }
        );
    }

    private getClients = (): Promise<IClient[]> => {
        return fetch(`https://api.alia-france.com/alia_searchClient.php`)
        .then((response) => response.json())
        .then((clients) => clients);
    }

    // retourne les clients dont le nom contient la chaîne passée en paramètre
    public searchClients (nom: string): Promise<IClient[]> {
        if (!nom) {
            return Promise.resolve([]);
        }
        
        return fetch(`https://api.alia-france.com/alia_searchClient.php?nom=${nom}`)
            .then((response) => response.json())
            .then((clients) => clients);
    }

    // retourne les habitats correspondant au client passé en paramètre
    public getHabitatsFromClient = (client: IClient): Promise<IHabitat[]> => {
        if (!client) {
            return Promise.resolve([]);
        }
        return fetch(`https://api.alia-france.com/alia_searchHabitat.php?client_id=${client.id}`)
            .then((response) => response.json())
            .then((habitats) => habitats);
    }

    public getPlansForHabitat = (habitatId: number) => {
        if (!habitatId) {
            return Promise.resolve([]);
        }
        return fetch(`https://api.alia-france.com/alia_searchPlan.php?habitat_id=${habitatId}`)
            .then((response) => response.json())
            .then((plans) => plans);
    }
    
    public getMissionsForHabitat = (habitat: IHabitat): Promise<IMission[]> => {
        if (!habitat) {
          return Promise.resolve([]);
        }
        return fetch(`https://api.alia-france.com/alia_searchMission.php?habitat_id=${habitat.id}`)
          .then((response) => response.json())
          .then((missions) => missions);
    }

    //   ______________________
    // _/ Channels for mission \___________________________________________________________
    public getAllChannelsOfTypeFromMission = (type: TMesure, missionId: number): Promise<IChannelOfTypeFromMission[]> => {
        if (!type || !missionId) {
          return Promise.resolve([]);
        }
        return fetch(`https://api.alia-france.com/alia_searchAllChannelsOfTypeFromMission.php?type=${type}&mission_id=${missionId}`)
            .then((response) => response.json())
            .then((results) => results.map((res: IChannelOfTypeFromMission) => {
                let ext = res;  
                ext._objId = 'IChannelOfTypeFromMission';
                return ext;
            }));
    }

    public getAllChannelsFromMission = (missionId: number): Promise<IChannelFromMission[]> => {
        if (!missionId) {
          return Promise.resolve([]);
        }
        return fetch(`https://api.alia-france.com/alia_searchAllChannelsFromMission.php?mission_id=${missionId}`)
            .then((response) => response.json())
            .then((results) => results.map((res: IChannelFromMission) => {
                let ext = res;  
                ext._objId = 'IChannelFromMission';
                return ext;
            }));
    }

    //   _______________________________
    // _/ Capteurs Virtuels for mission \__________________________________________________
    public getAllCapteursVirtuelsOfTypeFromMission = (type: TMesure, missionId: number): Promise<ICapteurVirtuelForMission[]> => {
        if (!missionId) {
          return Promise.resolve([]);
        }
        return fetch(`https://api.alia-france.com/alia_searchCapteursVirtuelsOfTypeForMission.php?type=${type}&mission_id=${missionId}`)
            .then((response) => response.json())
            .then((results) => results.map((res: ICapteurVirtuelForMission) => {
                let ext = res;  
                ext._objId = 'ICapteurVirtuelForMission';
                return ext;
            }));
        }

    public getAllCapteursVirtuelsFromMission = (missionId: number): Promise<ICapteurVirtuelForMission[]> => {
        if (!missionId) {
          return Promise.resolve([]);
        }
        return fetch(`https://api.alia-france.com/alia_searchCapteursVirtuelsForMission.php?mission_id=${missionId}`)
            .then((response) => response.json())
            .then((results) => results.map((res: ICapteurVirtuelForMission) => {
                let ext = res;  
                ext._objId = 'ICapteurVirtuelForMission';
                return ext;
            }));
    }

    public getCapteur(capteurId: number, missionId: number): Promise<ICapteur> {
        return fetch(`https://api.alia-france.com/alia_getCapteur.php?capteur_id=${capteurId}&mission_id=${missionId}`)
            .then((response) => response.json())
            .then((results) => results[0]);
    }

    public getAvailableCapteurs(dateDebut: Date, dateFin: Date): Promise<IAvailableCapteur[]> {
        return fetch(`https://api.alia-france.com/alia_getAvailableCapteurs.php?date_debut=${dateToSql(dateDebut)}&date_fin=${dateToSql(dateFin)}`)
            .then((response) => response.json())
            .then((results) => 
                results.map((result: any) => {
                    return {
                        id: result.id,
                        capteur_reference_id: result.capteur_reference_id,
                        marque: result.marque,
                        ref_fabricant: result.ref_fabricant,
                        description: result.description,
                        available: result.available === 'true' ? true : false
                    }
                })
            );
    }

    public getChannel(channelId: number, capteurReferenceId: string): Promise<IChannel> {
        return fetch(`https://api.alia-france.com/alia_getChannel.php?channel_id=${channelId}&capteur_reference_id=${capteurReferenceId}`)
            .then((response) => response.json())
            .then((results) => results[0]);
    }

    public getMesureType(measureTypeId: number): Promise<ITypeMesure> {
        return fetch(`https://api.alia-france.com/alia_getTypeMesure.php?id=${measureTypeId}`)
            .then((response) => response.json())
            .then((results) => results);
    }

    public getTypeMesures = () => {
        var request = `https://api.alia-france.com/alia_getTypeMesures.php`;
        return fetch(request)
            .then((response) => response.json())
            .then((results) => results);
    }

    public getPlan(planId: number): Promise<IPlan> {
        return fetch(`https://api.alia-france.com/alia_getPlan.php?id=${planId}`)
            .then((response) => response.json())
            .then((results) => results);
    }

    public getMesures = (missionId: number, capteurId: number, channelId: number, dateBegin: Date, dateEnd: Date): Promise<IMesure[]> => {
        // LOAD DATA from AEROC
        // date_begin=2017/12/09 20:13:04&date_end=2018/01/24 21:19:06
        // console.log('https://api.alia-france.com/alia_readMesure.php?capteur_id=' + capteurId 
        // + '&channel_id=' + channelId + '&date_begin=' + dateBegin + '&date_end=' + dateEnd)
        // return fetch('https://api.alia-france.com/alia_readMesure.php?capteur_id=' + capteurId
        // + '&channel_id=' + channelId + '&date_begin=2017/12/09 20:13:04&date_end=2017/12/11 21:19:06')
        var request = 'https://api.alia-france.com/alia_readMesure.php?mission_id=' + missionId + '&capteur_id=' + capteurId
            + '&channel_id=' + channelId + '&date_begin=' + dateToSql(dateBegin) + '&date_end=' + dateToSql(dateEnd);
        return fetch(request)
            .then((response) => response.json())
            .then((results: {date: string, valeur: number}[]) => {
                let resultsTyped: IMesure[] = results.map(
                    (r: {date: string, valeur: number}) => {
                        return {date: new Date(r.date), valeur: r.valeur};
                    }
                )
                return resultsTyped;
            }
        );
    }

    public getAvgMesures = (missionId: number, capteurId: number, channelId: number, dateBegin: Date, dateEnd: Date, period: TPeriod): Promise<IAvgMesure[]> => {
        const body: string = JSON.stringify({
            mission_id: missionId,
            capteur_id: capteurId,
            channel_id: channelId,
            date_begin: dateBegin,
            date_end: dateEnd,
            period: period
        });
        return fetch(`https://api.alia-france.com/alia_readAvgMesure.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        )
        .then((response) => response.json())
        .then((results: {JourCourant: string, moy: string, count: string}[]) => {
            let resultsTyped: IAvgMesure[] = results.map(
                (r: {JourCourant: string, moy: string, count: string}) => {
                    return {
                        date: new Date(r.JourCourant),
                        moy: parseInt(r.moy, 10),
                        count: parseInt(r.count, 10)
                    };
                }
            )
            return resultsTyped;
        });
    }

    public getMesuresViruelles = (missionId: number, capteurVirtuelId: number, dateBegin: Date, dateEnd: Date): Promise<IMesure[]> => {
        const body: string = JSON.stringify({
            mission_id: missionId,
            capteur_virtuel_id: capteurVirtuelId,
            date_begin: dateBegin,
            date_end: dateEnd
        });
        return fetch(`https://api.alia-france.com/alia_readMesureVirtuelle.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        )
        .then((response) => response.json())
        .then((results: {date: string, valeur: number}[]) => {
            let resultsTyped: IMesure[] = results.map(
                (r: {date: string, valeur: number}) => {
                    return {date: new Date(r.date), valeur: r.valeur};
                }
            )
            return resultsTyped;
        });
    }

    public getAvgMesuresViruelles = (missionId: number, capteurVirtuelId: number, dateBegin: Date, dateEnd: Date, period: TPeriod): Promise<IAvgMesure[]> => {
        const body: string = JSON.stringify({
            mission_id: missionId,
            capteur_virtuel_id: capteurVirtuelId,
            date_begin: dateBegin,
            date_end: dateEnd,
            period: period
        });
        return fetch(`https://api.alia-france.com/alia_readAvgMesureVirtuelle.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        )
        .then((response) => response.json())
        .then((results: {JourCourant: string, moy: string, count: string}[]) => {
            let resultsTyped: IAvgMesure[] = results.map(
                (r: {JourCourant: string, moy: string, count: string}) => {
                    return {
                        date: new Date(r.JourCourant),
                        moy: parseInt(r.moy, 10),
                        count: parseInt(r.count, 10)
                    };
                }
            )
            return resultsTyped;
        });
    }

    public getCrossMesures = (
        missionId: number,
        dateBegin: Date,
        dateEnd: Date,
        capteurX: IChannelOfTypeFromMission,
        capteurY: IChannelOfTypeFromMission
    ): Promise<ICrossValue[]> => {
        // date_begin=2017/12/09 20:13:04&date_end=2018/01/24 21:19:06
        let httpReq = 'https://api.alia-france.com/alia_searchCrossMesures.php?' 
            + 'mission_id=' + missionId
            + '&date_begin=' + dateToSql(dateBegin) 
            + '&date_end=' + dateToSql(dateEnd)
            + '&capteur1_id=' + capteurX.capteur_id
            + '&channel1_id=' + capteurX.channel_id
            + '&capteur2_id=' + capteurY.capteur_id
            + '&channel2_id=' + capteurY.channel_id;
        console.log(httpReq);
        return fetch(httpReq)
            .then((response) => response.json())
            .then((datas: any) => {
                return datas.map((data: any): ICrossValue => { return {
                    date: data.date,
                    channel1: Number.parseFloat(data.channel1),
                    channel2: Number.parseFloat(data.channel2)
                }})
            });
    }

    public getMeteo = (missionId: number, typeMesureId: number, dateBegin: Date, dateEnd: Date): Promise<IMesure[]> => {
        var request = 'https://api.alia-france.com/alia_readMeteo.php?mission_id=' + missionId
            + '&type_mesure_id=' + typeMesureId + '&date_begin=' + dateToSql(dateBegin) + '&date_end=' + dateToSql(dateEnd);
            
        console.log('getMeteo ' + request);
        return fetch(request)
            .then((response) => response.json())
            .then((results: {date: string, valeur: number}[]) => {
                let resultsTyped: IMesure[] = results.map(
                    (r: {date: string, valeur: number}) => {
                        return {date: new Date(r.date), valeur: r.valeur};
                    }
                )
                return resultsTyped;
            });
    }

    public getCountMesuresForChannelMission = (missionId: number, capteurId: number, channelId: number): Promise<number> => {
        if (!channelId || !missionId) {
            return Promise.resolve(undefined);
        }
        var request = 'https://api.alia-france.com/alia_getCountMesuresForChannelMission.php?mission_id=' + missionId + '&capteur_id=' + capteurId + '&channel_id=' + channelId;
        return fetch(request)
            .then((response) => response.json())
            .then((results: { count: number }[]) => {
                console.log('getCountMesuresForChannelMission ' + results[0].count)
                return results[0].count;
            });
    }

    public navigateToTab = (selectedTab: NavBarTabEnum) => {
        this.selectedTab = selectedTab;
    }


    public writeClient = (client: IClient, password: string) => {
        return fetch(`https://api.alia-france.com/alia_writeClient.php` +
            `?id=` + client.id +
            `&nom=` + client.nom + 
            `&adresse=` + client.adresse + 
            `&telephone=` + client.telephone + 
            `&email=` + client.email +
            `&password=` + encodeURIComponent(password)
        ).then((response) => {
            if (response.status === 200) {
                this.reloadClients();
            }
            else {
                console.log(response);
                // TODO : impossible de sauvegarder...
            }
        });
    }

    public writeHabitat = (habitat: IHabitat, password: string) => {
        return fetch(`https://api.alia-france.com/alia_writeHabitat.php` +
            `?id=` + habitat.id +
            `&client_id=` + this.client.id + 
            `&adresse=` + habitat.adresse + 
            `&latitude=` + habitat.gps_latitude + 
            `&longitude=` + habitat.gps_longitude + 
            `&elevation=` + habitat.gps_elevation + 
            `&surfaceM2=` + habitat.surfaceM2 + 
            `&password=` + encodeURIComponent(password)
        ).then((response) => {
            if (response.status === 200) {
                this.reloadHabitatsFromClient(this.client);
            }
            else {
                console.log(response);
                // TODO : impossible de sauvegarder...
            }
        });
    }

    public writeCapteurForMission = (missionId: number, capteurForMission: ICapteurForMission, then: () => void) => {
        const body: string = JSON.stringify({
            mission_id: missionId,
            capteur_id: capteurForMission.mission_id,
            plan_id: capteurForMission.plan_id,
            coordonneePlanX: capteurForMission.coordonneePlanX,
            coordonneePlanY: capteurForMission.coordonneePlanY,
            coordonneePlanZ: capteurForMission.coordonneePlanZ,
            label: capteurForMission.label,
            description: capteurForMission.description
        });
        fetch(`https://api.alia-france.com/alia_addCapteurToMission.php`, {
                method: 'POST',
                headers: {
                    // 'Access-Control-Allow-Origin:': '*',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        ).then((response) => {
            if (response.status === 200) {
                then();
            }
            else {
                console.log(response);
                // TODO : impossible de sauvegarder...
            }
        });
    }

    public writeCapteurVirtuel = (capteurVirtuel: ICapteurVirtuel, then: () => void) => {
        const body: string = JSON.stringify({
            mission_id: capteurVirtuel.mission_id,
            plan_id: capteurVirtuel.plan_id,
            coordonneePlanX: capteurVirtuel.coordonneePlanX,
            coordonneePlanY: capteurVirtuel.coordonneePlanY,
            coordonneePlanZ: capteurVirtuel.coordonneePlanZ,
            label: capteurVirtuel.label,
            description: capteurVirtuel.description,
            type_mesure: capteurVirtuel.type_mesure
        });
        fetch(`https://api.alia-france.com/alia_writeCapteurVirtuel.php`, {
                method: 'POST',
                headers: {
                    // 'Access-Control-Allow-Origin:': '*',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        ).then((response) => {
            if (response.status === 200) {
                then();
            }
            else {
                console.log(response);
                // TODO : impossible de sauvegarder...
            }
        });
    }

    public writeObservation = (observation: IObservation, then: () => void) => {
        const body: string = JSON.stringify({
            mission_id: observation.mission_id,
            plan_id: observation.plan_id,
            coordonneePlanX: observation.coordonneePlanX,
            coordonneePlanY: observation.coordonneePlanY,
            coordonneePlanZ: observation.coordonneePlanZ,
            label: observation.label,
            description: observation.description,
            dateObservation: observation.dateObservation,
            image: observation.image
        });
        
        fetch(`https://api.alia-france.com/alia_writeObservation.php`, {
                method: 'POST',
                headers: {
                //     'Access-Control-Allow-Origin:': '*',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        ).then((response) => {
            if (response.status === 200) {
                then();
            }
            else {
                console.log(response);
                // TODO : impossible de sauvegarder...
            }
        });
    }

    public writeMesureVirtuelle = (missionId: number, capteurVirtuel: ICapteurVirtuel, mesure: IMesure, then: () => void) => {
        const body: string = JSON.stringify({
            mission_id: missionId,
            capteur_virtuel_id: capteurVirtuel.id,
            date: dateToSql(mesure.date),
            valeur: mesure.valeur
        });
        console.log('writeMesureVirtuelle', body)
        fetch(`https://api.alia-france.com/alia_writeMesureVirtuelle.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        ).then((response) => {
            if (response.status === 200) {
                then();
            }
            else {
                console.log(response);
            }
        });
    }

    public deleteMesureVirtuelle = (missionId: number, capteurVirtuel: ICapteurVirtuel, mesure: IMesure, then: () => void) => {
        const body: string = JSON.stringify({
            mission_id: missionId,
            capteur_virtuel_id: capteurVirtuel.id,
            date: dateToSql(mesure.date)
        });
        console.log(body)
        fetch(`https://api.alia-france.com/alia_deleteMesureVirtuelle.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        ).then((response) => {
            if (response.status === 200) {
                then();
            }
            else {
                    console.log(response);
            }
        });
    }

    public writePlan = (plan: IPlan, password: string) => {
        return fetch(`https://api.alia-france.com/alia_writePlan.php`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    id: plan.id,
                    habitat_id: plan.habitatId,
                    etage: plan.etage,
                    description: plan.description,
                    plan: plan.plan,
                    password: password
                })
            }
        ).then((response) => {
            if (response.status === 200) {
                this.reloadHabitatsFromClient(this.client)
            }
            else {
                console.log(response);
                // TODO : impossible de sauvegarder...
            }
        });
    }

    public writeMission = (mission: IMission, password: string) => {
        const body: string = JSON.stringify({
            id: mission.id,
            database_id: mission.databaseId,
            habitat_id: this.habitat.id,
            date_debut: mission.date_debut,
            date_fin: mission.date_fin,
            password: password
        });
        
            console.log(body);
        fetch(
            `https://api.alia-france.com/alia_writeMission.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        ).then(
            (response) => {
                console.log(JSON.stringify(response));
                if (response.status === 200) {
                    this.reloadMissionsFromHabitat(this.habitat);
                }
                else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
                }
        });
    }  

    public deleteClient = (client: IClient, password: string) => {
        return fetch(`https://api.alia-france.com/alia_deleteClient.php?id=` + client.id + `&password=` + encodeURIComponent(password))
            .then((response) => {
                if (response.status === 200) {
                    this.reloadClients();
                }
                else {
                    console.log(response);
                    // TODO : impossible de supprimer...
                }
            }
        )
    }

    public deleteHabitat = (habitat: IHabitat, password: string) => {
        return fetch(`https://api.alia-france.com/alia_deleteHabitat.php?id=` + habitat.id + `&password=` + encodeURIComponent(password))
            .then((response) => {
                if (response.status === 200) {
                    this.reloadHabitatsFromClient(this.client)
                }
                else {
                    console.log(response);
                    // TODO : impossible de supprimer...
                }
            }
        );
    }

    public deletePlan = (plan: IPlan, password: string) => {
        return fetch(`https://api.alia-france.com/alia_deletePlan.php?id=` + plan.id + `&password=` + encodeURIComponent(password))
            .then((response) => {
                if (response.status === 200) {
                    this.reloadPlansForHabitat(plan.habitatId)
                }
                else {
                    console.log(response);
                    // TODO : impossible de supprimer...
                }
            }
        );
    }

    public deleteMission = (mission: IMission, password: string) => {
        fetch(`https://api.alia-france.com/alia_deleteMission.php?id=` + mission.id + `&password=` + encodeURIComponent(password))
            .then((response) => {
                if (response.status === 200) {
                    this.reloadMissionsFromHabitat(this.habitat);
                }
                else {
                    console.log(response);
                    // TODO : impossible de supprimer...
                }
            }
        );
    }

    public getDataClusterList = () => {
        return fetch(`https://api.alia-france.com/alia_getClusters.php`)
        .then((response) => response.json())
        .then((results: {databaseId: string}[]) => {
            return results;
        });
    }

    public createSheet = (sheetType: ESheetType, mission: IMission, dateDebut: Date, dateFin: Date): void => {
        let sheet: ISheet = {
            sheetType: sheetType,
            isReadOnly: false,
            isVisible: true,
            series: [],
            sheetDef: {
                client: this.client,
                habitat: this.habitat,
                mission: mission,
                dateDebutMission: dateDebut,
                dateFinMission: dateFin
            },
            sheetName: this.createNewName('New sheet', this.sheets.map((s: ISheet) => s.sheetName))
        };
        this.sheets.push(sheet);
    }

    public deleteSheet = (sheet: ISheet) => {
        let index = this.sheets.findIndex((s: ISheet) => s === sheet);
        this.sheets.splice(index, 1);
    }

    public closeSheet = (sheet: ISheet) => {
        this.closedSheets.push(sheet);
        this.deleteSheet(sheet);
    }

    public renameSheet = (sheet: ISheet, newName: string) => {
        let index = this.sheets.findIndex((s: ISheet) => s === sheet);
        this.sheets[index].sheetName = newName;
    }
    public removeSeriesFromSheet = (sheet: ISheet, seriesDef: ISerieDef) => {
        // TODO
    }

    public addSeriesToSheet = (sheet: ISheet, seriesDef: ISerieDef) => {
        // TODO
    }

    private createNewName = (currentName: string, allNames: string[]): string => {

        let racine = currentName;
        let index = 1;
        // If name is like "ccccccc (d)"
        let match = currentName.match(/^(.*) \((\d+)\)$/);
        if ( match ) {
            racine = match[1];
            index = parseInt(match[2], 10);
            index++;
            let newName = racine + ' (' + index + ')';
            if ( allNames.find((name: string) => name === newName )) {
                return this.createNewName(newName, allNames);
            }
            return newName;
        }
        else {
            let newName = racine + ' (' + index + ')';
            if ( allNames.find((name: string) => name === newName )) {
                return this.createNewName(newName, allNames);
            }
            return newName;
        }
    }

}