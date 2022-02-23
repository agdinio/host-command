module.exports = requests => {
  return {
    current: () => requests.get('/user'),
    login: (email, password) =>
      requests.post('/users/login', { user: { email, password } }),
    register: (username, email, password) =>
      requests.post('/users', { user: { username, email, password } }),
    save: user => requests.put('/user', { user }),
  }
}
