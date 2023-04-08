const model = require("../models/index");
const bcrypt = require('bcryptjs')

module.exports = {
  page: async (req, res) => {
    try {
      const {role, puskesmaId, posyanduId, userid} = req.session
      let instansi
      if (role != 'admin') {
        let instansiModel, pk
        if (role == 'admin_puskesmas') {
          instansiModel = 'Puskesmas'
          pk = puskesmaId
        }
        if (role == 'admin_posyandu') {
          instansiModel = 'Posyandus'
          pk = posyanduId
        }
        instansi = await model[instansiModel].findByPk(pk)
      }
      const user = await model.User.findOne({ where: { uuid: userid }})
      const posyandu = await model.Posyandus.findAll({ 
        where: { puskesmaId },
        include: [{
          model: model.User,
        }]
      })
      res.render("./pages/profile", { instansi, user, posyandu });
    } catch (error) {
      console.log(error)
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Terjadi Kesalahan",
      })
      res.redirect("/profile");
    }
  },
  storePosyandu: async (req, res) => {
    try {
      let { nama, puskesmaId, alamat, nama_admin, email_admin, password_admin } = req.body
      if (!password_admin) {
        password_admin = '12345678'
      }
      // cek email
      const userData = await model.User.findOne({ where: { email: email_admin } })
      if(userData) {
        throw new Error('Email ini tidak bisa digunakan')
      }
      bcrypt.hash(password_admin, 10, async (err, hash) => {
        if (err) {
          throw new Error(err)
        }
        const storedPosyandu = await model.Posyandus.create({
          nama,
          alamat,
          puskesmaId
        })
        await model.User.create({
          name: nama_admin,
          email: email_admin,
          password: hash,
          role: 'admin_posyandu',
          posyanduId: storedPosyandu.id
        })
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", `Posyandu Berhasil Ditambahkan`);
        res.redirect("/profile");
      })
    } catch (error) {
      console.log(error)
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Failed",
      })
      req.flash("message", error.message);
      res.redirect("/profile");
    }
  }
}
