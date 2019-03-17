import { observable } from 'mobx';
import { IClient } from 'src/interfaces/IClient';
import { IHabitat } from 'src/interfaces/IHabitat';
import { IMission } from 'src/interfaces/IMission';
import { autorun } from 'mobx';
import { IPlan } from 'src/interfaces/IPlan';
import { NavBarTabEnum } from 'src/App';

export class GlobalStore {

    @observable public selectedTab: NavBarTabEnum = NavBarTabEnum.CLIENT;

    @observable public client: IClient = undefined;
    @observable public habitat: IHabitat = undefined;
    @observable public mission: IMission = undefined;
    @observable private _clients: IClient[] = [];
    @observable private _habitatsForClient: IHabitat[] = [];
    @observable private _missionsForHabitat: IMission[] = [];

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

    public navigateToTab = (selectedTab: NavBarTabEnum) => {
        this.selectedTab = selectedTab;
    }
}