import { _decorator, Component, Label, Node, v3 } from 'cc';
import Banner from '../../../Scripts/Banner';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_AudioManager } from './SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_MoneyBox')
export class SJZXD_MoneyBox extends Component {
    private _label: Label = null;
    protected onLoad(): void {
        this._label = this.node.getChildByName("数量").getComponent(Label);
    }
    start() {
        SJZXD_UIManager.Instance.SJZXD_On(SJZXD_EventManager.货币变动, this.Show, this);
    }


    protected onEnable(): void {
        this.Show();
    }
    //刷新钱币
    Show() {
        this._label.string = SJZXD_Incident.GetMaxNum(SJZXD_GameData.Instance.Money);
    }

    //点击激励
    OnClick() {
        SJZXD_AudioManager.globalAudioPlay("点击");
        Banner.Instance.ShowVideoAd(() => {
            SJZXD_GameData.Instance.ChanggeMoney(2000000);
            SJZXD_UIManager.Instance.ShowMoneyEffects(v3(1170, 540, 0), this.node.worldPosition.clone());
        })
    }
}


