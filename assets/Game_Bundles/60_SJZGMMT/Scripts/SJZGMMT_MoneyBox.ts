import { _decorator, Component, Label, Node, v3 } from 'cc';
import Banner from '../../../Scripts/Banner';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_MoneyBox')
export class SJZGMMT_MoneyBox extends Component {
    private _label: Label = null;
    protected onLoad(): void {
        this._label = this.node.getChildByName("数量").getComponent(Label);
    }
    start() {
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.货币变动, this.Show, this);
    }


    protected onEnable(): void {
        this.Show();
    }
    //刷新钱币
    Show() {
        this._label.string = SJZGMMT_Incident.GetMaxNum(SJZGMMT_GameData.Instance.Money);
    }

    //点击激励
    OnClick() {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        Banner.Instance.ShowVideoAd(() => {
            SJZGMMT_GameData.Instance.ChanggeMoney(2000000);
            SJZGMMT_UIManager.Instance.ShowMoneyEffects(v3(1170, 540, 0), this.node.worldPosition.clone());
        })
    }
}


