const dirname = `${__dirname}/..`
const { Op } = require("sequelize")
const { existsSync, writeFile } = require('fs')
const xlsx = require('xlsx')
const datasetConfig = require(`${__dirname}/../config/dataset.json`)
const datasetPath = `${__dirname}/../config/dataset.json`
const model = require('../models/index')
const algorithm = require('../helpers/algorithm.helper')
const { splitData } = require('../utils')
const tf = require('@tensorflow/tfjs')
const scikitjs = require('scikitjs')
scikitjs.setBackend(tf)
const readFileDataset = () => {
    const path = __dirname + '/../public/uploads/' + datasetConfig.fileName
    let data = []
    if(existsSync(path)) {
        const workbook = xlsx.readFile(path)
        const sheet_name_list = workbook.SheetNames
        sheet_name_list.forEach( (y) => {
            const worksheet = workbook.Sheets[y];
            let headers = {};
            for(z in worksheet) {
                if(z[0] === '!') continue;
                
                //parse out the column, row, and value
                let tt = 0;
                for (let i = 0; i < z.length; i++) {
                    if (!isNaN(z[i])) {
                        tt = i;
                        break;
                    }
                };
                const col = z.substring(0,tt);
                const row = parseInt(z.substring(tt));
                const value = worksheet[z].v;
        
                //store header names
                if(row == 1 && value) {
                    headers[col] = value;
                    continue;
                }
        
                if(!data[row]) data[row]={};
                data[row][headers[col]] = value;
            }
            //drop those first two rows which are empty
            data.shift();
            data.shift();
        })
        // console.log(data)
    }
    return data
}
const getUnique = (array) => {
    var uniqueArray = [];
    // Loop through array values
    for(var value of array){
        if(uniqueArray.indexOf(value) === -1){
            uniqueArray.push(value);
        }
    }
    return uniqueArray;
}

