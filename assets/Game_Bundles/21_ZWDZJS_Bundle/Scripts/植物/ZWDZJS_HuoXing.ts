import { _decorator, Animation, Node } from 'cc';
import ZWDZJS_ZhiWu from './ZWDZJS_ZhiWu';
import ZWDZJS_JiangShi from '../僵尸/ZWDZJS_JiangShi';
import { SkeletonManager } from '../../../../Scripts/Framework/Managers/SkeletonManager';
const { ccclass, property } = _decorator;



@ccclass('ZWDZJS_HuoXing')
export default class ZWDZJS_HuoXing extends ZWDZJS_ZhiWu {
    @property(Node)//子弹发射点
    FaSheDian: Node | null = null;
    private JianShiNum: number = 0;//范围内僵尸数量
    private JianshiArray: Node[] = [];//范围内僵尸node
    protected onLoad(): void {
        this.Hp = 2000;
        this.Speed = 3;
        this.Id = 5;
        this.attack = 10;
    }
    start() {
        super.start();
    }
    open_attack() {
        if (this.JianshiArray[0]) {
            this.audioPlay_Attack(5);
            this.JianshiArray[0].getComponent(ZWDZJS_JiangShi).SufferHarm(this.attack);//造成伤害
        }
    }
    AttaCk(): void {
        ++this.AttackNumber;
        if (this._skeleton) {
            SkeletonManager.play_Animation(this._skeleton, "gongji", false, () => {
                SkeletonManager.play_Animation(this._skeleton, "daiji", true);
            }, () => {
                if (this.node) {
                    this.open_attack();
                }
            }, 0.8);
        }
    }
    onCollisionEnter(other, self) {//伤害范围
        if (other.tag == 1 && self.tag == 1001) {//攻击范围碰撞遇到僵尸
            this.JianShiNum++;
            this.JianshiArray.push(other.node);
            this.triggering_condition = true;
        }
        if (other.tag == 1 && self.tag == 1002) {//攻击范围碰撞遇到僵尸
            //留着放技能
        }
    }
    onCollisionExit(other, self) {
        if (other.tag == 1 && self.tag == 1001) {//攻击范围僵尸离开
            this.JianShiNum--;
            this.JianshiArray.splice(this.JianshiArray.indexOf(other.node), 1);
            if (this.JianShiNum == 0) {
                this.triggering_condition = false;
            }
        }
    }
}

