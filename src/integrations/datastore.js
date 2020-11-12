const { Datastore } = require('@google-cloud/datastore');

let datastoreInstance;

const auditKeyPath = 'Audit122';
const reportKeyPath = 'Report122';
// const auditKeyPath = `Audit${new Date().toJSON().substr(0, 16)}`; // @TODO: changeme
// const reportKeyPath = `Report${new Date().toJSON().substr(0, 16)}`; // @TODO: changeme

const getDatastore = () => {
    if (!datastoreInstance) {
        datastoreInstance = new Datastore({ apiEndpoint: 'localhost:8081' });
    }
    return datastoreInstance;
};

const get = async (key) => {
    const datastore = getDatastore();
    const entities = await datastore.get(key);
    return entities.length ? entities[0] : null;
};

const set = async (key, data) => {
    const datastore = getDatastore();
    await datastore.save({
        method: 'upsert',
        excludeLargeProperties: true,
        key,
        data,
    });
    return key;
};

const getKey = (keyPath, id) => getDatastore().key([keyPath, id]);

const getAuditDoc = async (id) => get(getKey(auditKeyPath, id));

const setAuditDoc = async (id, data) => set(getKey(auditKeyPath, id), data);

const getReportDoc = async (id) => get(getKey(reportKeyPath, id));

const setReportDoc = async (id, data) => set(getKey(reportKeyPath, id), data);

module.exports = {
    getAuditDoc,
    setAuditDoc,
    getReportDoc,
    setReportDoc,
};
