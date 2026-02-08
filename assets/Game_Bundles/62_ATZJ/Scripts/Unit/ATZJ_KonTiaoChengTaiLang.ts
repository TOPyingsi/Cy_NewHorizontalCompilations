import { _decorator, Component, Node, v3 } from 'cc';
import { ATZJ_Unit } from '../ATZJ_Unit';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_KonTiaoChengTaiLang')
export class ATZJ_KonTiaoChengTaiLang extends ATZJ_Unit {
    public NormalAttackNum: number = 3;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 1 },
        { Name: "普1", Scale: 1 },
        { Name: "普2", Scale: 1 },
        { Name: "技1_0", Scale: 1 },
        { Name: "技1_1", Scale: 1 },
        { Name: "技2_0", Scale: 1.2 },
        { Name: "技2_1", Scale: 0.7 },
        { Name: "技3_0", Scale: 1.2 },
        { Name: "技3_1", Scale: 2 },

    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {

        }

    }

}


