import { _decorator, Component, Node } from 'cc';
import { KKDKF_AudioManager } from '../KKDKF_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_Course')
export class KKDKF_Course extends Component {
    public Index: number = 0;

    Show() {
        this.Index = 0;
        this.SetIndex();
        this.node.active = true;
    }

    //确认
    OnYesButtom() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        if (this.Index < 2) {
            this.Index++;
            this.SetIndex();
        } else {
            this.node.active = false;
        }
    }

    //设置页数
    SetIndex() {
        this.node.getChildByName("步骤").children.forEach((cd, index) => {
            if (index == this.Index) {
                cd.active = true;
            } else {
                cd.active = false;
            }
        });

    }
}


