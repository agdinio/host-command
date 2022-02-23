import React, { PureComponent } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
import styled from 'styled-components'
import { vhToPx, maxHeight } from '@/utils'
import { inject } from 'mobx-react'
import Main from '@/Components/Main'
import CommandHost from '@/Components/CommandHost'
import GameEvent from '@/Components/GameEvent'

class App extends PureComponent {
  render() {
    return (
      <AppContainer>
        <Switch>
          <Route exact path="/" component={Main} />
          <Redirect to="/" />
        </Switch>
      </AppContainer>
    )
  }
}

export default App

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  user-select: none;
`
