/**
 * 右键菜单组件模块
 */
'use strict';

import React, {Component, PropTypes} from 'react';
import { findDOMNode } from 'react-dom';

import styles from './index.less';

var singleInstance;
var emptyFn = function() {};

/**
 * 右键菜单组件类，单例类
 * @props {string} className 额外的样式
 * @props {array} data 右键菜单数据
 */
class Contextmenu extends Component {
    constructor(props) {
        super(props);

        if (singleInstance) {
            return singleInstance;
        }

        this.state = {
            x: 0,
            y: 0,
            show: false
        };

        singleInstance = this;
        this.rootClickHandle = this.rootClickHandle.bind(this);
        this.globalKeydownHandle = this.globalKeydownHandle.bind(this);
    }

    componentDidMount() {
        document.addEventListener('click', this.rootClickHandle, true);
        document.addEventListener('contextmenu', this.rootClickHandle, true);
        document.addEventListener('keydown', this.globalKeydownHandle, true);
        document.body.appendChild(findDOMNode(this));
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.rootClickHandle);
        document.removeEventListener('contextmenu', this.rootClickHandle);
        document.removeEventListener('keydown', this.globalKeydownHandle);
        var dom = findDOMNode(this);
        if (dom.parentNode) {
            dom.parentNode.removeChild(dom);
        }
    }

    render() {
        const { className } = this.props;
        const { x, y, show } = this.state;
        const data = this.state.data || this.props.data;
        return (
            <ul className={styles.rootCls + ' ' + className} style={ show ? { top: y, left: x, display: 'block' } : null}
                onClick={this.rootClickHandle}>
                {data.map(this.renderMenuItem.bind(this))}
            </ul>
        )
    }

    renderMenuItem(item, i) {
        switch (item.type) {
            case 'divider':
            case 'separator':
                return <li key={i} className="divider"></li>
            default:
                return <li key={i} className={item.disabled ? 'disabled' : ''}
                    onClick={item.disabled ? emptyFn : item.click||emptyFn}>
                    <a href="javascript:;"><i className={item.iconCls} />{item.label}</a></li>
        }
    }

    rootClickHandle() {
        if (this.state.show) {
            this.setState({ show: false });
        }
    }

    globalKeydownHandle(e) {
        if (e.keyCode == 27) {
            if (this.state.show) {
                this.setState({ show: false });
            }
        }
    }

    createMenu(data) {
        this.setState({ data: data });
        return this;
    }

    /**
     * 弹出右键菜单，
     */
    popup(x, y) {
        this.setState({
            show: true,
            x,
            y
        });
    }
}

Contextmenu.defaultProps = {
    className: '',
    data: []
};

Contextmenu.propTypes = {
    className: PropTypes.string,
    data: PropTypes.array,
};

export default Contextmenu