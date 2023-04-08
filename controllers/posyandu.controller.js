const model = require("../models/index");

module.exports = {
  getPosyandu: async (req, res) => {
    const data = await model.Posyandus.findAll({
      attributes: ["id", "uuid", "nama", "alamat"],
      include: [{
        model: model.User,
        attributes: ['name']
      }]
    });
    const puskesmas = await model.Puskesmas.findAll({
      attributes: ["uuid", "nama"],
    });
    const users = await model.User.findAll({
      attributes: ["id", "name", "posyanduId"],
      where: {
        role: "admin_posyandu"
      },
      include: [{
        model: model.Posyandus,
        attributes: ['nama']
      }]
    })
    res.render("./pages/posyandu", { data, puskesmas, users });
  },
  storePosyandu: async (req, res) => {
    const { nama, alamat, id_puskesmas, id_user } = req.body;
    let idPuskes;
    await model.Puskesmas.findOne({
      where: {
        uuid: id_puskesmas,
      },
    })
      .then((result) => {
        idPuskes = result.id;
      })
      .catch((err) => {
        console.log(err);
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", "Gagal Menambahkan Posyandu");
        res.redirect("/posyandu");
      });
    await model.Posyandus.create({
      nama,
      alamat,
      puskesmaId: idPuskes,
    })
      .then(async (result) => {
        const posyanduId = result.id
        await model.User.update({
          posyanduId
        }, {
          where: {
            id: id_user
          }
        })
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", `Posyandu Berhasil Ditambahkan`);
        res.status(201);
        res.redirect("/posyandu");
      })
      .catch((err) => {
        console.log(err);
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", "Gagal Menambahkan Posyandu");
        res.status(400);
        res.redirect("/posyandu");
      });
  },
  updatePosyandu: async (req, res) => {
    let { nama, alamat, id_user } = req.body;
    let redirectUri = "/posyandu"
    if (req.query.from && req.query.from == "profile") {
      redirectUri = "/profile"
    }
    const response = await model.Posyandus.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (!response) {
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "User tidak ditemukan",
      });
      res.redirect(redirectUri);
    }

    if (!nama) {
      nama = response.nama;
    }
    if (!alamat) {
      alamat = response.alamat;
    }

    await model.Posyandus.update(
      {
        nama,
        alamat,
      },
      {
        where: {
          uuid: req.params.uuid,
        },
      }
    )
      .then( async(result) => {
        if(id_user) {
          await model.User.update({
            posyanduId: response.id
          }, {
            where: {
              id: id_user
            }
          })
        }
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash(
          "message",
          `Berhasil Update Posyandu dengan nama ${response.nama}`
        );
        res.status(201);
        res.redirect(redirectUri);
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Gagal Update Posyandu baru",
        });
        res.redirect(redirectUri);
      });
  },
  deletePosyandu: async (req, res) => {
    const response = await model.Posyandus.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    let redirectUri = "/posyandu"
    if (req.query.from && req.query.from == "profile") {
      redirectUri = "/profile"
    }
    if (!response) {
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Posyandu tidak ditemukan",
      });
      res.redirect(redirectUri);
    }
    await model.Posyandus.destroy({
      where: {
        uuid: response.uuid,
      },
    })
      .then((result) => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash(
          "message",
          `Berhasil Hapus Posyandu dengan nama ${response.nama}`
        );
        res.status(200);
        res.redirect(redirectUri);
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Gagal Hapus Posyandu",
        });
        res.redirect(redirectUri);
      });
  },
};
