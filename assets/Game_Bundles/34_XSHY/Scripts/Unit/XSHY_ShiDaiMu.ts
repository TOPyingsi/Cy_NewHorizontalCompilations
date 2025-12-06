import { _decorator, Component, Node, v3 } from 'cc';
import { XSHY_Unit } from '../XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_ShiDaiMu')
export class XSHY_ShiDaiMu extends XSHY_Unit {
    public NormalAttackNum: number = 3;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 1 },
        { Name: "普1", Scale: 1.2 },
        { Name: "普2", Scale: 1.4 },
        { Name: "技1", Scale: 3 },
        { Name: "技2", Scale: 5 },
        { Name: "技3", Scale: 1 }
    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {
            case "发射火球":
                this.GenerateBullet(0, v3(110, 160, 0), this.GetSkillScale("技1"));
                break;

        }

    }

}


