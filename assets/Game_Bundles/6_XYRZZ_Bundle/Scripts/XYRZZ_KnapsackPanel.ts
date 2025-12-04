import { _decorator, Component, EventTouch, instantiate, Node, Prefab } from 'cc';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_PropBox } from './XYRZZ_PropBox';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_PoolManager } from './Utils/XYRZZ_PoolManager';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_KnapsackPanel')
export class XYRZZ_KnapsackPanel extends Component {
    @property(Prefab)
    PropPre: Prefab = null;//道具预制体
    @property(Node)
    Content: Node = null;
    public PropData: number[] = [];//背包中的各个prop的id

    Show() {


    }

    start() {
        XYRZZ_EventManager.on(XYRZZ_MyEvent.道具数量修改, (id: number, num: number) => {
            if (num >= 0) {
                this.Add_Prop(id, num);
            } else {
                this.Sub_Prop(id, num);
            }
        })
        this.Init();
    }

    //按钮事件
    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_KnapsackPanel);
                break;
        }

    }
    //初始化道具
    Init() {
        XYRZZ_GameData.Instance.PropData.forEach((data, index) => {
            if (data.Level > 0) {
                this.Add_Prop(index, data.Level);
            }
        })

    }


    //背包中加入道具(参数：道具ID)
    Add_Prop(id: number, num: number) {
        let index = this.PropData.indexOf(id);
        if (index == -1) {
            let prop = XYRZZ_PoolManager.Instance.GetNode(this.PropPre, this.Content);
            this.PropData.push(id);
            prop.getComponent(XYRZZ_PropBox).Init(id);
            prop.getComponent(XYRZZ_PropBox).AddNumBer(num);
        } else {
            this.Content.children[index].getComponent(XYRZZ_PropBox).AddNumBer(num);
        }
    }

    //背包中删除道具
    Sub_Prop(id: number, num: number) {
        let index = this.PropData.indexOf(id);
        if (index == -1) {
            XYRZZ_UIManager.HopHint("背包中没有此道具！");
        } else {
            let residuenum = this.Content.children[index].getComponent(XYRZZ_PropBox).AddNumBer(num);
            if (residuenum <= 0) {
                XYRZZ_PoolManager.Instance.PutNode(this.Content.children[index]);
                this.PropData.splice(index, 1);
            }
        }
    }
}


