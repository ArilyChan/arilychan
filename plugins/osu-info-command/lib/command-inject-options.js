"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function injectOsuOptions(command, options) {
    options.forEach(option => {
        let _option, _optionConfig;
        if (typeof option === 'string') {
            _option = option;
        }
        else if (Array.isArray(_option)) {
            _option = option[0];
        }
        else
            throw new Error(`Invalid option type: ${typeof _option}`);
        switch (_option) {
            case 'mode':
                command.option('mode', '-m <mode>', _optionConfig);
                break;
            case 'server':
                command.option('server', '-s <server>', _optionConfig);
                break;
            case 'from':
                command.option('from', '<time>', _optionConfig);
        }
    });
    return command;
}
exports.default = injectOsuOptions;
