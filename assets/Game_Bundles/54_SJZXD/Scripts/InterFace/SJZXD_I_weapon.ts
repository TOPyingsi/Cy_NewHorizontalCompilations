import { Component, Vec3 } from "cc";
import { SJZXD_WeaponItem } from "../SJZXD_Constant";


export class SJZXD_I_weapon extends Component {
    _WeaponData: SJZXD_WeaponItem = null;//武器属性
    _state: number = -1;//0待机 1攻击
    _bulletnum: number = 0;//当前子弹数量
    _Maxbulletnum: number = 0;//最大子弹数量
    SetSpeed(Speed: number) { };//设置武器速度
    SetCamp(Camp: number) { };//设置阵营
    SetAttack(Attack: number) { };//设置武器伤害

    Attack() { };
    StopAttack() { };
    SetWeaponRotation(EnemyPos: Vec3) { };//设置角度
    SetWeaponRotationToAngle(Angle: number) { };//设定指定角度
    SetWeaponFlip() { };//武器翻转角度
    Reload() { };
}


