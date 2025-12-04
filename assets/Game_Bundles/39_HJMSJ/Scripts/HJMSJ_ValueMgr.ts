import { _decorator, Component, director, Label, Node, ProgressBar, Sprite } from 'cc';
import { HJMSJ_GameData } from './HJMSJ_GameData';
import { HJMSJ_GameMgr } from './HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_ValueMgr')
export class HJMSJ_ValueMgr extends Component {

    @property(Sprite)
    HpMgr: Sprite = null;
    @property(Sprite)
    HungerMgr: Sprite = null;
    @property(Sprite)
    ArmorMgr: Sprite = null;
    @property(Node)
    ExpMgr: Node = null;

    public ExpBar: Sprite = null;
    public levelLabel: Label = null;

    public hp: number = 10;
    public hunger: number = 10;
    public armor: number = 0;

    public curExp = 0;
    public maxExp: number = 10;

    start() {
        this.hp = HJMSJ_GameData.Instance.hp;
        this.hunger = HJMSJ_GameData.Instance.hunger;
        this.armor = HJMSJ_GameData.Instance.armor;
        this.curExp = HJMSJ_GameData.Instance.curExp;
        this.maxExp = HJMSJ_GameData.Instance.maxExp;

        this.ExpBar = this.ExpMgr.getChildByName("经验条").getComponent(Sprite);
        this.levelLabel = this.ExpMgr.getChildByName("等级").getComponent(Label);
        this.levelLabel.string = HJMSJ_GameData.Instance.level.toString();

        this.onHPChange(10);
        this.onHungerChange(0);
        this.onArmorChange();
        this.onExpChange(0);

        director.getScene().on("哈基米世界_改变生命值", (num: number) => {
            this.onHPChange(num);
        }, this);
        director.getScene().on("哈基米世界_改变饥饿值", (num: number) => {
            this.onHungerChange(num);
        }, this);
        director.getScene().on("哈基米世界_改变经验值", (num: number) => {
            this.onExpChange(num);
        });
        director.getScene().on("哈基米世界_改变护甲值", this.onArmorChange, this);

    }

    private isOnAttack: boolean = false;
    private timer: number = 0;
    private interval: number = 3;
    protected update(dt: number): void {
        if (this.isOnAttack) {
            this.timer += dt;
            if (this.timer >= this.interval) {
                this.timer = 0;
                this.isOnAttack = false;
                this.schedule(this.HungerCtrl, 5);
            }
        } else {
            this.unscheduleAllCallbacks();
        }
    }

    HungerCtrl() {
        if (this.hunger >= 9 && this.hp < 10) {
            this.onHPChange(0.5);
        }
    }

    private couldAttack: boolean = true;
    onHPChange(num: number) {
        if (num <= 0 && !this.couldAttack) {
            return;
        }
        this.hp += num;
        if (this.hp <= 0) {
            this.unschedule(this.HungerCtrl);
            //死亡
            this.HpMgr.fillRange = 0;
            let hasProp = HJMSJ_GameData.Instance.GetPropNum("不死图腾");
            if (hasProp > 0) {
                this.revive();
                return;
            }
            HJMSJ_GameMgr.instance.Lost();
            director.getScene().emit("哈基米世界_死亡");
            return;
        }
        else if (this.hp >= 10) {
            this.hp = 10;
        }

        if (num < 0) {
            this.isOnAttack = true;
        }

        this.HpMgr.fillRange = this.hp / 10;

        HJMSJ_GameData.Instance.hp = this.hp;
    }

    onArmorChange() {
        this.armor = HJMSJ_GameData.Instance.armor;

        this.ArmorMgr.fillRange = this.armor / 10;
    }

    onHungerChange(num: number) {
        this.hunger += num;

        this.HungerMgr.fillRange = this.hunger / 10;

        HJMSJ_GameData.Instance.hunger = this.hunger;
    }

    onExpChange(num: number) {
        this.curExp += num;
        if (this.curExp >= this.maxExp) {
            this.curExp -= this.maxExp;
            HJMSJ_GameData.Instance.level++;
            this.levelLabel.string = HJMSJ_GameData.Instance.level.toString();
        }

        let percent = this.curExp / this.maxExp;
        this.ExpBar.fillRange = percent;

        HJMSJ_GameData.Instance.curExp = this.curExp;
    }

    revive() {
        if (HJMSJ_GameData.Instance.SubKnapsackData("不死图腾", 1)) {
            HJMSJ_GameMgr.instance.revive();
            this.hp = 10;
            this.onHPChange(0);
            this.couldAttack = false;

            this.scheduleOnce(() => {
                this.couldAttack = true;
            }, 1.5);
        }
    }
}


