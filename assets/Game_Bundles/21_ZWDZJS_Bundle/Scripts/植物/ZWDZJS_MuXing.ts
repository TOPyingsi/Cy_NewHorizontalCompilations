import { _decorator, Node } from 'cc';
import ZWDZJS_ZhiWu from './ZWDZJS_ZhiWu';
import ZWDZJS_Bulletpond from '../ZWDZJS_Bulletpond';
import ZWDZJS_GameManager from '../ZWDZJS_GameManager';
import ZWDZJS_Bullet from '../ZWDZJS_Bullet';
const { ccclass, property } = _decorator;



@ccclass('ZWDZJS_MuXing')
export default class ZWDZJS_MuXing extends ZWDZJS_ZhiWu {
    @property(Node)//子弹发射点
    FaSheDian: Node | null = null;
    protected onLoad(): void {
        this.Hp = 100;
        this.Speed = 2;
        this.Id = 0;
    }
    start() {
        super.start();
    }
    AttaCk(): void {
        this.audioPlay_Attack(4);
        let BulletPre: Node = ZWDZJS_Bulletpond.Instance.Getbullet(0);
        BulletPre.setParent(ZWDZJS_GameManager.Instance.CaoChang.getChildByName("子弹"));
        BulletPre.setWorldPosition(this.FaSheDian.getWorldPosition().clone());
        BulletPre.getComponent(ZWDZJS_Bullet).Right_Move(1000);//设置运动状态
        BulletPre.getComponent(ZWDZJS_Bullet).Attack = this.attack;//赋予伤害
    }
}

