const dirname = `${__dirname}/../..`;
const { existsSync, writeFile } = require("fs");
const xlsx = require("xlsx");
const datasetConfig = require(`${__dirname}/../../config/dataset.json`);
const datasetPath = `${__dirname}/../config/dataset.json`;
const model = require("../../models/index");
const algorithm = require("../../helpers/algorithm.helper");
const { splitData } = require("../../utils");
const tf = require("@tensorflow/tfjs");
const scikitjs = require("scikitjs");
scikitjs.setBackend(tf);
const anthropometricTable = require(`${dirname}/public/assets/standar-antropometri.json`);
const readFileDataset = () => {
  const path = __dirname + "/../../public/uploads/" + datasetConfig.fileName;
  let data = [];
  if (existsSync(path)) {
    const workbook = xlsx.readFile(path);
    const sheet_name_list = workbook.SheetNames;
    sheet_name_list.forEach((y) => {
      const worksheet = workbook.Sheets[y];
      let headers = {};
      for (z in worksheet) {
        if (z[0] === "!") continue;

        //parse out the column, row, and value
        let tt = 0;
        for (let i = 0; i < z.length; i++) {
          if (!isNaN(z[i])) {
            tt = i;
            break;
          }
        }
        const col = z.substring(0, tt);
        const row = parseInt(z.substring(tt));
        const value = worksheet[z].v;

        //store header names
        if (row == 1 && value) {
          headers[col] = value;
          continue;
        }

        if (!data[row]) data[row] = {};
        data[row][headers[col]] = value;
      }
      //drop those first two rows which are empty
      data.shift();
      data.shift();
    });
    // console.log(data)
  }
  return data;
};
module.exports = {
  getAllMeasurements: async (req, res) => {
    await model.Measurement.findAll({
      attributes: [`id`, `uuid`, `date`, `bb`, `tb`, `bbu`, `zbbu`, `rekombbu`, `tbu`, `ztbu`, `rekomtbu`, `bbtb`, `zbbtb`, `rekombbtb`, `lila`, `lika`, `predict_proba_x`, `predict_proba_y`, `predict_result`, `predict_accuracy`, `method`, `vitamin`, `current_age`, `editable`, `ToddlerId`, `createdAt`, `updatedAt`],
      include: { 
        model: model.Toddler, 
        attributes: ["uuid", "name"]
      },
    })
      .then((result) => {
        res.status(200).json({
          status: "Success",
          message: "Fetch data berhasil",
          data: result,
        });
      })
      .catch((err) => {
        res.status(400).json({
          status: "Failed",
          message: err.message,
        });
      });
  },
  getDetailMeasurements: async (req, res) => {
    const data = await model.Measurement.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (!data)
      return res.status(404).json({
        status: "Failed",
        message: "Data tidak ditemukan",
      });
    await model.Measurement.findOne({
      include: { model: model.Toddler, attributes: ["uuid", "name"] },
      where: {
        uuid: req.params.uuid,
      },
    })
      .then((result) => {
        res.status(200).json({
          status: "Success",
          message: "Fetch data berhasil",
          data: result,
        });
      })
      .catch((err) => {
        res.status(400).json({
          status: "Failed",
          message: err.message,
        });
      });
  },
  storeMeasurement: async (req, res) => {
    try {
      const { uuid, date, age, bb, tb, method, vitamin, lila, lika } = req.body
      const { id, jk, birth } = await model.Toddler.findOne({ where: { uuid: uuid } })

      const newAge = (algorithm.differenceInMonths(new Date(date), new Date(birth)))
      if(newAge < 0 || newAge > 60) {
        return res.status(400).json({
          status: "Failed",
          message: `Umur tidak sesuai! (Umur: ${newAge} bulan)`
        })
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
        return res.status(400).json({
          status: "Failed",
          message: `Pengukuran pada bulan ke-${newAge} telah dilakukan!`
        });
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
      })
      res.status(201).json({
        status: "Success",
        message: "Data Berhasil Ditambahkan",
      });
    } catch (error) {
      console.log(error);
        res.status(500).json({
          status: "Failed",
          message: error.message,
      });
    }
        
  },
  calculator: async (req, res) => {
    try {
      const { age, bb, tb, jk } = req.query

      const bbu = algorithm.getZscore("BBU", +age, +bb, +tb, jk);
      const tbu = algorithm.getZscore("TBU", +age, +bb, +tb, jk);
      const bbtb = algorithm.getZscore("BBTB", +age, +bb, +tb, jk);

      if(bbu.status == false) {
        return res.status(bbu.code).json({
          status: "Failed",
          error: bbu.message
        })
      }

      res.status(200).json({
        status: "Success",
        data: {
          bbu, tbu, bbtb
        },
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "Failed",
        error
      });
    }
  }
}
