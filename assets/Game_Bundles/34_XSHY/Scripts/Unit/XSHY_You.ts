import { _decorator, Component, Node, v3 } from 'cc';
import { XSHY_Unit } from '../XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_You')
export class XSHY_You extends XSHY_Unit {
    public NormalAttackNum: number = 3;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 1 },
        { Name: "普1", Scale: 1 },
        { Name: "普2", Scale: 1 },
        { Name: "技1", Scale: 0.5 },
        { Name: "技2", Scale: 2 },
        { Name: "技3", Scale: 3 },
        { Name: "喷火", Scale: 0.7 }
    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {
            case "施放火球":
                this.GenerateBullet(0, v3(80, 200, 0), this.Attack * 2);
                break;
            case "喷火":
                this.AttackCollisionLook("喷火");
                break;
        }

    }

}


