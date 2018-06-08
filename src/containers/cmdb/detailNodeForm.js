import React from 'react'

import tplRender from './jsx/detailNodeForm.jsx'

export default function nodeForm(type, options = {}){
    
    return tplRender.call(this, type, options)
}