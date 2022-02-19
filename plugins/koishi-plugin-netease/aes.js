const CryptoJS = require('crypto-js')

// AES key、iv
const key = '0CoJUm6Qyw8W8jud'
const iv = '0102030405060708'
// 随机参数(需匹配)
const random16 = 'gLzevgghwCyWXAVK'
const encSecKey = '3b599bd1e7e9f63841a2c84833f5fed0dce57949ea82f661a5536abc1c414e7c8a4c98becac2a70dcb1823364661c613e9a4fa95d75525eefceecb15497a679bb5b57f598215e2a6f739db1e7f534fb165d607bff47c6e5646f7f216b7dcc757c383b3099052e48d9d7844f25cd9a1bc88df57cb42a553b04e85b1659db5789a'

// aes加密
const encrypt = (word, okey, oiv) => {
  const key = CryptoJS.enc.Utf8.parse(okey)
  const iv = CryptoJS.enc.Utf8.parse(oiv)
  let encrypted = ''
  if (typeof word === 'string') {
    const srcs = CryptoJS.enc.Utf8.parse(word)
    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC
    })
  } else if (typeof word === 'object') {
    // 对象格式的转成json字符串
    const data = JSON.stringify(word)
    const srcs = CryptoJS.enc.Utf8.parse(data)
    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC
    })
  }
  // return encrypted.ciphertext.toString()
  return encrypted.toString()
}
// aes解密
const decrypt = (word, okey, oiv) => {
  // const encryptedHexStr = CryptoJS.enc.Hex.parse(word)
  // const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  const key = CryptoJS.enc.Utf8.parse(okey)
  const iv = CryptoJS.enc.Utf8.parse(oiv)
  const decrypted = CryptoJS.AES.decrypt(word, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC
  })
  const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}

// 基于网易云的参数加密方法
const getEncryptObj = word => {
  return {
    encSecKey,
    params: encrypt(encrypt(word, key, iv), random16, iv)
  }
}

module.exports = {
  getEncryptObj,
  encrypt,
  decrypt
}
