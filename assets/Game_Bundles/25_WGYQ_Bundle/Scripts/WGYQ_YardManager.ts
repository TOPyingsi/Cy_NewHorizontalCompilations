import { _decorator, Component, Label, Node, Prefab, randomRange, v3, Vec3 } from 'cc';
import { WGYQ_GameData } from './WGYQ_GameData';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { WGYQ_Dog } from './WGYQ_Dog';
import { WGYQ_LockDog } from './WGYQ_LockDog';
import { WGYQ_Player } from './WGYQ_Player';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { WGYQ_BowDog } from './WGYQ_BowDog';
import { WGYQ_YardUI } from './WGYQ_YardUI';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_YardManager')
export class WGYQ_YardManager extends Component {

    private static instance: WGYQ_YardManager;
    public static get Instance(): WGYQ_YardManager {
        return this.instance;
    }

    @property(Label)
    doghouseLabel: Label;

    @property(Label)
    dogLabel: Label;

    @property(Node)
    dogHousePanel: Node;

    @property(Node)
    dogPanel: Node;

    @property(Node)
    fence: Node;

    @property([Prefab])
    dogPrefabs: Prefab[] = [];

    @property(Prefab)
    bowDogPrefab: Prefab = null;

    @property(Prefab)
    lockDogPrefab: Prefab = null;

    @property(Prefab)
    dogHousePrefab: Prefab = null;

    doghouses: Vec3[];

    dogs: { dogNumber: number, dogName: string, dogType: string, hp: number, coinTime: number }[];

    protected onLoad(): void {
        WGYQ_YardManager.instance = this;
    }

    start() {
        this.Init();
    }

    update(deltaTime: number) {

    }

    Init() {
        this.InitString();
        this.InitDogHouse();
        this.InitDogs();
        if (JSON.stringify(WGYQ_GameData.Instance.getObjectData("CurrentDog")) != "{}") this.InitDogGame();
        this.fence.active = WGYQ_GameData.Instance.getNumberData("Fence") == 1;
    }

    InitString() {
        this.doghouses = WGYQ_GameData.Instance.getArrayData("DogHouse");
        this.dogs = WGYQ_GameData.Instance.getArrayData("Dog");
        this.doghouseLabel.string = "狗窝数量：" + this.doghouses.length;
        this.dogLabel.string = "狗数量：" + this.dogs.length;
    }

    InitDogHouse() {
        for (let i = 0; i < this.doghouses.length; i++) {
            const element = this.doghouses[i];
            let house: Node = PoolManager.GetNodeByPrefab(this.dogHousePrefab, this.dogHousePanel);
            house.setPosition(element);
        }
    }

    InitDogs() {
        for (let i = 0; i < this.dogs.length; i++) {
            const element = this.dogs[i];
            let prefab = this.dogPrefabs.find((value, index, obj) => { if (value.name == element.dogType) return value; });
            let dog: Node = PoolManager.GetNodeByPrefab(prefab, this.dogPanel);
            let pos = v3(randomRange(-1700, 1700), randomRange(-1700, 1700));
            dog.setPosition(pos);
            let src = dog.getComponent(WGYQ_Dog);
            src.Init(element);
        }
    }

    InitDogGame(bool = false) {
        let dog: Node = PoolManager.GetNodeByPrefab(WGYQ_GameData.Instance.getNumberData("IsCatch") == 1 ? this.bowDogPrefab : this.lockDogPrefab, this.dogPanel);
        if (WGYQ_GameData.Instance.getNumberData("IsCatch") == 0) {
            let src = dog.getComponent(WGYQ_LockDog);
            src.Init(WGYQ_GameData.Instance.getObjectData("CurrentDog"), bool);
        }
        else {
            let src = dog.getComponent(WGYQ_BowDog);
            src.Init(WGYQ_GameData.Instance.getObjectData("CurrentDog"));
        }
        let pos = v3(500, 0);
        dog.setPosition(pos);
    }

    AddDog(dogData: { dogNumber: number, dogName: string, dogType: string, hp: number, coinTime: number }): boolean {
        if (this.doghouses.length <= this.dogs.length) return false;
        let prefab = this.dogPrefabs.find((value, index, obj) => { if (value.name == dogData.dogType) return value; });
        let dog: Node = PoolManager.GetNodeByPrefab(prefab, this.dogPanel);
        let pos = v3(500, 0);
        dog.setPosition(pos);
        let src = dog.getComponent(WGYQ_Dog);
        src.Init(dogData);
        return true;
    }

    BuildHouse() {
        let coins = WGYQ_YardUI.Instance.Coins;
        if (coins < 200) return UIManager.ShowTip("金币不足");
        WGYQ_YardUI.Instance.Coins -= 200;
        let house: Node = PoolManager.GetNodeByPrefab(this.dogHousePrefab, this.dogHousePanel);
        house.setPosition(WGYQ_Player.Instance.node.getPosition());
        let data = WGYQ_GameData.Instance.getArrayData("DogHouse");
        data.push(this.node.getPosition());
        WGYQ_GameData.Instance.setArrayData("DogHouse", data);
        this.InitString();
    }

    BuildFence() {
        if (this.fence.active) return UIManager.ShowTip("围栏已建造");
        let coins = WGYQ_YardUI.Instance.Coins;
        if (coins < 2000) return UIManager.ShowTip("金币不足");
        WGYQ_YardUI.Instance.Coins -= 2000;
        WGYQ_GameData.Instance.setNumberData("Fence", 1);
        this.fence.active = true;
    }
}
