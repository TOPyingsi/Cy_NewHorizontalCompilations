import { _decorator, Component, Node, AudioClip, director } from 'cc';
import { PKP_AudioManager } from './PKP_AudioManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import Banner from 'db://assets/Scripts/Banner';
import { UIManager, Panel } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { DataManager } from 'db://assets/Scripts/Framework/Managers/DataManager';
const { ccclass, property } = _decorator;

@ccclass('PKP_MenuManager')
export class PKP_MenuManager extends Component {
    @property(AudioClip)
    gameMusic: AudioClip = null;

    @property({ type: Node })
    chooseOpponent: Node[] = [];

    start() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "拍卡");
        // PKP_AudioManager.instance.play(this.gameMusic, 1);
    }

    // 点击返回主页
    public onToStartMenu() {
        // ProjectEventManager.emit(ProjectEvent.页面转换, "拍卡");
        // if (Banner.IsShowServerBundle) UIManager.ShowPanel(Panel.MoreGamePanel);
        // else director.loadScene(GameManager.StartScene);
        // ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
        //     UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
        //         ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, "沙威玛传奇");
        //     })
        // });
        let data = DataManager.GameData;
        let x = data.find((value, index, obj) => {
            if (value.Bundles[0] == "28_SLYZ_Bundle") return value;
        })
        UIManager.ShowPanel(Panel.LoadingPanel, [x, "SLYZ_GameScene"]);
    }

    // 根据按钮点击
    public onLoadScene01() {
        director.loadScene('PKP_GameScene01');
    }
    public onLoadScene02() {
        director.loadScene('PKP_GameScene02');
    }
    public onLoadScene03() {
        director.loadScene('PKP_GameScene03');
    }
    public onLoadScene04() {
        director.loadScene('PKP_GameScene04');
    }
    public onLoadScene05() {
        director.loadScene('PKP_GameScene05');
    }
    public onLoadScene06() {
        director.loadScene('PKP_GameScene06');
    }

    // 上一个对手
    public onPreOne() {
        for (let i = 0; i < this.chooseOpponent.length; i++) {
            if (this.chooseOpponent[i].active) {
                this.chooseOpponent[i].active = false;
                if (i == 0) {
                    this.chooseOpponent[this.chooseOpponent.length - 1].active = true;
                } else {
                    this.chooseOpponent[i - 1].active = true;
                }
                break;
            }
        }
    }

    // 下一个对手
    public onNextOne() {
        for (let i = 0; i < this.chooseOpponent.length; i++) {
            if (this.chooseOpponent[i].active) {
                this.chooseOpponent[i].active = false;
                if (i == this.chooseOpponent.length - 1) {
                    this.chooseOpponent[0].active = true;
                } else {
                    this.chooseOpponent[i + 1].active = true;
                }
                break;
            }
        }
    }
}