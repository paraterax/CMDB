import React, { Component, PropTypes } from 'react'
import tplRender from './index.jsx'

/*
 * 分页组件
 * @props {number} pageIndex 当前页码数, 从1开始计数
 * @props {number} maxPageNum 总计页码数
 * @props {number} pageSize 每页显示页码数的个数, 当总页码数过大时使用
 * @example
    <Pager pageIndex={1} maxPageNum={9} pageSize={7} />
 */
class Pager extends Component {
    constructor(props) {
        super(props)

        this.state = {
            inputPageIndex: props.pageIndex,
            pageIndex: props.pageIndex
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.pageIndex != this.props.pageIndex) {
            this.setState({
                pageIndex: nextProps.pageIndex
            })
        }
    }

    render() {
        return tplRender.call(this)
    }

    pageIndexClickHandle(pageIndex) {
        const { pageIndexOnChange } = this.props
        this.setState({ pageIndex })
        pageIndexOnChange && pageIndexOnChange(pageIndex || 1)
    }

    pageIndexInputChangeHandle(e) {
        let val = e.target.value
        this.setState({ inputPageIndex: val })
    }

    pageIndexInputKeyDownHandle(e) {
        if ((e.keyCode < 48 || e.keyCode > 57) && e.keyCode != 8 && e.keyCode != 46) {
            e.preventDefault();
        }
    }

    btnGotoPageClickHandle() {
        const { maxPageNum, pageIndexOnChange } = this.props
        var { inputPageIndex } = this.state
        inputPageIndex = parseInt(inputPageIndex) || 1
        if (inputPageIndex > maxPageNum) {
            inputPageIndex = maxPageNum;
        }
        this.setState({
            pageIndex: inputPageIndex,
            inputPageIndex
        });
        pageIndexOnChange && pageIndexOnChange(inputPageIndex)
    }
}

Pager.defaultProps = {
    className: '',
    pageIndex: 1,
    pageSize: 7,
    maxPageNum: 0
}

Pager.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    maxPageNum: PropTypes.number,
    pageIndexOnChange: PropTypes.func
}

export default Pager