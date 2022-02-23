import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'

@inject('NavigationStore', 'PlayStore')
export default class ErrorPrompt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lockedButton: false,
    }
  }

  handleConnect() {
    this.setState({ lockedButton: true })
    this.props.PlayStore.reloadPage(res => {
      if (res.success) {
        this.props.reconnect()
      }
    })
  }

  render() {
    return (
      <Container>
        <Spacer style={{ marginBottom: '2vh' }}>
          <Text>SOCKET HAS BEEN DISCONNECTED</Text>
        </Spacer>
        <Spacer>
          <ConnectButton
            locked={this.state.lockedButton}
            onClick={
              this.state.lockedButton ? null : this.handleConnect.bind(this)
            }
          />
        </Spacer>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Spacer = styled.div`
  width: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Text = styled.span`
  font-family: pamainbold;
  font-size: 4vh;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5vh;
`

const ConnectButton = styled.div`
  width: 20vh;
  height: 7vh;
  border-radius: 0.2vh;
  background-color: #18c5ff;
  color: #ffffff;
  font-family: pamainlight;
  font-size: 3vh;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  &:after {
    content: '${props => (props.locked ? `CONNECTING...` : `CONNECT`)}';
  }
`
