/**
 * @typedef {Object} ResponsiveBreakpointOverride
 * @property {number} level
 * @property {string} name
 * @property {number} width
 */

/**
 * returns matching size class
 * @param {Number} px
 * @param columns
 */
const getLayoutClassByWidth = (px, columns) => {
    const config = getDefaultLayoutClasses(columns);

    //Tine.log.debug('== getLayoutClassByWidth px: ' + px);
    //Tine.log.debug('== config:');
    //Tine.log.debug(config);

    let result = config[config.length - 1];
    config.some((config) => {
        if (px <= config.width) {
            result = config;
            return true;
        }
    })
    //Tine.log.debug('== result:');
    //Tine.log.debug(result);
    return result;
}

const getLayoutClassByMode = (mode, columns) => {
    const config = getDefaultLayoutClasses(columns);

    //Tine.log.debug('== getLayoutClassByMode mode: ' + mode);
    //Tine.log.debug('== config:');
    //Tine.log.debug(config);

    let result = config[config.length - 1];
    config.some((config) => {
        if (mode === config.name) {
            result = config;
            return true;
        }
    })
    //Tine.log.debug('== result:');
    //Tine.log.debug(result);
    return result;
}

const getLayoutClass = (pxOrMode, overrides) => {
    const defaultConfigs = [
        {level: 0, name: 'oneColumn', width: 400},
        {level: 1, name: 'multiColumn', width: 500},
        {level: 2, name: 'small', width: 600},
        {level: 3, name: 'medium', width: 1000},
        {level: 4, name: 'big', width: 1800},
        {level: 5, name: 'large', width: Infinity},
    ];
    let confs;
    const findByLevel = (level) => confs.findIndex(conf => conf.level === level)
    const findByName = (name) => confs.findIndex(conf => conf.name === name)
    if (overrides) {
        confs = defaultConfigs

        /*
        IDEA:
        - byName: same name different width
        - byLevel: additional levels in between the defaults
        - overrides: js array of objects or just object
        - assertions on overrides
         */

        const _overrides = Array.isArray(overrides) ? overrides : [overrides]
        _overrides.forEach(override => {
            if (override.name && !override.level) {
                const idx = findByName(override.name)
                if (idx < 0) confs.push(override)
                else confs[idx].width = override.width
            } else if (override.level) {
                const idx = findByLevel(override.level)
                if (idx < 0) confs.push(override)
                else confs[idx].width = override.width
            } else {
                confs.push(override)
            }
        })

        confs.sort((a, b) => a.width - b.width)
        // for(let i = 0; i < confs.length; i++) {
        //     confs[i].level = i
        //     confs[i] = Object.freeze(confs[i])
        // }
        confs.forEach((conf, idx) => {
            conf.level = idx
            Object.freeze(conf)
        })
    } else {
        confs = defaultConfigs
    }
    if (typeof pxOrMode === "string") return findByName(pxOrMode)
    if (typeof pxOrMode === "number") return confs.filter(config => pxOrMode <= config.width)[0]
}

const getDefaultLayoutClasses = (columns = []) => {
    const defaultConfigs = [
        {level: 0, name: 'oneColumn', width: 400},
        {level: 1, name: 'multiColumn', width: 500},
        {level: 2, name: 'small', width: 600},
        {level: 3, name: 'medium', width: 1000},
        {level: 4, name: 'big', width: 1800},
        {level: 5, name: 'large', width: Infinity},
    ];
    const supportLevels = ['oneColumn', 'big'].concat([...new Set(columns.map((col) => col?.responsiveLevel).filter(Boolean))]);
    return defaultConfigs.filter(config => supportLevels.includes(config.name));
}

export {
    getLayoutClassByWidth,
    getLayoutClassByMode,
    getLayoutClass
}
