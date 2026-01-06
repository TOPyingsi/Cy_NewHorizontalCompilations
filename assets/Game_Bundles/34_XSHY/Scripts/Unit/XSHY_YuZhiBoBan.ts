import { _decorator, Component, Node, v3 } from 'cc';
import { XSHY_Unit } from '../XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_YuZhiBoBan')
export class XSHY_YuZhiBoBan extends XSHY_Unit {
    public NormalAttackNum: number = 3;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 1 },
        { Name: "普1", Scale: 1 },
        { Name: "普2", Scale: 1 },
        { Name: "技1", Scale: 0.25 },
        { Name: "技2", Scale: 0.2 },
        { Name: "技3", Scale: 4 },

    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {

        }

    }

}


