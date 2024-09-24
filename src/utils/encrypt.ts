
const sha256 = async (key: string) => {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(key);                    
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string                  
    const hashHex = Buffer.from(hashArray).toString('base64');
    return hashHex;
}

const createIV = (signature: string, ivLength = 16) => {
    // Convert the hexadecimal string to a byte array
    const array = signature.match(/.{1,2}/g)
    if (!array?.length) {
        throw 'Create IV Error'
    }
    const byteArray = new Uint8Array(array.map(byte => parseInt(byte, 16)));
  
    // Slice the byte array to get the IV of the required length
    const iv = byteArray.slice(0, ivLength);
  
    return iv;
  }
  
const importKey = async (key: string) => {
    const hashKey = await sha256(key);
    const secret = await crypto.subtle.importKey('raw', 
        Buffer.from(hashKey, 'base64'), {
        name: 'AES-GCM',
        length: 256
    }, true, ['encrypt', 'decrypt']);
    return secret;
}

export const encryptSymmetric = async (plaintext: string, key: string) => {
      // encode the text you want to encrypt
    const encodedPlaintext = new TextEncoder().encode(plaintext);
    // prepare the secret key for encryption
    const secretKey = await importKey(key);
    // encrypt the text with the secret key
    const ciphertext = await crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv: createIV(key)
    }, secretKey, encodedPlaintext);
    
    // return the encrypted text "ciphertext" and the IV
    // encoded in base64
    return Buffer.from(ciphertext).toString('base64')
}

export const decryptSymmetric = async (ciphertext: string, key: string) => {
    // prepare the secret key
    const secretKey = await importKey(key);
  
    // decrypt the encrypted text "ciphertext" with the secret key and IV
    const cleartext = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv: createIV(key)
    }, secretKey, Buffer.from(ciphertext, 'base64'));
  
    // decode the text and return it
    return new TextDecoder().decode(cleartext);
  }
