import { DOWNLOAD } from 'libs/common/constants/api_http';

export default store => next => action => {
    if (action.type != DOWNLOAD) {
        return next(action)
    }

    let { url } = action

    if (typeof url !== 'string') {
        throw new Error('Specify a string url.')
    }

    var ifr = document.getElementById('ifr_for_download')
    if (ifr) {
        document.body.removeChild(ifr)
    }

    ifr = document.createElement('iframe')
    ifr.id = 'ifr_for_download'
    ifr.style.display = 'none'
    document.body.appendChild(ifr)

    ifr.setAttribute('src', 'about:blank');

    setTimeout(() => {
        ifr.setAttribute('src', url);
    }, 0);
}