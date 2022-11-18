## Aptos Hardware Wallet Example 

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [Aptos](#aptos)
    *   [Parameters](#parameters)
    *   [Examples](#examples)
    *   [getVersion](#getversion)
        *   [Examples](#examples-1)
    *   [getAddress](#getaddress)
        *   [Parameters](#parameters-1)
        *   [Examples](#examples-2)
    *   [signTransaction](#signtransaction)
        *   [Parameters](#parameters-2)
        *   [Examples](#examples-3)

#### Parameters

*   `transport` **Transport** a transport for sending commands to a device
*   `scrambleKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** a scramble key (optional, default `"aptos"`)

#### Examples

```javascript
import Aptos from "hw-app-aptos";
const aptos = new Aptos(transport);
```

#### getVersion

Get application version.

##### Examples

```javascript
aptos.getVersion().then(r => r.version)
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<AppConfig>** an object with the version field

#### getAddress

Get Aptos address (public key) for a BIP32 path.

Because Aptos uses Ed25519 keypairs, as per SLIP-0010
all derivation-path indexes will be promoted to hardened indexes.

##### Parameters

*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** a BIP32 path
*   `display` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** flag to show display (optional, default `false`)

##### Examples

```javascript
aptos.getAddress("m/44'/637'/1'/0'/0'").then(r => r.address)
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<AddressData>** an object with publicKey, chainCode, address fields

#### signTransaction

Sign an Aptos transaction.

##### Parameters

*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** a BIP32 path
*   `txBuffer` **[Buffer](https://nodejs.org/api/buffer.html)** serialized transaction

##### Examples

```javascript
aptos.signTransaction("m/44'/637'/1'/0'/0'", txBuffer).then(r => r.signature)
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<{signature: [Buffer](https://nodejs.org/api/buffer.html)}>** an object with the signature field
