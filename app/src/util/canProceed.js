/**
 * Internal Dependencies.
 */
const { dateTime } = require('./time');
const { getStatusDoc, setStatusDoc } = require('../integrations/datastore');

const MAX_DURATION = 300; // Max audit duration in seconds.
const MAX_RETRIES = 2; // Max number of times we can attempt to redo the same audit

/**
 * A gatekeeper for whether or not we can proceed with an audit
 *
 * @param {string} type Audit type being performed (e.g. lighthouse)
 * @param {object} item The audit params.
 * @returns {boolean} True if we can proceed or throws error if we cannot.
 */
const canProceed = async (type, item) => {
    if (!type) {
        throw new Error('type param missing');
    }
    if (!item || !item.slug) {
        throw new Error('item.slug param missing');
    }
    if (!item || !item.version) {
        throw new Error('item.version param missing');
    }
    const timeNow = dateTime();
    const { slug, version } = item;
    const key = `${type}-${slug}-${version}`;
    const statusDoc = await getStatusDoc(key);

    if (!statusDoc) {
        const newStatusDoc = {
            startTime: timeNow,
            retries: 0,
        };
        await setStatusDoc(key, newStatusDoc);
        return true;
    }

    const minTime = timeNow - MAX_DURATION;

    if (statusDoc.startTime < minTime) {
        statusDoc.retries += 1;
        statusDoc.startTime = timeNow;
        if (statusDoc.retries <= MAX_RETRIES) {
            console.debug(`running too long incrementing retries ${JSON.stringify(statusDoc)}`);
        }
    } else {
        throw new Error(`audit still in progress ${JSON.stringify(statusDoc)}`);
    }

    if (statusDoc.retries > MAX_RETRIES) {
        console.error(`too many retries not proceeding ${JSON.stringify(statusDoc)}`);
        return false;
    }

    console.debug(`setting status doc ${JSON.stringify(statusDoc)}`);
    await setStatusDoc(key, statusDoc);
    return true;
};

module.exports = {
    canProceed,
};