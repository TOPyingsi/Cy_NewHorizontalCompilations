import { _decorator } from 'cc';
import { CDXX2_BGController } from './CDXX2_BGController';
const { ccclass } = _decorator;

/**
 * 凡界背景控制器
 * 继承自 BGController，只保留基本的传送功能
 */
@ccclass('CDXX2_BG_1')
export class CDXX2_BG_1 extends CDXX2_BGController {
    // 传送功能已在父类 CDXX2_BGController 中实现
    // 无需额外代码
}
