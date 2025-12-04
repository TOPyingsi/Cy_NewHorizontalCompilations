import { _decorator, Animation, clamp, Color, Component, randomRangeInt, RigidBody2D, Sprite, Tween, tween, v3 } from 'cc';
import { WGYQ_GameData } from './WGYQ_GameData';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { WGYQ_YardUI } from './WGYQ_YardUI';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_Dog')
export class WGYQ_Dog extends Component {

    @property()
    speed: number = 0;

    @property(Sprite)
    hpSprite: Sprite;

    rig: RigidBody2D;
    ani: Animation;
    state = "Idle";

    dogNumber: number;
    dogName: string;
    dogType: string;
    coinTime: number;
    hp: number;
    public get Hp(): number {
        return this.hp;
    }
    public set Hp(value: number) {
        this.hp = clamp(value, 0, 1000);
        this.hpSprite.fillRange = this.hp / 1000;
        let data = WGYQ_GameData.Instance.getArrayData<{ dogNumber: number, dogName: string, dogType: string, hp: number, coinTime: number }>("Dog");
        let num = data.findIndex((value, index, obj) => { if (value.dogNumber == this.dogNumber) return index });
        if (this.hp == 0) {
            data.splice(num, 1);
            this.ani.play("bow");
            this.node.getComponent(Sprite).color = Color.GRAY;
            Tween.stopAll();
            this.unscheduleAllCallbacks();
            tween(this.node.getComponent(Sprite))
                .to(1, { color: Color.TRANSPARENT })
                .call(() => {
                    this.scheduleOnce(() => {
                        PoolManager.PutNode(this.node);
                    });
                }).start();
        }
        else {
            data[num] = { dogNumber: this.dogNumber, dogName: this.dogName, dogType: this.dogType, hp: this.hp, coinTime: this.coinTime };
            WGYQ_GameData.Instance.setArrayData("Dog", data);
        }
    }



    protected onLoad(): void {
        this.rig = this.getComponent(RigidBody2D);
        this.ani = this.getComponent(Animation);
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Init(dog: { dogNumber: number, dogName: string, dogType: string, hp: number, coinTime: number }) {
        this.dogNumber = dog.dogNumber;
        this.dogName = dog.dogName;
        this.dogType = dog.dogType;
        this.hp = dog.hp;
        this.coinTime = dog.coinTime;
        this.schedule(this.CheckTime, 1);
        this.Move();
    }

    Move() {
        this.ani.play("move");
        let pos = this.node.getPosition();
        let x = randomRangeInt(0, 2) == 0 ? -300 : 300;
        if (pos.x == -1700) x = 300;
        else if (pos.x == 1700) x = -300;
        this.node.setScale(v3(x < 0 ? -1 : 1, 1, 1));
        pos.x = clamp(pos.x + x, -1700, 1700);
        tween(this.node)
            .to(1, { position: pos })
            .call(() => {
                this.ani.play("idle");
                this.scheduleOnce(() => {
                    this.Move();
                }, randomRangeInt(1, 4));
            }).start();
    }

    CheckTime() {
        if (this.coinTime > 0) this.coinTime--;
        if (this.coinTime == 0) this.node.children[0].active = true;
        this.Hp--;
    }

    GetCoin() {
        WGYQ_YardUI.Instance.Coins += 10;
        this.coinTime = 30;
        this.node.children[0].active = false;
        UIManager.ShowTip("获得10金币");
    }

    Feed() {
        let data = WGYQ_GameData.Instance.getNumberData("ZJZG");
        if (data > 0) {
            data--;
            WGYQ_GameData.Instance.setNumberData("ZJZG", data);
            WGYQ_YardUI.Instance.InitZJZG();
            this.Hp += 200;
        }
        else UIManager.ShowTip("狗粮不足！")
    }

}
