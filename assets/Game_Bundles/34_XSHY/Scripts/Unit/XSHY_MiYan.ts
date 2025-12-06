import { _decorator, Component, Node, v3 } from 'cc';
import { XSHY_Unit } from '../XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_MiYan')
export class XSHY_MiYan extends XSHY_Unit {
    public NormalAttackNum: number = 3;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 1 },
        { Name: "普1", Scale: 1 },
        { Name: "普2", Scale: 1 },
        { Name: "技1_0", Scale: 0.4 },
        { Name: "技1_1", Scale: 0.5 },
        { Name: "技1_2", Scale: 0.6 },
        { Name: "技1_3", Scale: 0.7 },
        { Name: "技2", Scale: 1 },
        { Name: "技3", Scale: 0.6 },

    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {

        }

    }

}


