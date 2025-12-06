import { _decorator, Component, director, Node, Sprite } from 'cc';
import { XSHY_Unit } from './XSHY_Unit';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_GameManager } from './XSHY_GameManager';
import { XSHY_incident } from './XSHY_incident';
const { ccclass, property } = _decorator;

@ccclass('XSHY_FindProperty')
export class XSHY_FindProperty extends Component {
    @property()
    IsEnemy: boolean = false;
    public FindNode: XSHY_Unit = null;

    private Hplider: Sprite = null;//生命条
    private Mplider: Sprite = null;//蓝条
    private SkillCountContent: Node = null;//豆子父节点

    protected start(): void {
        this.Hplider = this.node.getChildByPath("生命条/生命值").getComponent(Sprite);
        this.Mplider = this.node.getChildByPath("能量条/能量条").getComponent(Sprite);
        this.SkillCountContent = this.node.getChildByPath("能量点");
        director.getScene().on(XSHY_EasyControllerEvent.PlayerOnLoad, this.PlayerOnload, this);
        director.getScene().on(XSHY_EasyControllerEvent.EnemyOnLoad, this.EnemyOnload, this);
        director.getScene().on(XSHY_EasyControllerEvent.BeatBack, this.ChanggeHp, this);
        director.getScene().on(XSHY_EasyControllerEvent.消耗技能豆, this.ChanggeSkillCount, this);
        this.Showalternative();
    }

    protected update(dt: number): void {
        this.ChanggeMp();
    }
    //生命值变动
    ChanggeHp() {
        if (!this.FindNode || !this.FindNode.isValid) return;
        this.Hplider.fillRange = this.FindNode.Hp / this.FindNode.MaxHp;
    }
    //法力值变动
    ChanggeMp() {
        if (!this.FindNode || !this.FindNode.isValid) return;
        this.Mplider.fillRange = this.FindNode.Mp / this.FindNode.MaxMp;
    }
    //技能豆变动
    ChanggeSkillCount() {
        if (!this.FindNode || !this.FindNode.isValid) return;
        this.SkillCountContent.children.forEach((element: Node, index: number) => {
            if (this.FindNode.SkillCount <= index) {
                element.getChildByName("能量").getComponent(Sprite).grayscale = true;
            }
        });
    }

    //更新备选信息
    Showalternative() {
        let team: string[] = [];
        if (this.IsEnemy) {
            for (let i = 3; i < 6; i++) {
                if (!XSHY_GameManager.TeamisDie[i]) {
                    team.push(XSHY_GameManager.TeamData[i]);
                }
            }
        } else {
            for (let i = 0; i < 3; i++) {
                if (!XSHY_GameManager.TeamisDie[i]) {
                    team.push(XSHY_GameManager.TeamData[i]);
                }
            }
        }
        if (team.length > 0) {
            XSHY_incident.LoadSpriteFrameToSprite("Sprite/头像/" + team[0], this.node.getChildByName("头像框").getComponent(Sprite));
        }
        if (team.length > 1 && XSHY_GameManager.GameMode == "3V3") {
            this.node.getChildByName("备选框0").active = true;
            XSHY_incident.LoadSpriteFrameToSprite("Sprite/头像/" + team[1], this.node.getChildByName("备选框0").getComponent(Sprite));
        }
        if (team.length > 2 && XSHY_GameManager.GameMode == "3V3") {
            this.node.getChildByName("备选框1").active = true;
            XSHY_incident.LoadSpriteFrameToSprite("Sprite/头像/" + team[2], this.node.getChildByName("备选框1").getComponent(Sprite));
        }
    }

    ShowAll() {
        this.ChanggeHp();
        this.ChanggeMp();
        this.ChanggeSkillCount();
    }

    PlayerOnload(node: Node) {
        if (!this.IsEnemy) {
            this.FindNode = node.getComponent(XSHY_Unit);
        }
    }
    EnemyOnload(node: Node) {
        if (this.IsEnemy) {
            this.FindNode = node.getComponent(XSHY_Unit);
        }
    }
}


