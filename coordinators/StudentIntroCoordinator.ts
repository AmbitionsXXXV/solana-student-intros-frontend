// 导入相关的Solana Web3和Base58编码库
import * as web3 from '@solana/web3.js'
import bs58 from 'bs58'
// 导入学生介绍模型
import { StudentIntro } from '../models/StudentIntro'

// 定义学生介绍程序的公钥ID
const STUDENT_INTRO_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf'

// 定义一个类来协调与Solana区块链中学生介绍相关的操作
export class StudentIntroCoordinator {
  // 静态变量，用于存储学生介绍账户的公钥
  static accounts: web3.PublicKey[] = []

  // 预获取账户信息的静态异步方法
  static async prefetchAccounts(connection: web3.Connection, search: string) {
    // 通过程序ID和可选的搜索条件获取账户信息
    const accounts = await connection.getProgramAccounts(
      new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID),
      {
        // 定义数据切片，以及搜索条件的过滤器
        dataSlice: { offset: 1, length: 12 },
        filters:
          search === ''
            ? []
            : [
                {
                  memcmp: {
                    offset: 5,
                    bytes: bs58.encode(Buffer.from(search)),
                  },
                },
              ],
      },
    )

    // 对获取的账户进行排序
    accounts.sort((a, b) => {
      const lengthA = a.account.data.readUInt32LE(0)
      const lengthB = b.account.data.readUInt32LE(0)
      const dataA = a.account.data.slice(4, 4 + lengthA)
      const dataB = b.account.data.slice(4, 4 + lengthB)
      return dataA.compare(dataB)
    })

    // 更新静态账户列表
    this.accounts = accounts.map(account => account.pubkey)
  }

  // 获取分页数据的静态异步方法
  static async fetchPage(
    connection: web3.Connection,
    page: number,
    perPage: number,
    search: string,
    reload: boolean = false,
  ): Promise<StudentIntro[]> {
    // 如果账户列表为空或需要重新加载，则预先获取账户信息
    if (this.accounts.length === 0 || reload) {
      await this.prefetchAccounts(connection, search)
    }

    // 根据页码和每页数量计算出分页的公钥
    const paginatedPublicKeys = this.accounts.slice(
      (page - 1) * perPage,
      page * perPage,
    )

    // 如果没有公钥则返回空数组
    if (paginatedPublicKeys.length === 0) {
      return []
    }

    // 根据公钥获取账户信息
    const accounts = await connection.getMultipleAccountsInfo(paginatedPublicKeys)

    // 将获取的账户信息反序列化为学生介绍对象，并返回
    const movies = accounts.reduce((accum: StudentIntro[], account) => {
      const movie = StudentIntro.deserialize(account?.data)
      if (!movie) {
        return accum
      }

      return [...accum, movie]
    }, [])

    return movies
  }
}
