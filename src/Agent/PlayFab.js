const superagent = require('superagent')
const utils = require('util')

const TitleId = '218'
const Secret = 'YZPCUDSFQYNPP4E73F3PX3X6EOCUX14I67HWZJ5QU3ROSTASRQ'
const TOKEN_USER_ID = 'A2895D633A2595CB'

function server(endpoint) {
  return superagent
    .post(`https://${TitleId}.playfabapi.com/Server/${endpoint}`)
    .type('json')
    .set({ 'Accept-Encoding': 'gzip,sdch' })
    .set('X-SecretKey', Secret)
}

function client(endpoint, sessionTicket = null) {
  let result = superagent
    .post(`https://${TitleId}.playfabapi.com/Client/${endpoint}`)
    .type('json')
    .set({ 'Accept-Encoding': 'gzip,sdch' })

  if (sessionTicket) {
    result.set({ 'X-Authentication': sessionTicket })
  }

  return result
}
function admin(endpoint, sessionTicket = null) {
  return superagent
    .post(`https://${TitleId}.playfabapi.com/Admin/${endpoint}`)
    .type('json')
    .set({ 'Accept-Encoding': 'gzip,sdch' })
    .set('X-SecretKey', Secret)
}

function debug(obj) {
  return console.log(utils.inspect(obj, { depth: null }))
}

export function login(Email, Password = 'AmabassadorPass.v1') {
  return client('LoginWithEmailAddress')
    .send({
      Email,
      Password,
      TitleId: TitleId,
      CreateAccount: false,
      LoginTitlePlayerAccountEntity: false,
    })
    .then(
      res =>
        new PlayerProfile(res.body.data.PlayFabId, res.body.data.SessionTicket)
    )
    .catch(e => {
      throw e.response ? e.response.body : e
    })
}

export function checkPlayerToken(token) {
  return admin('GetUserInternalData')
    .send({
      PlayFabId: TOKEN_USER_ID,
      Keys: [token],
    })
    .then(res => {
      const { Data } = res.body.data
      return Data[token]
    })
    .catch(e => {
      throw e.response ? e.response.body : e
    })
}

export function registerUser(
  { name, email, Password = 'AmabassadorPass.v1', phone, token },
  referralID
) {
  return client('RegisterPlayFabUser')
    .send({
      Username: name.replace(/ /g, ''),
      DisplayName: name,
      Email: email,
      Password,
      TitleId: TitleId,
    })
    .then(res => {
      let promise = Promise.resolve()
      const newPlayer = new PlayerProfile(
        res.body.data.PlayFabId,
        res.body.data.SessionTicket
      )
      if (phone) {
        promise = client('UpdateUserData', newPlayer.SessionTicket).send({
          Permission: 'Public',
          Data: {
            Phone: phone,
          },
        })
      }
      return promise
        .then(() =>
          newPlayer
            .updateRef(token, referralID)
            .then(newPlayer)
            .catch(e => newPlayer.deletePlayer(e))
        )
        .catch(e => newPlayer.deletePlayer(e))
    })
    .catch(e => {
      throw e.response ? e.response.body : e
    })
}

export default class PlayerProfile {
  constructor(playfabId, sessionTicket) {
    this.playfabId = playfabId
    this.sessionTicket = sessionTicket
  }

  getUserData(key) {
    return client('GetUserData', this.sessionTicket).send({
      Keys: [key],
      PlayFabId: this.playfabId,
    })
  }

  deletePlayer(e) {
    return admin('DeletePlayer')
      .send({
        PlayFabId: this.PlayFabId,
      })
      .then(() => {
        throw e.response ? e.response.body : e
      })
      .catch(() => {
        throw e.response ? e.response.body : e
      })
  }

  updateRef(CouponCode, PlayFabId) {
    return admin('UpdateUserInternalData')
      .send({
        PlayFabId: TOKEN_USER_ID,
        Data: {
          [CouponCode]: null,
        },
      })
      .then(() =>
        server('RedeemCoupon').send({
          CouponCode,
          PlayFabId,
        })
      )
      .catch(e => {
        throw e.response ? e.response.body : e
      })
  }

  /**
   * Updates the user's data
   *
   * @param {object} data Key/Value pairs to assign
   */
  setUserData(data) {
    return client('UpdateUserData', this.sessionTicket).send({
      Data: data,
      Permission: 'Public',
    })
  }

  /**
   * Remove keys from the Player's public space
   * @param {Array} keys Array of keys to remove
   */
  removeUserData(keys) {
    return client('UpdateUserData', this.sessionTicket).send({
      KeysToRemove: keys,
      Permission: 'Public',
    })
  }

  getUserInternalData(key, value) {
    return server('GetUserInternalData').send({
      Keys: ['keystore'],
      PlayFabId: this.playfabId,
    })
  }

  getKeys() {
    return server('GetUserInternalData')
      .send({
        Keys: ['keystore'],
        PlayFabId: this.playfabId,
      })
      .then(res => {
        let data = res.body.data.Data

        let keystore = []
        if (data.keystore && data.keystore.Value) {
          keystore = data.keystore.Value.split(',')
        }

        return keystore
      })
  }

  addKeyToUser(key) {
    return this.getKeys().then(keystore => {
      if (keystore.indexOf(key) >= 0) {
        console.info('User already has the key')
        return { data: null }
      } else {
        keystore.push(`${this.playfabId}-${key}`)
      }

      return server('UpdateUserInternalData').send({
        Data: { keystore: keystore.join(',') },
        PlayFabId: this.playfabId,
      })
    })
  }

  redeemKey(key) {
    if (key == null) {
      throw new Error('Key must be valid')
    }

    let tokens = key.split('-')
    let fromUser = tokens[0]
    let couponCode = tokens.slice(1).join('-')

    // Add the referral
    return server('RedeemCoupon')
      .send({
        CouponCode: couponCode,
        PlayFabId: this.playfabId,
      })
      .then(_ =>
        server('UpdateUserInternalData').send({
          Data: { referral: fromUser },
          PlayFabId: this.playfabId,
        })
      )
  }
}
