import { observable, action } from 'mobx'
import CryptoJS from 'crypto-js'
import agent from '@/Agent'

class AuthStore {
  @observable
  inProgress = false
  @observable
  errors = undefined
  @observable
  validKey = false
  @observable
  userDisplayName = undefined
  @observable
  userId = localStorage.getItem('userID')
    ? CryptoJS.AES.decrypt(
        localStorage.getItem('userID').toString(),
        'userID'
      ).toString(CryptoJS.enc.Utf8)
    : undefined

  @observable
  values = {
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    token: '',
  }

  @action
  resetValues() {
    this.values = {
      name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      token: '',
    }
  }

  @action
  setUsername(username) {
    this.values.username = username
  }

  @action
  setName(name) {
    this.values.name = name
  }

  @action
  setEmail(email) {
    this.values.email = email
  }

  @action
  setPassword(password) {
    this.values.password = password
  }

  @action
  setPhone(phone) {
    this.values.phone = phone
  }

  @action
  setToken(token) {
    this.values.token = token
  }

  @action
  validateKey__(key) {
    this.inProgress = true
    return agent.Server.validateKey(key)
      .then(
        action(response => {
          return response === 'valid' ? true : false
        })
      )
      .catch(err => {
        return false
      })
      .finally(_ => {
        this.inProgress = false
      })
  }

  @action
  validateKey_(key) {
    this.inProgress = true
    return agent.Server.validateKey(key)
      .then(response => {
        this.validKey = response === 'valid' ? true : false
      })
      .catch(err => {
        this.validKey = false
      })
      .finally(_ => {
        this.inProgress = false
      })
  }

  @action
  validateKey(key) {
    this.inProgress = true
    return new Promise((resolve, reject) => {
      return agent.Server.validateKey(key)
        .then(response => {
          this.validKey = response === 'valid' ? true : false
          return agent.Server.getUserDisplayNameByKey(key)
        })
        .then(profile => {
          this.userDisplayName = profile.displayName
        })
        .catch(err => {
          this.validKey = false
          reject(this.validKey)
        })
        .finally(_ => {
          resolve({
            valid: this.validKey,
            userDisplayName: this.userDisplayName,
          })
          this.inProgress = false
        })
    })
  }

  @action
  reset() {
    this.values.username = ''
    this.values.email = ''
    this.values.password = ''
    this.values.phone = ''
    this.values.name = ''
    this.values.token = ''
    this.errors = undefined
  }

  @action
  login() {
    if (this.inProgress) {
      return Promise.resolve()
    }

    this.inProgress = true

    return agent.Server.login(this.values.email)
      .then(profile => {
        // TODO: Store local credentials in localstorage
        return Promise.resolve(profile)
      })
      .catch(err => {
        return Promise.reject(err)
      })
      .finally(action(_ => (this.inProgress = false)))

    // return new Promise((resolve, reject) => {
    //   login(this.values.email)
    //     .then(res => {
    //       this.userId = res.playfabId
    //       localStorage.setItem(
    //         'userID',
    //         CryptoJS.AES.encrypt(res.playfabId, 'userID')
    //       )
    //       resolve(this.userId)
    //     })
    //     .catch(e => {
    //       reject(e.errorMessage)
    //     })
    //     .finally(action(_ => (this.inProgress = false)))
    // })
  }

  @action
  register() {
    this.inProgress = true
    this.errors = undefined

    let values = this.values
    values.phone.replace(/-/g, '')
    values.password = 'AmbassadorPass.v1'

    return agent.Server.registerUser(this.values)
      .then(profile => {
        // TODO: Store the user ID in local storage for auto login?
        return Promise.resolve(profile)
      })
      .catch(err => {
        return Promise.reject(err)
      })
      .finally(action(_ => (this.inProgress = false)))

    // return new Promise((resolve, reject) => {
    //   const values = this.values
    //   values.phone.replace(/-/g, '')

    //   registerUser(values)
    //     .then(res => {
    //       this.userId = res.playfabId
    //       localStorage.setItem(
    //         'userID',
    //         CryptoJS.AES.encrypt(res.playfabId, 'userID')
    //       )
    //       resolve(this.userId)
    //     })
    //     .catch(e => {
    //       reject(
    //         e.errorMessage
    //           ? {
    //               Name: [
    //                 e.errorMessage
    //                   .replace('The display name', 'Name')
    //                   .replace('identifier', 'phone number'),
    //               ],
    //             }
    //           : e.errorDetails
    //       )
    //     })
    //     .finally(action(_ => (this.inProgress = false)))
    // })
  }
}

export default new AuthStore()
