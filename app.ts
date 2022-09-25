import SpeculosTransport from '@ledgerhq/hw-transport-node-speculos-http'
import Aptos from './src/Aptos'

async function exampleSimple () {
  const transport = await SpeculosTransport.open({ baseURL: 'http://localhost:5000' })
  const res = await transport.send(0xe0, 0x03, 0x00, 0x00)
  console.log(res)
  await transport.close()
}

async function exampleAptos () {
  const transport = await SpeculosTransport.open({ baseURL: 'http://localhost:5000' })
  const aptosClinet = new Aptos(transport)
  const res = await aptosClinet.getAppConfiguration()
  console.log(res)
  await transport.close()
}

const main = async (): Promise<void> => {
  try {
    await exampleSimple()
    await exampleAptos()
  } catch (err) {
    console.log(err)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
