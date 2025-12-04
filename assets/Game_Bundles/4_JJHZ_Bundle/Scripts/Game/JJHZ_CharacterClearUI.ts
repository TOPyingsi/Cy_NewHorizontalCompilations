import { _decorator, Component, Event, Label, Node, Prefab, v3 } from 'cc';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { JJHZ_CardHolder } from './JJHZ_CardHolder';
import { JJHZ_CardData } from './JJHZ_CardData';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_CharacterClearUI')
export class JJHZ_CharacterClearUI extends Component {

    private static instance: JJHZ_CharacterClearUI;

    public static get Instance(): JJHZ_CharacterClearUI {
        return this.instance;
    }


    @property(Node)
    buttons: Node;

    @property(Node)
    endPanel: Node;

    @property([Node])
    cardHolders: Node[] = [];

    holderNum = 0;

    protected onLoad(): void {
        JJHZ_CharacterClearUI.instance = this;
    }

    protected onEnable(): void {
        this.buttons.active = true;
        this.endPanel.active = false;
        for (let i = 0; i < this.cardHolders.length; i++) {
            const element = this.cardHolders[i];
            element.setPosition(v3(i == 0 ? -400 : 400, 0));
            element.active = true;
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Choose(event: Event) {
        var node: Node = event.target;
        var num = node.getSiblingIndex();
        this.holderNum = num;
        var x = this;
        function a() {
            for (let i = 0; i < x.cardHolders.length; i++) {
                const element = x.cardHolders[i];
                if (i == num) element.getComponent(JJHZ_CardHolder).Choose();
                else element.getComponent(JJHZ_CardHolder).Lost();
            }
            x.buttons.active = false;
        }
        if (num == 0) a();
        else Banner.Instance.ShowVideoAd(a);
    }

    Show(num: number) {
        this.endPanel.active = true;
        var data = JJHZ_CardData.Cards;
        data[num] = 1;
        JJHZ_CardData.Cards = data;
    }

    End() {
        this.cardHolders[this.holderNum].getComponent(JJHZ_CardHolder).End();
    }
}


