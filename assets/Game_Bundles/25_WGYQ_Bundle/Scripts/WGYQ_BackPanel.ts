import { _decorator, Component, Node, Label, Sprite, clamp, randomRangeInt, Event } from 'cc';
import { WGYQ_DogName, WGYQ_DogType, WGYQ_GameData } from './WGYQ_GameData';
import { WGYQ_HomeUI } from './WGYQ_HomeUI';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_BackPanel')
export class WGYQ_BackPanel extends Component {

    @property(Label)
    coinLabel: Label;

    @property(Node)
    dogPanel: Node;

    coins: number;

    protected onEnable(): void {
        this.coins = WGYQ_GameData.Instance.getNumberData("Coins");
        this.Init();
        this.InitDogs();
    }

    start() {
    }

    Init() {
        this.coinLabel.string = this.coins.toString();
    }

    InitDogs() {
        if (WGYQ_GameData.Instance.getArrayData("BGDogs").length == 0) this.RefreshDogs();
        else {
            let datas = WGYQ_GameData.Instance.getArrayData("BGDogs");
            for (let i = 0; i < this.dogPanel.children.length; i++) {
                const element = this.dogPanel.children[i];
                let data = datas[i];
                element.children[0].getComponent(Label).string = data[0].dogName + "（" + data[0].dogType + "）";
                element.children[2].active = data[1] == 0;
            }
        }
    }

    RefreshDogs() {
        let dogNum = WGYQ_GameData.Instance.getNumberData("DogNumber");
        let datas = [];
        for (let i = 0; i < this.dogPanel.children.length; i++) {
            const element = this.dogPanel.children[i];
            let num = randomRangeInt(0, 9);
            let data = { dogNumber: dogNum, dogName: WGYQ_DogName[num], dogType: WGYQ_DogType[num], dogProperty: "护食 咬人" };
            dogNum++;
            datas.push([data, 0]);
            element.children[0].getComponent(Label).string = data.dogName + "（" + data.dogType + "）";
            element.children[2].active = true;
        }
        WGYQ_GameData.Instance.setNumberData("DogNumber", dogNum);
        WGYQ_GameData.Instance.setArrayData("BGDogs", datas);
    }

    update(deltaTime: number) {

    }

    GetDog(event: Event) {
        let target: Node = event.target;
        let num = target.parent.getSiblingIndex();
        let data = WGYQ_GameData.Instance.getArrayData("BGDogs");
        data[num][1] = 1;
        WGYQ_GameData.Instance.setArrayData("BGDogs", data);
        WGYQ_GameData.Instance.setNumberData("IsCatch", 0);
        WGYQ_GameData.Instance.setObjectData("CurrentDog", data[num][0]);
        UIManager.ShowPanel(Panel.LoadingPanel, "WGYQ_Yard");
    }

    Back() {
        this.node.active = false;
        WGYQ_HomeUI.Instance.Init();
    }



}


