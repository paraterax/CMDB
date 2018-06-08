import React from 'react';
import classNames from 'classnames';
import { Menu, Breadcrumb, Icon } from 'antd';
export default function render() {
    return (
        <div className="appWrap">
            <div style={{"height":"100%"}}> 
                    {this.props.children}
            </div>
        </div>
    )
}