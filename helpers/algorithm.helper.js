const dirname = `${__dirname}/..`
const tf = require('@tensorflow/tfjs')
const scikitjs = require('scikitjs')
scikitjs.setBackend(tf)
const anthropometricTable = require(`${dirname}/public/assets/standar-antropometri.json`)

const getCategoty = (type, quotient) => {
    let status
    switch (type) {
        case 'BBU':
            if (quotient < -3) {
                status = 'Berat Badan Sangat Kurang (severely underweight)'
            } else if (quotient <= -2) {
                status = 'Berat badan kurang (underweight)'
            } else if (quotient <= 1) {
                status = 'Berat badan normal'
            } else {
                status = 'Risiko Berat badan lebih'
            }
            break;
        case 'TBU':
        case 'PBU':
            if (quotient < -3) {
                status = 'Sangat pendek (severely stunted)'
            } else if (quotient <= -2) {
                status = 'Pendek (stunted)'
            } else if (quotient <= 3) {
                status = 'Normal'
            } else {
                status = 'Tinggi'
            }
            break;
        case 'BBPB':
        case 'BBTB':
            if (quotient < -3) {
                status = 'Gizi buruk (severely wasted)'
            } else if (quotient <= -2) {
                status = 'Gizi kurang (wasted)'
            } else if (quotient <= 1) {
                status = 'Gizi baik (normal)'
            } else if (quotient <= 2) {
                status = 'Berisiko gizi lebih (possible risk of overweight)'
            } else if (quotient <= 3) {
                status = 'Gizi lebih (overweight)'
            } else {
                status = 'Obesitas (obese)'
            }
            break
    
        default:
            break;
    }
    return status
}

module.exports = {
    prediction: async (bb, tb, age, jk, dataset) => {
        const lr = new scikitjs.DecisionTreeClassifier()
        const split = 0.3
        let [xTrain, xTest, yTrain, yTest] = scikitjs.trainTestSplit(dataset.attributes, dataset.labels, split)
        
        lr.fit(xTrain, yTrain)
        const result = lr.predict([[age, bb, tb, jk]])
        const accuracy = lr.score(xTest, yTest)
        const proba = lr.predictProba([[age, bb, tb, jk]])

        const predict_result = result[0]
        const predict_accuracy = accuracy
        const predict_proba_x = proba[0][0]
        const predict_proba_y = proba[0][1]

        return { predict_result, predict_accuracy, predict_proba_x, predict_proba_y }
    },
    getZscore: (type, age, bb, tb, jk) => {
        let obj, x, dividend, divisor, quotient, result, rangeAge
        
        switch (type) {
            case 'BBU':
                rangeAge = '0-60'
                x = bb
                y = age
                jsonKey = 'Umur'
                break;
            case 'TBU':
                x = tb
                y = age
                jsonKey = 'Umur'
                if (age <= 24) {
                    type = 'PBU'
                    rangeAge = '0-24'
                } else {
                    rangeAge = '24-60'
                }
                break;
            case 'BBTB':
                x = bb
                y = tb
                if (age < 24 && (tb > 45.0 && tb < 110.0)) {
                    type = 'BBPB'
                    jsonKey = 'Panjang Badan'
                    rangeAge = '0-24'
                } else {
                    jsonKey = 'Tinggi Badan'
                    rangeAge = '24-60'
                }
                break;
            default:
                return false
        }
    
        const key = `${type}.${jk}.${rangeAge}`
        obj = anthropometricTable[key].find(e => e[jsonKey] == y)
        dividend = x - obj.Median
        
        if (x < obj.Median) {
            divisor = obj.Median - obj['-1sd']
        } else {
            divisor = obj['+1sd'] - obj.Median
        }
    
        quotient = dividend / divisor
        result = getCategoty(type, quotient)
    
        return { zs: quotient, status: result, rekom: obj.Median }
    },
    differenceInMonths: (date1, date2) => {
        const monthDiff = date1.getMonth() - date2.getMonth();
        const yearDiff = date1.getYear() - date2.getYear();
        return monthDiff + yearDiff * 12;
    }
}