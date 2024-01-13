// 导入Borsh序列化库
import * as borsh from '@project-serum/borsh'

// 定义学生介绍类
export class StudentIntro {
  // 学生的姓名
  name: string
  // 学生的留言信息
  message: string

  // 构造函数，用于初始化学生的姓名和留言
  constructor(name: string, message: string) {
    this.name = name
    this.message = message
  }

  // 提供一些模拟数据，方便开发和测试
  static mocks: StudentIntro[] = [
    new StudentIntro(
      'Elizabeth Holmes',
      `Learning Solana so I can use it to build sick NFT projects.`,
    ),
    new StudentIntro(
      'Jack Nicholson',
      `I want to overhaul the world's financial system. Lower friction payments/transfer, lower fees, faster payouts, better collateralization for loans, etc.`,
    ),
    new StudentIntro('Terminator', `i'm basically here to protect`),
  ]

  // 定义Borsh序列化的结构，用于指令数据
  borshInstructionSchema = borsh.struct([
    borsh.u8('variant'),
    borsh.str('name'),
    borsh.str('message'),
  ])

  // 定义Borsh序列化的结构，用于账户数据
  static borshAccountSchema = borsh.struct([
    borsh.bool('initialized'),
    borsh.str('name'),
    borsh.str('message'),
  ])

  // 将学生介绍实例序列化为Buffer
  serialize(): Buffer {
    const buffer = Buffer.alloc(1000)
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer)
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
  }

  // 从Buffer反序列化为StudentIntro实例
  static deserialize(buffer?: Buffer): StudentIntro | null {
    if (!buffer) {
      return null
    }

    try {
      // 使用Borsh解码Buffer中的数据
      const { name, message } = this.borshAccountSchema.decode(buffer)
      return new StudentIntro(name, message)
    } catch (e) {
      // 如果反序列化出错，则记录错误信息并返回null
      console.log('Deserialization error:', e)
      return null
    }
  }
}
