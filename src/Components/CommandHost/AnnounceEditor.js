import React, { Component } from 'react'
import styled, { keyframes } from 'styled-components'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { vhToPx, maxWidth } from '@/utils'

export default class AnnounceEditor extends Component {
  constructor(props) {
    super(props)
    this.quill = null
  }

  componentDidMount() {
    let Font = Quill.import('formats/font')
    Font.whitelist = [
      'arial',
      'times-new-roman',
      'pamainlight',
      'pamainregular',
      'pamainbold',
      'pamainextrabold',
    ]
    Quill.register(Font, true)

    let Size = Quill.import('attributors/style/size')
    Size.whitelist = ['1vh', '2vh', '3vh', '4vh', '5vh']
    Quill.register(Size, true)

    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],
      //[{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }],
      //[{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction
      //[{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ size: ['1vh', '2vh', '3vh', '4vh', '5vh'] }],
      //[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [
        {
          font: [
            'arial',
            'times-new-roman',
            'pamainlight',
            'pamainregular',
            'pamainbold',
            'pamainextrabold',
          ],
        },
      ],
      [{ align: [] }],

      ['clean'], // remove formatting button
    ]

    this.quill = new Quill('#editor', {
      modules: {
        toolbar: toolbarOptions,
      },
      theme: 'snow',
    })
  }

  handleAnnounceClick() {
    this.props.announce(this.quill.root.innerHTML)
    setTimeout(() => {
      this.props.cancel()
    }, 0)
  }

  render() {
    return (
      <Container>
        <Editor id="editor" />
        <Footer>
          <AnnounceButton onClick={this.handleAnnounceClick.bind(this)} />
          <CancelButton
            onClick={() => {
              this.props.cancel()
            }}
          />
        </Footer>
      </Container>
    )
  }
}

const Container = styled.div`
  width: ${props => maxWidth};
  height: ${props => 20}vh;
  opacity: 0;
  animation: ${props => fadeIn} 0.3s forwards;
`

const Editor = styled.div`
  background-color: white;
`

const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1;}
`

const Footer = styled.div`
  width: 100%;
  height: ${props => 7}vh;
  background-color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`

const AnnounceButton = styled.div`
  width: ${props => 15}vh;
  height: ${props => 5}vh;
  background-color: #18c5ff;
  font-family: pamainbold;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;
  &:after {
    content: 'ANNOUNCE';
  }
`

const CancelButton = styled.span`
  height: ${props => 5}vh;
  font-family: pamainbold;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: ${props => 2}vh;
  margin-right: ${props => 2}vh;
  cursor: pointer;
  &:after {
    content: 'CANCEL';
  }
`
