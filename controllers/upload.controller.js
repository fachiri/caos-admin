const fs = require('fs')
const datasetPath = `${__dirname}/../config/dataset.json`
const datasetConfig = require(datasetPath)
const xlsx = require('xlsx')

const readFileDataset = (fileName) => {
    const path = __dirname + '/../public/uploads/' + fileName
    let data = []
    if(fs.existsSync(path)) {
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

module.exports = {
    dataset: async (req, res) => {
        const dataset = req.files.dataset
        // const oldpath = dataset.path
        const newFileName = `${new Date().getTime()}_${dataset.name}`
        const newpath = `${__dirname}/../public/uploads/${newFileName}`
        await dataset.mv(newpath, (err) => {
            if (err) {
                console.log(err)
                req.flash('alert', {hex: '#f3616d', color: 'danger', status: 'Failed'})
                req.flash('message', 'Upload Gagal')
                return res.redirect('/importdataset')
            }
            const jsonDataset = JSON.stringify(readFileDataset(newFileName))
            // create json file
            fs.writeFile(`${__dirname}/../db/dataset.json`, jsonDataset, 'utf8', (err) => {
                if (err) {
                    console.log('Gagal Upload JSON Dataset ', err)
                }
            });
        })
        datasetConfig.fileName = newFileName
        fs.writeFile(datasetPath, JSON.stringify(datasetConfig), (err) => {
            if (err) {
                console.log('An error has occurred ', err)
            }
        })
        req.flash('alert', {hex: '#28ab55', color: 'success', status: 'Success'})
        req.flash('message', 'Upload Berhasil')
        return res.redirect('/importdataset')
    }
}

