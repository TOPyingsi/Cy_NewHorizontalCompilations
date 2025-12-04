import { _decorator, Node, UIOpacity } from 'cc';
import ZWDZJS_ZhiWu from './ZWDZJS_ZhiWu';
import ZWDZJS_Bulletpond from '../ZWDZJS_Bulletpond';
import ZWDZJS_Bullet from '../ZWDZJS_Bullet';
const { ccclass, property } = _decorator;


@ccclass('ZWDZJS_DiQIu')
export default class ZWDZJS_DiQIu extends ZWDZJS_ZhiWu {
    @property(Node)//子弹发射点
    FaSheDian: Node | null = null;
    protected onLoad(): void {
        this.Hp = 100;
        this.Speed = 21;
        this.Id = 1;
    }
    start() {
        super.start();


    }
    AttaCk(): void {
        let BulletPre = ZWDZJS_Bulletpond.Instance.Getbullet(1);
        BulletPre.getComponent(UIOpacity).opacity = 255;
        BulletPre.getComponent(ZWDZJS_Bullet).Init();//设置运动状态
        BulletPre.getComponent(ZWDZJS_Bullet).scheduleOnce(BulletPre.getComponent(ZWDZJS_Bullet).YanGuan_RuoYingRuoXian, 3);
        BulletPre.setWorldPosition(this.FaSheDian.getWorldPosition().clone());//设置子弹位置
        BulletPre.getComponent(ZWDZJS_Bullet).YanGuan_DiaoLuo();//设置运动状态
    }
}

