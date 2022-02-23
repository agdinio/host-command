import React, { PureComponent } from 'react'

export default class AsyncComponent extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      resolvedError: false,
      resolvedSuccess: false,
      data: '',
      error: '',
    }
    this.renderChildren = this.renderChildren.bind(this)
  }

  componentDidMount() {
    this.props
      .promise()
      .then(data => this.setState({ resolvedSuccess: true, data }))
      .catch(error => this.setState({ resolvedError: true, error }))
  }

  renderChildren() {
    return React.Children.map(this.props.children, child =>
      React.cloneElement(child, {
        data: this.state.data,
      })
    )
  }

  render() {
    if (this.state.resolvedError) {
      return <h1>Error Encountered</h1>
    } else if (this.state.resolvedSuccess) {
      return <div>{this.renderChildren()}</div>
    } else {
      return <h1>Loading...</h1>
    }
  }
}
