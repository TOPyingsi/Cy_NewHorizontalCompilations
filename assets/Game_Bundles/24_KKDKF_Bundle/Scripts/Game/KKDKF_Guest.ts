import { _decorator, Component, instantiate, Node, Prefab, resources, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { KKDKF_GameData } from '../KKDKF_GameData';
import { KKDKF_Incident } from '../KKDKF_Incident';
import { KKDKF_GameManager } from './KKDKF_GameManager';
import { KKDKF_Constant } from '../Data/KKDKF_Constant';
import { KKDKF_MoneyEffects } from './KKDKF_MoneyEffects';
import { KKDKF_AudioManager } from '../KKDKF_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('KKDKF_Guest')
export class KKDKF_Guest extends Component {
    public Id: number = 0;//客人ID(影响外观)
    public demand: number = 0;//需要的东西

    public demandArray: number[] = [0, 1, 2, 3, 4, 5, 6];
    //初始化
    public Show(ID: number) {
        this.demand = this.demandArray[Math.floor(Math.random() * this.demandArray.length)];
        if (KKDKF_GameData.Instance.GameData[3] == 0) {//教程默认需求1(冰美式)
            this.demand = 1;
        }
        this.Id = ID;
        KKDKF_Incident.LoadSprite("Sprite/客人/" + ID).then((sp: SpriteFrame) => {
            this.node.getComponent(Sprite).spriteFrame = sp;
        });
        this.node.scale = v3(1, 0, 1);
        tween(this.node).to(0.4, { scale: v3(1, 1, 1) }, { easing: "backOut" }).start();
        KKDKF_GameManager.Instance.OpenText(this.demand);
    }

    //离开
    Exit() {
        tween(this.node).to(0.4, { scale: v3(1, 0, 1) }, { easing: "backIn" }).start();
    }

    //收到咖啡
    public GetCoffee(data: number[]) {
        if (KKDKF_Incident.arraysAreEqual(data, KKDKF_Constant.Coffeedata[this.demand])) {
            KKDKF_GameManager.Instance.AddExp(KKDKF_Constant.Drink[this.demand].Price);
            let Level = KKDKF_GameData.Instance.CoffeeLevel[this.demand];
            let Price = Math.ceil(KKDKF_Constant.Drink[this.demand].Price * (1 + Level * 0.1));
            KKDKF_GameManager.Instance.ChanggeMoney(Price);
            resources.load("Prefabs/钞票", Prefab, (err, prefab) => {
                if (err) { return; }
                let pre = instantiate(prefab);
                pre.getComponent(KKDKF_MoneyEffects).Begin(this.node.worldPosition, KKDKF_GameManager.Instance.UI.getChildByName("钱").worldPosition);
                KKDKF_AudioManager.globalAudioPlay("获得钞票");
            })
            KKDKF_GameManager.Instance.ExitGuest();
        } else {
            KKDKF_GameManager.Instance.OpenaBusiveText(this.demand);
        }
    }

}


