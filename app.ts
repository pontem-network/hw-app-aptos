import Transport from '@ledgerhq/hw-transport'
import SpeculosTransport from '@ledgerhq/hw-transport-node-speculos-http'
import Aptos from './src/Aptos'

async function exampleRaw (transport: Transport) {
  console.log('getVersion(raw)', await transport.send(0xe0, 0x03, 0x00, 0x00))
}

async function exampleAptos (transport: Transport) {
  const aptosClinet = new Aptos(transport)
  console.log('getVersion', await aptosClinet.getVersion())
  console.log('getAddress', await aptosClinet.getAddress("m/44'/637'/1'/0'/0'", false))
}

const main = async (): Promise<void> => {
  const transport = await SpeculosTransport.open({ baseURL: 'http://localhost:5000' })
  try {
    await exampleRaw(transport)
    await exampleAptos(transport)
  } catch (err) {
    console.log(err)
  } finally {
    await transport.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
