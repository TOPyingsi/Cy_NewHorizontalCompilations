import { _decorator, Button, color, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, tween, UITransform, v3 } from 'cc';
import { QSSZG_Incident } from '../QSSZG_Incident';
import { QSSZG_Constant } from '../Data/QSSZG_Constant';
import { GSSZG_handbookBox } from './GSSZG_handbookBox';
import { QSSZG_GameData } from '../QSSZG_GameData';
import { QSSZG_AudioManager } from '../QSSZG_AudioManager';
import { QSSZG_Panel, QSSZG_ShowPanel } from './QSSZG_ShowPanel';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_handbook')
export class QSSZG_handbook extends Component {
    public Index: number = 0;//页数
    start() {
        this.ChanggeIndex(0);
        //生成图片集
        QSSZG_Incident.Loadprefab(QSSZG_Constant.PrefabPath.图鉴框).then((prefab: Prefab) => {
            for (let i = 0; i < QSSZG_Constant.Handbook.length; i++) {
                this.node.getChildByPath(`Node/页数/${i}/view/content`).getComponent(UITransform).height = 286 * (Math.ceil(QSSZG_Constant.Handbook[i].length / 7)) + 20;
                for (let j = 0; j < QSSZG_Constant.Handbook[i].length; j++) {
                    let pre = instantiate(prefab);
                    if (i == 1) {//1页特殊背景
                        pre.getChildByName("特殊背景").active = true;
                    }
                    pre.setParent(this.node.getChildByPath(`Node/页数/${i}/view/content`));
                    pre.getComponent(GSSZG_handbookBox).id = QSSZG_Constant.Handbook[i][j];
                    pre.getComponent(GSSZG_handbookBox).Init();
                }
            }
            this.Init();
        })

    }
    Show() {
        this.Windows_InorOut(true);
        //初始化界面
        this.Init();
    }
    OnButtonClick(btn: EventTouch) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        switch (btn.target.name) {
            case "关闭":
                this.Windows_InorOut(false);
                break;
            case "0":
                this.ChanggeIndex(0);
                break;
            case "1":
                this.ChanggeIndex(1);
                break;
        }
    }
    //窗口滑出
    Windows_InorOut(isIn: boolean) {
        if (isIn) {
            this.node.setPosition(0, -1200, 0);
            tween(this.node)
                .to(0.4, { position: v3(0, 0, 0) }, { easing: "backOut" })
                .start();
        } else {
            tween(this.node)
                .to(0.4, { position: v3(0, -1200, 0) }, { easing: "backIn" })
                .call(() => {
                    QSSZG_ShowPanel.Instance.HidePanel(QSSZG_Panel.图鉴界面);
                })
                .start();
        }
    }

    //翻页
    ChanggeIndex(index: number) {
        this.Index = index;
        let pre = this.node.getChildByPath("Node/页数");
        pre.children.forEach((cd, _index) => {
            cd.active = false;
            if (index == _index) {
                cd.active = true;
            }
        })
        let pre2 = this.node.getChildByPath("Node/上栏");
        pre2.children.forEach((cd, _index) => {
            cd.getComponent(Sprite).grayscale = true;
            cd.getComponent(Button).enabled = true;
            if (index == _index) {
                cd.getComponent(Sprite).grayscale = false;
                cd.getComponent(Button).enabled = false;
            }
        })

    }
    Init() {//更新数据
        let pre = this.node.getChildByPath(`Node/页数`);
        for (let i = 0; i < pre.children.length; i++) {
            let content = pre.children[i].getChildByPath("view/content");
            content.children.forEach((cd, index) => {
                let id = cd.getComponent(GSSZG_handbookBox).id;
                if (QSSZG_GameData.Instance.UnLookFishId.indexOf(id) != -1) {
                    cd.getChildByName("sprite").getComponent(Sprite).grayscale = false;
                    cd.getChildByName("Name").getComponent(Label).string = QSSZG_Constant.GetDataFromID(id).Name;
                } else {
                    cd.getChildByName("sprite").getComponent(Sprite).grayscale = true;
                    cd.getChildByName("Name").getComponent(Label).string = "???";
                }
            })
        }

    }
}


