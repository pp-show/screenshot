import localforage from 'localforage';

export const initDb = () => {
    const store = localforage.createInstance({
        name: "screenshotDb",
        driver: localforage.INDEXEDDB,
    })

    return store;
    // localforage.config({
    //     name: 'screenshotDb',
    //     driver: localforage.INDEXEDDB,
    // });
}


export const addData = (store, value) => {
    store.setItem('screenshotList', value);
}


export const getData = async (store) => {
    return new Promise((res, rej) => {
        store.getItem('screenshotList').then(function (value) {
            console.log(value, 'valuevaluevalue')
            res(value || [])
        }).catch(function (err) {
            res([])
        });
    })

    // return await store.getItem('screenshotList') || [];
}
