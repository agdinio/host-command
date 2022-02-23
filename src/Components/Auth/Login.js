import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import styled, { keyframes } from 'styled-components'
import { vhToPx, vwToPx, validEmail } from '@/utils'
import PlayAlongNowIcon from '@/assets/images/PlayAlongNow-Logo_Invert.svg'

@inject('AuthStore', 'NavigationStore')
export default class Login extends Component {

  handleLoginClick() {
    this.props.NavigationStore.setCurrentView('/command')
  }

  handleInputEmailChange(e) {
    this.props.AuthStore.setEmail(e.target.value)
    this.valid = undefined

    this.validateEmail()
  }

  handleEnterKey(e) {
    if (e.which === 13 || e.keyCode === 13) {
      this.login()
    }
  }


  validateEmail() {
    if (!this.refLoginButton) {
      return
    }

    const valid = validEmail(this.props.AuthStore.values.email)
    if (valid) {
      this.refLoginButton.style.pointerEvents = 'auto'
      this.refLoginButton.style.cursor = 'pointer'
    } else {
      this.refLoginButton.style.pointerEvents = 'none'
      this.refLoginButton.style.cursor = 'default'
    }
  }

  componentDidMount() {
    this.validateEmail()
  }

  render() {

    let { values } = this.props.AuthStore

    return (
      <Container>
        <Section marginBottom={5}>
          <Logo src={PlayAlongNowIcon}/>
        </Section>
        <Section marginBottom={4}>
          <TextWrapper>
            <Text font={'pamainextrabold'} size={2.8} color={'#000000'} uppercase>game event sessions</Text>
          </TextWrapper>
          <TextWrapper>
            <Text font={'pamainextrabold'} size={1.8} color={'rgba(0,0,0, 0.5)'} uppercase>manage games & host command</Text>
          </TextWrapper>
        </Section>
        <Section marginBottom={3.5} center>
          <FormWrapper>
            <FormFieldSet marginBottom={2}>
              <FormInput
                type="email"
                placeholder="user name"
                onChange={this.handleInputEmailChange.bind(this)}
              />
            </FormFieldSet>
            <FormFieldSet>
              <FormInput
                type="password"
                placeholder="password"
              />
            </FormFieldSet>
          </FormWrapper>
        </Section>
        <Section marginBottom={0.5} center>
          <LoginButton
            innerRef={ref => this.refLoginButton = ref}
            onClick={this.handleLoginClick.bind(this)}
          />
        </Section>
        <Section>
          <TextWrapper>
            <Text font={'pamainextrabold'} size={1.2} color={'rgba(0,0,0, 0.4)'} letterSpacing={0} uppercase>can't login? ask your operations manager</Text>
          </TextWrapper>
        </Section>
      </Container>
    )
  }
}

const Container = styled.div`
  width: ${props => vwToPx(100)};
  height: ${props => vhToPx(100)};
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #eaeaea;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  ${props => props.center ? 'align-items: center;' : ''};
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
`

const Logo = styled.img`
  height: ${props => vhToPx(8)};
`

const TextWrapper = styled.div`
  text-align: center;
`

const Text = styled.span`
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => vhToPx(props.size || 3)};
  color: ${props => props.color || '#000000'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
  props.italic ? 'font-style: italic;' : ''};
  ${props =>
  props.nowrap
    ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
    : ''};
  ${props => props.letterSpacing ? `letter-spacing:${props.letterSpacing}` : ''};
`

const FormWrapper = styled.form`
  width: 15%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const FormFieldSet = styled.fieldset`
  width: 100%;
  border: none;
  position: relative;
  margin-top: ${props => vhToPx(props.marginTop) || 0};
  margin-bottom: ${props => vhToPx(props.marginBottom) || 0};
`

const FormInput = styled.input`
  ${props =>
  props.valid === undefined
    ? 'color: black'
    : `color: ${props.valid ? '#2fc12f' : '#ed1c24'}`};
  font-family: pamainbold;
  width: 100%;
  height: ${props => vhToPx(5)};
  border: none;
  outline: none;
  font-size: ${props => vhToPx(2)};
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(0.1)};
  line-height: 1;
  padding-left: 5%;
`

const LoginButton = styled.div`
  width: ${props => vhToPx(17)};
  height: ${props => vhToPx(6)};
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: 'access';
    font-family: pamainbold;
    font-size: ${props => vhToPx(2)};
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
    line-height: 1;
    color: #ffffff;
  }
`
