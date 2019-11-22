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
import { IMesure } from 'src/managers/GraphDataManager';
import { dateToSql } from 'src/utils/DateUtils';
import { ICapteur } from 'src/interfaces/ICapteur';
import { IChannel } from 'src/interfaces/IChannel';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';

export class GlobalStore {

    @observable public selectedTab: NavBarTabEnum = NavBarTabEnum.CLIENT;

    @observable public client: IClient = undefined;
    @observable public habitat: IHabitat = undefined;
    @observable public mission: IMission = undefined;
    @observable private _clients: IClient[] = [];
    @observable private _habitatsForClient: IHabitat[] = [];
    @observable private _missionsForHabitat: IMission[] = [];

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

    public get clients(): IClient[] {
        return this._clients;
    }

    public get habitatsForClient(): IHabitat[] {
        return this._habitatsForClient;
    }

    public get missionsForHabitat(): IMission[] {
        return this._missionsForHabitat;
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

    private reloadMissionsFromHabitat(habitat: IHabitat) {
        this.getMissionsForHabitat(habitat).then(
            (missions: IMission[]) => {
                this._missionsForHabitat = missions;
            }
        );
    }

    private getClients = (): Promise<IClient[]> => {
        return fetch(`http://test.ideesalter.com/alia_searchClient.php`)
        .then((response) => response.json())
        .then((clients) => clients);
    }

    // retourne les clients dont le nom contient la chaîne passée en paramètre
    public searchClients (nom: string): Promise<IClient[]> {
        if (!nom) {
            return Promise.resolve([]);
        }
        
        return fetch(`http://test.ideesalter.com/alia_searchClient.php?nom=${nom}`)
            .then((response) => response.json())
            .then((clients) => clients);
    }

    // retourne les habitats correspondant au client passé en paramètre
    public getHabitatsFromClient = (client: IClient): Promise<IHabitat[]> => {
        if (!client) {
            return Promise.resolve([]);
        }
        return fetch(`http://test.ideesalter.com/alia_searchHabitat.php?client_id=${client.id}`)
            .then((response) => response.json())
            .then((habitats) => habitats);
    }

    public getMissionsForHabitat = (habitat: IHabitat): Promise<IMission[]> => {
        if (!habitat) {
          return Promise.resolve([]);
        }
        return fetch(`http://test.ideesalter.com/alia_searchMission.php?habitat_id=${habitat.id}`)
          .then((response) => response.json())
          .then((missions) => missions);
    }

    public getAllChannelsOfTypeFromMission = (type: TMesure, missionId: number): Promise<IChannelOfTypeFromMission[]> => {
        if (!type || !missionId) {
          return Promise.resolve([]);
        }
        return fetch(`http://test.ideesalter.com/alia_searchAllChannelsOfTypeFromMission.php?type=${type}&mission_id=${missionId}`)
          .then((response) => response.json())
          .then((results) => results);
    }

    public getAllChannelsFromMission = (missionId: number): Promise<IChannelFromMission[]> => {
        if (!missionId) {
          return Promise.resolve([]);
        }
        return fetch(`http://test.ideesalter.com/alia_searchAllChannelsFromMission.php?mission_id=${missionId}`)
          .then((response) => response.json())
          .then((results) => results);
    }
    
    public getCapteur(capteurId: number, missionId: number): Promise<ICapteur> {
        return fetch(`http://test.ideesalter.com/alia_getCapteur.php?capteur_id=${capteurId}&mission_id=${missionId}`)
            .then((response) => response.json())
            .then((results) => results[0]);
    }

    public getChannel(channelId: number, capteurReferenceId: string): Promise<IChannel> {
        return fetch(`http://test.ideesalter.com/alia_getChannel.php?channel_id=${channelId}&capteur_reference_id=${capteurReferenceId}`)
            .then((response) => response.json())
            .then((results) => results);
    }

    public getMesureType(measureTypeId: number): Promise<ITypeMesure> {
        return fetch(`http://test.ideesalter.com/alia_getTypeMesure.php?id=${measureTypeId}`)
            .then((response) => response.json())
            .then((results) => results);
    }

    public getPlan(planId: number): Promise<IPlan> {
        return fetch(`http://test.ideesalter.com/alia_getPlan.php?id=${planId}`)
            .then((response) => response.json())
            .then((results) => results);
    }

    public getMesures = (capteurId: number, channelId: number, dateBegin: Date, dateEnd: Date): Promise<IMesure[]> => {
        // LOAD DATA from AEROC
        // date_begin=2017/12/09 20:13:04&date_end=2018/01/24 21:19:06
        // console.log('http://test.ideesalter.com/alia_readMesure.php?capteur_id=' + capteurId 
        // + '&channel_id=' + channelId + '&date_begin=' + dateBegin + '&date_end=' + dateEnd)
        // return fetch('http://test.ideesalter.com/alia_readMesure.php?capteur_id=' + capteurId
        // + '&channel_id=' + channelId + '&date_begin=2017/12/09 20:13:04&date_end=2017/12/11 21:19:06')
        var request = 'http://test.ideesalter.com/alia_readMesure.php?capteur_id=' + capteurId
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
            });
    }

    public getMeteo = (habitatId: number, channelId: number, dateBegin: Date, dateEnd: Date): Promise<IMesure[]> => {
        var request = 'http://test.ideesalter.com/alia_readMeteo.php?habitat_id=' + habitatId
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
            });
    }

    public getCountMesuresForChannelMission = (missionId: number, capteurId: number, channelId: number): Promise<number> => {
        if (!channelId || !missionId) {
            return Promise.resolve(undefined);
        }
        var request = 'http://test.ideesalter.com/alia_getCountMesuresForChannelMission.php?mission_id=' + missionId + '&capteur_id=' + capteurId + '&channel_id=' + channelId;
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
        return fetch(`http://testbase.ideesalter.com/alia_writeClient.php` +
            `?id=` + client.id +
            `&nom=` + client.nom + 
            `&adresse=` + client.adresse + 
            `&telephone=` + client.telephone + 
            `&email=` + client.email +
            `&password=` + encodeURIComponent(password)
        ).then((response) => {
                if (response.status === 200) {
                    this.reloadClients();
                } else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
                }
            }
        );
    }

    public writeHabitat = (habitat: IHabitat, password: string) => {
        return fetch(`http://testbase.ideesalter.com/alia_writeHabitat.php` +
            `?id=` + habitat.id +
            `&client_id=` + this.client.id + 
            `&adresse=` + habitat.adresse + 
            `&latitude=` + habitat.gps_latitude + 
            `&longitude=` + habitat.gps_longitude + 
            `&elevation=` + habitat.gps_elevation + 
            `&password=` + encodeURIComponent(password)
        ).then((response) => {
                if (response.status === 200) {
                    this.reloadHabitatsFromClient(this.client);
                } else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
            }
        });
    }

    public writePlan = (plan: IPlan, password: string) => {
        return fetch(`http://testbase.ideesalter.com/alia_writePlan.php`, {
                method: 'post',
                headers: {
                //     'Access-Control-Allow-Origin:': '*',
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
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
                } else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
            }
        });
    }

    public writeMission = (mission: IMission, password: string) => {
        return fetch(`http://testbase.ideesalter.com/alia_writeMission.php` +
            `?id=` + mission.id +
            `&habitat_id=` + this.habitat.id + 
            `&date_debut=` + encodeURIComponent(mission.date_debut) + 
            `&date_fin=` + encodeURIComponent(mission.date_fin) + 
            `&password=` + encodeURIComponent(password)
        ).then((response) => {
                if (response.status === 200) {
                    this.reloadMissionsFromHabitat(this.habitat);
                } else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
            }
        });
    }  

    public deleteClient = (client: IClient, password: string) => {
        return fetch(`http://testbase.ideesalter.com/alia_deleteClient.php?id=` + client.id + `&password=` + encodeURIComponent(password))
            .then((response) => {
                if (response.status === 200) {
                    this.reloadClients();
                } else {
                    console.log(response);
                    // TODO : impossible de supprimer...
                }
            }
        )
    }

    public deleteHabitat = (habitat: IHabitat, password: string) => {
        return fetch(`http://testbase.ideesalter.com/alia_deleteHabitat.php?id=` + habitat.id + `&password=` + encodeURIComponent(password))
            .then((response) => {
                if (response.status === 200) {
                    this.reloadHabitatsFromClient(this.client)
                } else {
                    console.log(response);
                    // TODO : impossible de supprimer...
                }
            }
        );
    }

    public deleteMission = (mission: IMission, password: string) => {
        fetch(`http://testbase.ideesalter.com/alia_deleteMission.php?id=` + mission.id + `&password=` + encodeURIComponent(password))
            .then((response) => {
                if (response.status === 200) {
                    this.reloadMissionsFromHabitat(this.habitat);
                } else {
                    console.log(response);
                    // TODO : impossible de supprimer...
            }
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