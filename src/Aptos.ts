import BIPPath from 'bip32-path'
import { sha3_256 as sha3Hash } from '@noble/hashes/sha3'
import Transport from '@ledgerhq/hw-transport'
import { StatusCodes } from '@ledgerhq/errors'

const MAX_PAYLOAD = 255
const P1_NON_CONFIRM = 0x00
const P1_CONFIRM = 0x01
const P2_EXTEND = 0x01
const P2_MORE = 0x02

const LEDGER_CLA = 0xe0
const INS = {
  GET_VERSION: 0x03,
  GET_PUBLIC_KEY: 0x05,
}

interface AppConfig {
  version: string
}

interface AddressData {
  publicKey: Buffer
  chainCode: Buffer
  address: string
}

export default class Aptos {
  readonly transport: Transport

  constructor (transport: Transport, scrambleKey: string = 'aptos') {
    this.transport = transport
    this.transport.decorateAppAPIMethods(this, ['getVersion', 'getAddress'], scrambleKey)
  }

  async getVersion (): Promise<AppConfig> {
    const [major, minor, patch] = await this.sendToDevice(INS.GET_VERSION, P1_NON_CONFIRM, Buffer.alloc(0))
    return {
      version: `${major}.${minor}.${patch}`,
    }
  }

  async getAddress (path: string, display: boolean = false): Promise<AddressData> {
    const pathBuffer = this.pathToBuffer(path)
    const responseBuffer = await this.sendToDevice(INS.GET_PUBLIC_KEY, display ? P1_CONFIRM : P1_NON_CONFIRM, pathBuffer)

    let offset = 1
    const pubKeyLen = responseBuffer.slice(0, offset)[0] - 1
    const pubKeyBuffer = responseBuffer.slice(++offset, (offset += pubKeyLen))
    const chainCodeLen = responseBuffer.slice(offset, ++offset)[0]
    const chainCodeBuffer = responseBuffer.slice(offset, offset + chainCodeLen)

    const address = '0x' + this.publicKeyToAddress(pubKeyBuffer).toString('hex')

    return {
      publicKey: pubKeyBuffer,
      chainCode: chainCodeBuffer,
      address,
    }
  }

  // send chunked if payload size exceeds maximum for a call
  private async sendToDevice (instruction: number, p1: number, payload: Buffer): Promise<Buffer> {
    const acceptStatusList = [StatusCodes.OK]

    let p2 = 0
    let payloadOffset = 0

    if (payload.length > MAX_PAYLOAD) {
      while (payload.length - payloadOffset > MAX_PAYLOAD) {
        const buf = payload.slice(payloadOffset, payloadOffset + MAX_PAYLOAD)
        payloadOffset += MAX_PAYLOAD
        // console.log( "send", (p2 | P2_MORE).toString(16), buf.length.toString(16), buf);
        const reply = await this.transport.send(LEDGER_CLA, instruction, p1, p2 | P2_MORE, buf, acceptStatusList)
        this.throwOnFailure(reply)
        p2 |= P2_EXTEND
      }
    }

    const buf = payload.slice(payloadOffset)
    // console.log("send", p2.toString(16), buf.length.toString(16), buf);
    const reply = await this.transport.send(LEDGER_CLA, instruction, p1, p2, buf, acceptStatusList)
    this.throwOnFailure(reply)

    return reply.slice(0, reply.length - 2)
  }

  private pathToBuffer (originalPath: string): Buffer {
    const path = originalPath
      .split('/')
      .filter(value => value !== 'm')
      .map(value => (value.endsWith("'") || value.endsWith('h') ? value : value + "'"))
      .join('/')
    const pathNums: number[] = BIPPath.fromString(path).toPathArray()
    return this.serializePath(pathNums)
  }

  private serializePath (path: number[]): Buffer {
    const buf = Buffer.alloc(1 + path.length * 4)
    buf.writeUInt8(path.length, 0)
    for (const [i, num] of path.entries()) {
      buf.writeUInt32BE(num, 1 + i * 4)
    }
    return buf
  }

  private publicKeyToAddress (pubKey: Buffer): Buffer {
    const hash = sha3Hash.create()
    hash.update(pubKey)
    hash.update('\x00')
    return Buffer.from(hash.digest())
  }

  private throwOnFailure (reply: Buffer): void {
    // transport makes sure reply has a valid length
    const status = reply.readUInt16BE(reply.length - 2)
    if (status !== StatusCodes.OK) {
      throw new Error(`Failure with status code: 0x${status.toString(16)}`)
    }
  }
}
