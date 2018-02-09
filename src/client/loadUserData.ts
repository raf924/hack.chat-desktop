let userData;
import * as cordovaUserData from './userData/cordova';
import * as electronUserData from './userData/electron';

if (window.NativeStorage) {
    userData = cordovaUserData.default;
} else {
    userData = electronUserData.default;
}

export default userData;
