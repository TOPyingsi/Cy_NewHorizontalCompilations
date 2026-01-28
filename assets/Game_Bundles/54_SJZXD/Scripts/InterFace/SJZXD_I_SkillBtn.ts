import { Component, Node, Vec3 } from "cc";
import { SJZXD_WeaponItem } from "../SJZXD_Constant";
import { SJZXD_Unit } from "../SJZXD_Unit";


export abstract class SJZXD_I_SkillBtn extends Component {
    public FindUnit: SJZXD_Unit = null;
    public FindNode: Node = null;
}