module.exports = {
    dashboard: async (req, res) => {
        const now = new Date().toLocaleDateString()
        const user = await model.User.findOne({ where: { uuid: req.session.userid } })
        const users = await model.User.findAndCountAll({
            attributes: ['name', 'email'],
            order: [['id', 'DESC']],
            limit: 3
        })
        const measures = await model.Measurement.findAll({
            attributes: ['date', 'bb', 'tb'],
            order: [['id', 'DESC']],
            limit: 3,
            include: [{
                model: model.Toddler,
                attributes: ['name']
            }]
        })
        const toddlers_count = await model.Toddler.count()
        const puskesmas_count = await model.Puskesmas.count()
        const posyandu_count = await model.Posyandus.count()
        res.render('./pages/dashboard', { user, users, toddlers_count, puskesmas_count, posyandu_count, now, measures })
    },
    dataprocessing: (req, res) => {
        const data = readFileDataset()
        res.render('./pages/dataProcessing', { data })
    },
    performance: async (req, res) => {
        const datasetData = await model.Dataset.findOne({ where: { id: 1 } })
        const dataTrainingRange = datasetData.dataTrainingRange
        res.render('./pages/performance', { dataTrainingRange })
    },
    dataprediction: async (req, res) => {
        const dataset = readFileDataset()
        let select = []
        let selectValue = []
        let selectKey
        let index = 0
        for (let i = 0; i < dataset.length; i++) {
            for (let key in dataset[i]) {
                // console.log(`Data ke ${i}, key = ${key}, value = ${data[i][key]}`)
                selectValue.push(dataset[i][key])
                selectKey = key
                select[index++] = {
                    key: selectKey,
                    value: []
                }
            }
            index = 0
            selectValue = []
            selectKey = null
        }

        const result = select.map(key => {
            return {
                key: key.key,
                value: getUnique(dataset.map(d => d[key.key])),
            }
        })

        const data = await model.DatasetData.findAll()

        const toddlers = await model.Toddler.findAll()

        res.render('./pages/dataPrediction', { result, data, toddlers })
    },
    datapredictiontest: async (req, res) => {
        const dataset = readFileDataset()
        let select = []
        let selectValue = []
        let selectKey
        let index = 0
        for (let i = 0; i < dataset.length; i++) {
            for (let key in dataset[i]) {
                selectValue.push(dataset[i][key])
                selectKey = key
                select[index++] = {
                    key: selectKey,
                    value: []
                }
            }
            index = 0
            selectValue = []
            selectKey = null
        }
        const result = select.map(key => {
            return {
                key: key.key,
                value: getUnique(data.map(d => d[key.key])),
            }
        })

        const data = await model.DatasetData.findAll({
            attributes: ['name', 'berat_badan', 'tinggi_badan', 'usia', 'label', 'akurasi']
        });

        res.render('./pages/dataPredictionTest', { result })
    },
    predicttest: (req, res) => {
        
    },
    importdataset: (req, res) => {
        const data = readFileDataset()
        res.render('./pages/ImportDataset', { data })
    },
    processperformance: async (req, res) => {
        const split = req.body.performanceRange / 100
        const dataset = readFileDataset()
        // dataset.sort(() => Math.random() - 0.5)
        const n = Math.round(dataset.length * split);
        const train = splitData(dataset.slice(0,n));
        const xTrain = train.attributes
        const yTrain = train.labels
        const test = splitData(dataset.slice(n));
        const xTest = test.attributes
        const yTest = test.labels

        let modelNB = new GaussianNB();
        modelNB.train(xTrain, yTrain);

        const __n__ = xTest.length
        let TP = 0
        let TN = 0
        let FP = 0
        let FN = 0
        var predictions = modelNB.predict(xTest);
        for(let i = 0; i < __n__; i++){
            if(predictions[i] == yTest[i]){
                if(yTest[i] == 0){
                    TP += 1
                }else{
                    TN += 1
                }
            }else{
                if(yTest[i] == 0){
                    FP += 1
                }else{
                    FN += 1
                }
            }
        }
        const akurasi = ((TP + TN) / (TP+FP+FN+TN)) * 100

        // save x, y test and model train
        datasetConfig.xTest = xTest
        datasetConfig.yTest = yTest
        datasetConfig.akurasi = akurasi
        datasetConfig.modelTrain = modelNB.toJSON()
        writeFile(datasetPath, JSON.stringify(datasetConfig), (err) => {
            if (err) {
                console.log('An error has occurred ', err)
            }
        })

        // save new performanceRange
        await model.Dataset.update({ dataTrainingRange: req.body.performanceRange }, { where: { id: 1 } })
            .then(() => {
                req.flash('alert', {hex: '#28ab55', color: 'success', status: 'Success'})
                req.flash('message', `Set Data Training Berhasil!`)
            }).catch((err) => {
                console.log(err)
                req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
                req.flash('message', 'Gagal Set Data Training')
            })
            res.redirect('/performance')
    },
    // resultprediction: async (req, res) => {
    //     const data = await model.DatasetData.findAll({
    //         attributes: ['name', 'berat_badan', 'tinggi_badan', 'usia', 'label', 'akurasi']
    //     });
    //     res.render('./pages/resultPrediction', { data })
    // },
    processprediction: async (req, res) => {
        const { name, Berat: BB, Tinggi: TB, Usia: AGE } = req.body
        const { modelTrain, xTest, yTest, akurasi } = datasetConfig
        const modelNB = GaussianNB.load(modelTrain)
        const result = modelNB.predict([[+BB, +TB, +AGE]])[0]
        
        await model.DatasetData.create({ 
            name: name, 
            berat_badan: BB,
            tinggi_badan: TB,
            usia: AGE,
            label: result,
            akurasi: akurasi
        }).then((result) => {
            req.flash('alert', {hex: '#28ab55', color: 'success', status: 'Success'})
            req.flash('message', `Prediksi ${result.name} Berhasil!`)
            res.redirect('/resultprediction')
        }).catch(() => {
            req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
            req.flash('message', 'Prediksi Gagal!')
            res.redirect('/dataprediction')

        })
    },
    training: async (req, res) => {
        const split = req.body.performanceRange / 100
        

        // save new performanceRange
        await model.Dataset.update({ dataTrainingRange: req.body.performanceRange }, { where: { id: 1 } })
            .then(() => {
                req.flash('alert', {hex: '#28ab55', color: 'success', status: 'Success'})
                req.flash('message', `Set Data Training Berhasil!`)
            }).catch((err) => {
                console.log(err)
                req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
                req.flash('message', 'Gagal Set Data Training')
            })
        res.redirect('/performance')
    },
    predict: async (req, res) => {
        const { uuid, Berat, Tinggi, Usia } = req.body

        const { id, jk, name } = await model.Toddler.findOne({ where: { uuid: uuid } })
        let fileDataset = readFileDataset()

        // add row to dataset
        const allMeasure = await model.Measurement.findAll({
            attributes: ['bb', 'tb', 'current_age', 'predict_result'],
            include: [{
                model: model.Toddler,
                attributes: ['jk'],
            }]
        })
        for (const i of allMeasure) {
            let jk2
            if (i.Toddler.jk == 'L') {
                jk2 = 1
            } else {
                jk2 = 0
            }
            fileDataset.push({
                Usia: i.current_age,
                Berat: i.bb,
                Tinggi: i.tb,
                JK: jk2,
                Label: i.predict_result
            })
        }
        const { predict_result, predict_accuracy, predict_proba_x, predict_proba_y } = await algorithm.prediction(+Berat, +Tinggi, +Usia, jk == 'L' ? 1 : 0, splitData(fileDataset))

        await model.DatasetData.create({
            name: name,
            berat_badan: Berat,
            tinggi_badan: Tinggi,
            usia: Usia,
            label: predict_result,
            akurasi: predict_accuracy,
            proba: `[${predict_proba_x, predict_proba_y}]`
        }).then((result) => {
            req.flash('alert', {heproba: '#28ab55', color: 'success', status: 'Success'})
            req.flash('message', `Prediksi ${result.name} Berhasil!`)
        }).catch((err) => {
            console.log(err)
            req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
            req.flash('message', 'Prediksi Gagal!')
        })
        res.redirect('/dataprediction')
    },
    growth: async (req, res) => {
        const data = await model.Toddler.findAll({
            include: [
                { model: model.Puskesmas },
                { model: model.Posyandus }
            ]
        })
        res.render('./pages/growth', { data })
    },
    growthDetail: async (req, res) => {
        const uuid = req.params.uuid
        const { name } = await model.Toddler.findOne({
            where: { uuid }
        })
        res.render('./pages/growthDetail', { name, uuid })
    },
    measurement: async (req, res) => {
        const date = new Date().toLocaleDateString('id', { day: '2-digit', month: '2-digit', year: 'numeric'}).split('/')
        const month = date[1]
        const year = date[2]
        let decades = []
        for (let i = 2015; i < 2030; i++) {
            decades.push(i+1)
        }
        const data = await model.Measurement.findAll({
            attributes: ['uuid' ,'date', 'current_age', 'bb', 'tb', 'bbu', 'zbbu', 'tbu', 'ztbu', 'bbtb', 'zbbtb']
        })
        const toddlers = await model.Toddler.findAll({
            attributes: ['uuid' ,'name', 'jk']
        })
        const startYear = new Date(`01/01/${year}`)
        const endYear = new Date(`01/01/${+year + 1}`)
        const startMonth = new Date(`${month}/01/${year}`)
        const endMonth = new Date(new Date().setDate(startMonth.getDate() + 29));
        let measureReports = await model.Toddler.findAll({
            // attributes: ['nik', 'name', 'jk', 'birth'],
            include: [
                {
                    model: model.Measurement,
                    attributes: ['bb', 'tb', 'date', 'lila', 'lika', 'bbu', 'tbu', 'bbtb'],
                    where: {
                        date: {
                            [Op.between]: [startYear, endYear]
                        }
                    }
                },
                {
                    model: model.Parent
                }
            ]
        })
        if(measureReports.length > 0) {
            measureReports = JSON.parse(JSON.stringify(measureReports))
            for (let i = 0; i < measureReports.length; i++) {
                const e = measureReports[i].Measurements
                for (let j = 0; j < 12; j++) {
                    if(!e[j]) {
                        e.push({bb: '-', tb: '-', lila: '-', lika: '-', bbu: '-', tbu: '-', bbtb: '-', date: null})
                    }
                }
                for (let j = 0; j < e.length; j++) {
                    if(e[j].date != null) {
                        const newIndex = +e[j].date.split('-')[1] - 1
                        if(j != newIndex) {
                            e[newIndex] = e[j]
                            e[j] = {bb: '-', tb: '-', lila: '-', lika: '-', bbu: '-', tbu: '-', bbtb: '-', date: null}
                        }
                    }
                }
            }
        }
        let accumulationReports = await model.Measurement.findAll({
            attributes: ['date', 'bb', 'tb', 'current_age', 'bbu', 'tbu', 'bbtb', 'lila', 'lika'],
            where: {
                date: {
                    [Op.between]: [startMonth, endMonth]
                }
            },
            include: [{
                model: model.Toddler,
                attributes: ['name'],
            }]
        })
        res.render('./pages/measurement', { data, toddlers, month, year, decades, measureReports, accumulationReports })
    },
    measurementDetail: async (req, res) => {
        const uuid = req.params.uuid
        const data = await model.Measurement.findOne({
            where: { uuid },
            include: model.Toddler
        })
        res.render('./pages/measurementDetail', { data })
    },
    measurementEditPage: async (req, res) => {
        const uuid = req.params.uuid
        const data = await model.Measurement.findOne({
            where: { uuid },
            include: model.Toddler
        })
        res.render('./pages/measurementEdit', { data })
    },
    measurementEdit: async (req, res) => {
        const uuid = req.params.uuid
        const { uuid_toddler, date, age, bb, tb, method, vitamin, lila, lika } = req.body
        const { jk } = await model.Toddler.findOne({ where: { uuid: uuid_toddler } })
        if ((age < 24 && method === 'berdiri') || (age > 24 && method === 'telentang')) {
            req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
            req.flash('message', 'Terjadi kesalahan dalam pengukuran!')
            return res.redirect(`${baseUrl}/measurement/edit/${uuid}`)
        }
        const bbu = getZscore('BBU', +age, +bb, +tb, method, jk)
        const tbu = getZscore('TBU', +age, +bb, +tb, method, jk)
        const bbtb = getZscore('BBTB', +age, +bb, +tb, method, jk)
        const { predict_result, predict_accuracy, predict_proba_x, predict_proba_y } = await algorithm.prediction(+bb, +tb, +age, jk == 'L' ? 1 : 0, splitData(readFileDataset()))
        await model.Measurement.update({
            date, bb, tb,
            bbu: bbu.status,
            tbu: tbu.status,
            bbtb: bbtb.status,
            zbbu: bbu.zs,
            ztbu: tbu.zs,
            zbbtb: bbtb.zs,
            rekombbu: bbu.rekom,
            rekomtbu: tbu.rekom,
            rekombbtb: bbtb.rekom,
            method, vitamin, lila, lika,
            current_age: age,
            predict_result,
            predict_accuracy,
            predict_proba_x,
            predict_proba_y 
        }, { where: { uuid: uuid }
        }).then(() => {
            req.flash('alert', {hex: '#28ab55', color: 'success', status: 'Success'})
            req.flash('message', 'Data berhasil diedit!')
        }).catch((err) => {
            console.log(err)
            req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
            req.flash('message', 'Gagal mengedit data!')
        })
        res.redirect(`${baseUrl}/measurement/edit/${uuid}`)
    },
    storeMeasurement: async (req, res) => {
        const { uuid, date, age, bb, tb, method, vitamin, lila, lika } = req.body
        const { id, jk, birth } = await model.Toddler.findOne({ where: { uuid: uuid } })

        const newAge = (algorithm.differenceInMonths(new Date(date), new Date(birth)))
        if(newAge < 0 || newAge > 60) {
            req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
            req.flash('message', 'Umur tidak sesuai!')
            return res.redirect(`${baseUrl}/measurement`)
        }

        let fileDataset = readFileDataset()

        // add row to dataset
        const allMeasure = await model.Measurement.findAll({
            attributes: ['bb', 'tb', 'current_age', 'predict_result'],
            include: [{
                model: model.Toddler,
                attributes: ['jk'],
            }]
        })
        for (const i of allMeasure) {
            let jk2
            if (i.Toddler.jk == 'L') {
                jk2 = 1
            } else {
                jk2 = 0
            }
            fileDataset.push({
                Usia: i.current_age,
                Berat: i.bb,
                Tinggi: i.tb,
                JK: jk2,
                Label: i.predict_result
            })
        }
        const measure = await model.Measurement.findOne({ 
            where: { ToddlerId: id, current_age: newAge } 
        })
        if(measure) {
            req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
            req.flash('message', `Pengukuran pada bulan ke-${newAge} telah dilakukan!`)
            return res.redirect(`${baseUrl}/measurement`)
        }
        const bbu = algorithm.getZscore('BBU', +newAge, +bb, +tb, jk)
        const tbu = algorithm.getZscore('TBU', +newAge, +bb, +tb, jk)
        const bbtb = algorithm.getZscore('BBTB', +newAge, +bb, +tb, jk)
        const { predict_result, predict_accuracy, predict_proba_x, predict_proba_y } = await algorithm.prediction(+bb, +tb, +newAge, jk == 'L' ? 1 : 0, splitData(fileDataset))
        await model.Measurement.create({
            date, bb, tb,
            bbu: bbu.status,
            tbu: tbu.status,
            bbtb: bbtb.status,
            zbbu: bbu.zs,
            ztbu: tbu.zs,
            zbbtb: bbtb.zs,
            rekombbu: bbu.rekom,
            rekomtbu: tbu.rekom,
            rekombbtb: bbtb.rekom,
            vitamin, lila, lika,
            current_age: newAge,
            ToddlerId: id,
            predict_result,
            predict_accuracy,
            predict_proba_x,
            predict_proba_y
        }).then(() => {
            req.flash('alert', {hex: '#28ab55', color: 'success', status: 'Success'})
            req.flash('message', 'Data berhasil ditambahkan!')
        }).catch((err) => {
            console.log(err)
            req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
            req.flash('message', 'Gagal menambahkan data!')
        })
        res.redirect(`${baseUrl}/measurement`)
    }
}